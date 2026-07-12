import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { join } from "path";
import { adminDb } from "@/lib/firebase-admin";
import { getCurrentUser } from "@/lib/auth";
import { chatCompletion, type ChatMessage } from "@/lib/groq";
import { checkRateLimit } from "@/lib/rate-limit";
import { CROPS } from "@/lib/constants";
import type { LanguageCode } from "@/lib/i18n";
import { generateToken } from "@/lib/utils";
import * as admin from "firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

async function trackUsage(userId: string, endpoint: string, model: string, tokens: number) {
  try {
    await adminDb.collection("aiUsage").add({
      userId,
      endpoint,
      model,
      tokens,
      createdAt: FieldValue.serverTimestamp(),
    });
  } catch {
    // ignore
  }
}

async function buildFarmerContext(userId: string): Promise<string> {
  const session = await getCurrentUser();
  if (!session?.profile) return "No farmer profile data available.";
  const p = session.profile;
  return [
    `Farmer: ${session.user.fullName}`,
    p.state ? `State: ${p.state}` : "",
    p.district ? `District: ${p.district}` : "",
    p.soilType ? `Soil Type: ${p.soilType}` : "",
    p.irrigationMethod ? `Irrigation: ${p.irrigationMethod}` : "",
    p.farmSize ? `Farm Size: ${p.farmSize} acres` : "",
    p.mainCrops?.length ? `Main Crops: ${p.mainCrops.join(", ")}` : "",
    p.farmingExperience ? `Experience: ${p.farmingExperience} years` : "",
    p.farmingGoals ? `Goals: ${p.farmingGoals}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ type: string }> }
) {
  const { type } = await params;
  const session = await getCurrentUser();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    if (type === "chats") {
      const snapshot = await adminDb
        .collection("chats")
        .where("userId", "==", session.user.id)
        .orderBy("updatedAt", "desc")
        .get();
      const userChats = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
      return NextResponse.json({ chats: userChats });
    }

    if (type === "disease-history") {
      const snapshot = await adminDb
        .collection("diseaseReports")
        .where("userId", "==", session.user.id)
        .orderBy("createdAt", "desc")
        .get();
      const history = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
      return NextResponse.json({ history });
    }

    if (type === "crop-history") {
      const snapshot = await adminDb
        .collection("cropRecommendations")
        .where("userId", "==", session.user.id)
        .orderBy("createdAt", "desc")
        .get();
      const history = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
      return NextResponse.json({ history });
    }

    return NextResponse.json({ error: "Not found" }, { status: 404 });
  } catch (error: any) {
    console.error(`AI API GET Error (${type}):`, error);
    if (error.code === 5 || error.message?.includes("NOT_FOUND")) {
      return NextResponse.json(
        { error: "Database not initialized. Please enable Firestore in your Firebase Console." },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ type: string }> }
) {
  const { type } = await params;
  const session = await getCurrentUser();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!checkRateLimit(request, 30, 60_000)) {
    return NextResponse.json({ error: "Too many requests. Please slow down." }, { status: 429 });
  }

  try {
    const language = (request.headers.get("x-language") ?? "en") as LanguageCode;
    const farmerContext = await buildFarmerContext(session.user.id);

    if (type === "chats") {
      const body = await request.json();
      const { chatId, title, messages } = body;
      if (chatId) {
        const docRef = adminDb.collection("chats").doc(chatId);
        await docRef.update({
          title,
          messages,
          updatedAt: FieldValue.serverTimestamp(),
        });
        const updated = (await docRef.get()).data();
        return NextResponse.json({ chat: { id: chatId, ...updated } });
      }
      const newChat = {
        userId: session.user.id,
        title: title ?? "New Chat",
        messages,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      };
      const docRef = await adminDb.collection("chats").add(newChat);
      const created = (await docRef.get()).data();
      return NextResponse.json({ chat: { id: docRef.id, ...created } }, { status: 201 });
    }

    if (type === "chat") {
      const body = await request.json();
      const { message, history = [] }: { message: string; history: ChatMessage[] } = body;

      const messages: ChatMessage[] = [
        ...history.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
        { role: "user" as const, content: message },
      ];

      const result = await chatCompletion(messages, { language, temperature: 0.5 });
      await trackUsage(session.user.id, "chat", result.model, result.tokens);
      return NextResponse.json({ content: result.content, model: result.model });
    }

    if (type === "disease") {
      const formData = await request.formData();
      const crop = formData.get("crop") as string;
      const symptoms = (formData.get("symptoms") as string) ?? "";
      const imageFile = formData.get("image") as File | null;

      let imagePath: string | null = null;
      if (imageFile && imageFile.size > 0) {
        const bytes = await imageFile.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const filename = `${generateToken()}-${imageFile.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
        const dir = join(process.cwd(), "public", "uploads");
        try {
          await writeFile(join(dir, filename), buffer);
          imagePath = `/uploads/${filename}`;
        } catch {
          const { mkdir } = await import("fs/promises");
          await mkdir(dir, { recursive: true });
          await writeFile(join(dir, filename), buffer);
          imagePath = `/uploads/${filename}`;
        }
      }

      const prompt = `A farmer is growing ${crop}. They report the following symptoms:\n${symptoms}\n\nPlease provide a detailed disease diagnosis with:\n## Disease Name\n## Causes\n## Symptoms\n## Severity (Low/Medium/High)\n## Organic Treatment\n## Chemical Treatment\n## Prevention\n## Best Practices\n\nIf you cannot determine the exact disease, provide the most likely possibilities.`;

      const messages: ChatMessage[] = [{ role: "user", content: prompt }];
      const result = await chatCompletion(messages, { language, temperature: 0.3, maxTokens: 1500 });
      await trackUsage(session.user.id, "disease", result.model, result.tokens);

      const diagnosis = { content: result.content, crop, symptoms, hasImage: Boolean(imagePath) };
      const docRef = await adminDb.collection("diseaseReports").add({
        userId: session.user.id,
        crop,
        symptoms,
        imagePath,
        diagnosis,
        createdAt: FieldValue.serverTimestamp(),
      });
      const report = { id: docRef.id, ...(await docRef.get()).data() };

      return NextResponse.json({ report, advice: result.content });
    }

    if (type === "crop-recommendation") {
      const body = await request.json();
      const { soilType, irrigationMethod, farmSize, season } = body;

      const suitableCrops = CROPS.filter((c: any) => {
        const soilMatch = !soilType || c.suitableSoils.includes(soilType);
        const waterMatch = !irrigationMethod ||
          (irrigationMethod === "Drip Irrigation" && c.waterRequirement !== "High") ||
          (irrigationMethod === "Flood Irrigation") ||
          (irrigationMethod === "Sprinkler Irrigation") ||
          true;
        return soilMatch && waterMatch;
      });

      const recommendations = suitableCrops.slice(0, 5).map((c: any) => {
        const expectedRevenue = c.expectedYieldPerAcre * c.marketPricePerQuintal * (farmSize ?? 1);
        const expectedProfit = expectedRevenue - c.costPerAcre * (farmSize ?? 1);
        return {
          name: c.name,
          season: c.season,
          duration: c.duration,
          waterRequirement: c.waterRequirement,
          expectedYieldPerAcre: c.expectedYieldPerAcre,
          marketPricePerQuintal: c.marketPricePerQuintal,
          costPerAcre: c.costPerAcre,
          expectedRevenue: Math.round(expectedRevenue),
          expectedProfit: Math.round(expectedProfit),
          fertilizerSchedule: "Apply basal dose of NPK 10-26-26 at sowing, top dress urea at 30 and 60 days.",
        };
      });

      const prompt = `Based on the farmer's context and these recommended crops: ${recommendations
        .map((r: any) => r.name)
        .join(", ")}, provide additional guidance on:\n## Crop Selection Rationale\n## Fertilizer Schedule\n## Irrigation Plan\n## Expected Timeline\n## Risk Factors\n\nFarmer context:\n${farmerContext}`;

      const messages: ChatMessage[] = [{ role: "user", content: prompt }];
      const result = await chatCompletion(messages, { language, temperature: 0.4 });
      await trackUsage(session.user.id, "crop-recommendation", result.model, result.tokens);

      const docRef = await adminDb.collection("cropRecommendations").add({
        userId: session.user.id,
        inputs: { soilType, irrigationMethod, farmSize, season },
        recommendations,
        createdAt: FieldValue.serverTimestamp(),
      });

      return NextResponse.json({ recommendations, advice: result.content, id: docRef.id });
    }

    if (type === "soil" || type === "irrigation" || type === "fertilizer" || type === "pest") {
      const body = await request.json();
      const { question, crop } = body;

      const topicGuidance: Record<string, string> = {
        soil: "soil management, fertility, pH, compost, organic matter, and nutrient management",
        irrigation: "irrigation methods, scheduling, water conservation, drip/sprinkler systems",
        fertilizer: "fertilizer recommendations including organic, bio, and chemical fertilizers with NPK ratios and application schedules",
        pest: "pest identification, organic control, biological control, chemical treatment, and prevention",
      };

      const prompt = `Farmer context:\n${farmerContext}\n\nQuestion about ${topicGuidance[type]}: ${question}\n${crop ? `Crop: ${crop}` : ""}\n\nProvide detailed, structured advice with sections using ## headings. Include practical steps, organic solutions, and chemical treatments where appropriate.`;

      const messages: ChatMessage[] = [{ role: "user", content: prompt }];
      const result = await chatCompletion(messages, { language, temperature: 0.4, maxTokens: 1500 });
      await trackUsage(session.user.id, type, result.model, result.tokens);

      return NextResponse.json({ advice: result.content });
    }

    if (type === "prediction") {
      const body = await request.json();
      const { crop, farmSize, investmentCost, expectedYield, marketPrice } = body;

      const cropData = CROPS.find((c: any) => c.name === crop);
      const finalInvestment = investmentCost ?? cropData?.costPerAcre ?? 0;
      const finalYield = expectedYield ?? cropData?.expectedYieldPerAcre ?? 0;
      const finalPrice = marketPrice ?? cropData?.marketPricePerQuintal ?? 0;

      const revenue = finalYield * finalPrice * (farmSize ?? 1);
      const netProfit = revenue - finalInvestment * (farmSize ?? 1);
      const riskLevel = netProfit > 50000 ? "Low" : netProfit > 0 ? "Medium" : "High";

      const prompt = `A farmer is growing ${crop} on ${farmSize ?? 1} acres.\n\nFinancial data:\n- Investment Cost: ₹${finalInvestment} per acre\n- Expected Yield: ${finalYield} quintals/acre\n- Market Price: ₹${finalPrice} per quintal\n- Expected Revenue: ₹${Math.round(revenue)}\n- Net Profit: ₹${Math.round(netProfit)}\n- Risk Level: ${riskLevel}\n\nProvide AI-powered insights:\n## Yield Improvement Tips\n## Cost Optimization\n## Market Strategy\n## Risk Mitigation\n## Best Practices\n\nFarmer context:\n${farmerContext}`;

      const messages: ChatMessage[] = [{ role: "user", content: prompt }];
      const result = await chatCompletion(messages, { language, temperature: 0.4 });
      await trackUsage(session.user.id, "prediction", result.model, result.tokens);

      return NextResponse.json({
        prediction: {
          crop,
          farmSize: farmSize ?? 1,
          investmentCost: finalInvestment,
          expectedYield: finalYield,
          marketPrice: finalPrice,
          revenue: Math.round(revenue),
          netProfit: Math.round(netProfit),
          riskLevel,
        },
        insights: result.content,
      });
    }

    return NextResponse.json({ error: "Unknown AI type" }, { status: 404 });
  } catch (error: any) {
    console.error(`AI API Error (${type}):`, error);
    if (error.code === 5 || error.message?.includes("NOT_FOUND")) {
      return NextResponse.json(
        { error: "Database not initialized. Please enable Firestore in your Firebase Console." },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: error.message || "Internal server error during analysis" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ type: string }> }
) {
  const { type } = await params;
  const session = await getCurrentUser();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    if (type === "chats") {
      const url = new URL(request.url);
      const chatId = url.searchParams.get("id");
      if (!chatId) return NextResponse.json({ error: "Chat ID required" }, { status: 400 });
      
      const chatRef = adminDb.collection("chats").doc(chatId);
      await chatRef.delete();
      
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Not found" }, { status: 404 });
  } catch (error: any) {
    console.error(`AI API DELETE Error (${type}):`, error);
    if (error.code === 5 || error.message?.includes("NOT_FOUND")) {
      return NextResponse.json(
        { error: "Database not initialized. Please enable Firestore in your Firebase Console." },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
