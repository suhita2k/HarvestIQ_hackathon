import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";

import { FieldValue } from "firebase-admin/firestore";

const profileSchema = z.object({
  state: z.string().optional().nullable(),
  district: z.string().optional().nullable(),
  village: z.string().optional().nullable(),
  preferredLanguage: z.string().optional(),
  farmSize: z.coerce.number().optional().nullable(),
  soilType: z.string().optional().nullable(),
  irrigationMethod: z.string().optional().nullable(),
  mainCrops: z.array(z.string()).optional(),
  farmingExperience: z.coerce.number().optional().nullable(),
  annualIncome: z.coerce.number().optional().nullable(),
  farmingGoals: z.string().optional().nullable(),
});

export async function GET() {
  const session = await getCurrentUser();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({
    user: {
      id: session.user.id,
      fullName: session.user.fullName,
      email: session.user.email,
      mobile: session.user.mobile,
      role: session.user.role,
      createdAt: session.user.createdAt,
    },
    profile: session.profile,
  });
}

export async function PUT(request: Request) {
  const session = await getCurrentUser();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json();
  const parsed = profileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  }

  // Ensure a farmerProfile exists
  if (session.profile?.id) {
    const profileRef = adminDb.collection("farmerProfiles").doc(session.profile.id);
    await profileRef.update({
      ...parsed.data,
      updatedAt: FieldValue.serverTimestamp(),
    });
    
    const updatedDoc = await profileRef.get();
    return NextResponse.json({ profile: { id: updatedDoc.id, ...updatedDoc.data() } });
  } else {
    // If no profile document exists, create it
    const newProfile = {
      userId: session.user.id,
      ...parsed.data,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };
    const docRef = adminDb.collection("farmerProfiles").doc(session.user.id);
    await docRef.set(newProfile);
    const updatedDoc = await docRef.get();
    return NextResponse.json({ profile: { id: updatedDoc.id, ...updatedDoc.data() } });
  }
}
