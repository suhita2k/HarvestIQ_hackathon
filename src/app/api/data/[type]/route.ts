import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { getCurrentUser } from "@/lib/auth";
import { ensureSeeded } from "@/lib/seed";
import * as admin from "firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ type: string }> }
) {
  const { type } = await params;
  
  try {
    await ensureSeeded();
  } catch (e) {
    // ignore
  }

  const url = new URL(request.url);
  const category = url.searchParams.get("category");
  const q = url.searchParams.get("q");

  if (type === "schemes") {
    const snapshot = await adminDb.collection("governmentSchemes").get();
    const list = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json({ schemes: list });
  }

  if (type === "articles") {
    let query: any = adminDb.collection("articles");
    if (category) {
      query = query.where("category", "==", category);
    }
    const snapshot = await query.orderBy("publishedAt", "desc").get();
    const list = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json({ articles: list });
  }

  if (type === "market") {
    const crop = url.searchParams.get("crop");
    const snapshot = await adminDb.collection("marketPrices").get();
    let list = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() as any }));
    if (crop) {
      list = list.filter((p: any) => p.crop.toLowerCase().includes(crop.toLowerCase()));
    }
    return NextResponse.json({ prices: list });
  }

  if (type === "notifications") {
    const session = await getCurrentUser();
    
    // Firestore OR queries for userId = null OR userId = session.user.id are tricky.
    // Instead we do two queries and merge.
    const globalSnapshot = await adminDb.collection("notifications").where("userId", "==", null).get();
    const globalList = globalSnapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() as any }));
    
    let list = [...globalList];
    
    if (session) {
      const userSnapshot = await adminDb.collection("notifications").where("userId", "==", session.user.id).get();
      const userList = userSnapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() as any }));
      list = [...list, ...userList];
    }
    
    // sort locally by createdAt desc
    list.sort((a: any, b: any) => {
      const da = a.createdAt?.toMillis ? a.createdAt.toMillis() : new Date(a.createdAt).getTime();
      const db = b.createdAt?.toMillis ? b.createdAt.toMillis() : new Date(b.createdAt).getTime();
      return db - da;
    });

    return NextResponse.json({ notifications: list });
  }

  if (type === "search") {
    const session = await getCurrentUser();
    const query = (q ?? "").toLowerCase();
    if (!query) return NextResponse.json({ results: [] });

    const [schemeSnapshot, articleSnapshot, marketSnapshot] = await Promise.all([
      adminDb.collection("governmentSchemes").get(),
      adminDb.collection("articles").get(),
      adminDb.collection("marketPrices").get(),
    ]);

    const schemeResults = schemeSnapshot.docs.map((d: any) => d.data() as any);
    const articleResults = articleSnapshot.docs.map((d: any) => d.data() as any);
    const marketResults = marketSnapshot.docs.map((d: any) => d.data() as any);

    const results: Array<{ type: string; title: string; description: string; href: string }> = [];

    for (const s of schemeResults) {
      if (s.name.toLowerCase().includes(query) || s.description?.toLowerCase().includes(query)) {
        results.push({
          type: "Government Scheme",
          title: s.name,
          description: s.description?.slice(0, 120) ?? "",
          href: "/dashboard/schemes",
        });
      }
    }
    for (const a of articleResults) {
      if (a.title.toLowerCase().includes(query) || a.summary?.toLowerCase().includes(query) || a.content?.toLowerCase().includes(query)) {
        results.push({
          type: "Article",
          title: a.title,
          description: a.summary ?? "",
          href: "/dashboard/knowledge",
        });
      }
    }
    for (const m of marketResults) {
      if (m.crop.toLowerCase().includes(query) || m.market.toLowerCase().includes(query)) {
        results.push({
          type: "Market Price",
          title: `${m.crop} — ${m.market}`,
          description: `₹${m.price} per ${m.unit}`,
          href: "/dashboard/market",
        });
      }
    }

    if (session) {
      const userChats = await adminDb.collection("chats").where("userId", "==", session.user.id).get();
      for (const doc of userChats.docs) {
        const c = doc.data() as any;
        if (c.title.toLowerCase().includes(query)) {
          results.push({
            type: "AI Chat",
            title: c.title,
            description: `${c.messages?.length ?? 0} messages`,
            href: "/dashboard/assistant",
          });
        }
      }
    }

    return NextResponse.json({ results: results.slice(0, 20) });
  }

  return NextResponse.json({ error: "Not found" }, { status: 404 });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ type: string }> }
) {
  const { type } = await params;
  const session = await getCurrentUser();
  if (!session || session.user.role !== "admin") {
    // If not admin, maybe check if it's user feedback? 
    if (type !== "feedback") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }
  }

  const body = await request.json();

  if (type === "schemes") {
    const docRef = await adminDb.collection("governmentSchemes").add({
      ...body,
      createdAt: FieldValue.serverTimestamp(),
    });
    const doc = await docRef.get();
    return NextResponse.json({ scheme: { id: doc.id, ...doc.data() } }, { status: 201 });
  }

  if (type === "articles") {
    const slug = body.slug ?? body.title?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const docRef = await adminDb.collection("articles").add({
      ...body,
      slug,
      publishedAt: FieldValue.serverTimestamp(),
      createdAt: FieldValue.serverTimestamp(),
    });
    const doc = await docRef.get();
    return NextResponse.json({ article: { id: doc.id, ...doc.data() } }, { status: 201 });
  }

  if (type === "notifications") {
    const docRef = await adminDb.collection("notifications").add({
      userId: null,
      ...body,
      createdAt: FieldValue.serverTimestamp(),
    });
    const doc = await docRef.get();
    return NextResponse.json({ notification: { id: doc.id, ...doc.data() } }, { status: 201 });
  }

  if (type === "feedback") {
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const docRef = await adminDb.collection("feedback").add({
      userId: session.user.id,
      message: body.message,
      rating: body.rating ?? 5,
      createdAt: FieldValue.serverTimestamp(),
    });
    const doc = await docRef.get();
    return NextResponse.json({ feedback: { id: doc.id, ...doc.data() } }, { status: 201 });
  }

  return NextResponse.json({ error: "Not found" }, { status: 404 });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ type: string }> }
) {
  const { type } = await params;
  const session = await getCurrentUser();
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  if (type === "schemes") {
    await adminDb.collection("governmentSchemes").doc(id).delete();
    return NextResponse.json({ success: true });
  }
  if (type === "articles") {
    await adminDb.collection("articles").doc(id).delete();
    return NextResponse.json({ success: true });
  }
  if (type === "notifications") {
    await adminDb.collection("notifications").doc(id).delete();
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Not found" }, { status: 404 });
}
