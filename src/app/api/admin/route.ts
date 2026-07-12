import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { getCurrentUser } from "@/lib/auth";


export async function GET(request: Request) {
  const session = await getCurrentUser();
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const url = new URL(request.url);
  const tab = url.searchParams.get("tab") ?? "overview";

  if (tab === "overview") {
    const [
      usersCountSnap,
      articlesCountSnap,
      schemesCountSnap,
      notificationsCountSnap,
      chatsCountSnap,
      aiUsageCountSnap,
      feedbackCountSnap
    ] = await Promise.all([
      adminDb.collection("users").count().get(),
      adminDb.collection("articles").count().get(),
      adminDb.collection("governmentSchemes").count().get(),
      adminDb.collection("notifications").count().get(),
      adminDb.collection("chats").count().get(),
      adminDb.collection("aiUsage").count().get(),
      adminDb.collection("feedback").count().get(),
    ]);

    // Firestore doesn't have an easy sum() aggregation yet, so we have to fetch docs for totalTokens
    // or just leave it out/approximate if too large. For now, we'll fetch them.
    const aiUsageDocs = await adminDb.collection("aiUsage").select("tokens").get();
    let totalTokens = 0;
    aiUsageDocs.forEach((d: any) => {
      totalTokens += (d.data().tokens ?? 0);
    });

    return NextResponse.json({
      stats: {
        totalUsers: usersCountSnap.data().count,
        totalArticles: articlesCountSnap.data().count,
        totalSchemes: schemesCountSnap.data().count,
        totalNotifications: notificationsCountSnap.data().count,
        totalChats: chatsCountSnap.data().count,
        aiCalls: aiUsageCountSnap.data().count,
        totalTokens,
        feedbackCount: feedbackCountSnap.data().count,
      },
    });
  }

  if (tab === "users") {
    const snapshot = await adminDb.collection("users").orderBy("createdAt", "desc").get();
    const list = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json({ users: list });
  }

  if (tab === "ai-usage") {
    const snapshot = await adminDb.collection("aiUsage").orderBy("createdAt", "desc").limit(100).get();
    const list = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() as any }));
    const byEndpoint: Record<string, number> = {};
    for (const item of list) {
      byEndpoint[item.endpoint] = (byEndpoint[item.endpoint] ?? 0) + 1;
    }
    return NextResponse.json({ list, byEndpoint });
  }

  if (tab === "feedback") {
    const snapshot = await adminDb.collection("feedback").orderBy("createdAt", "desc").get();
    const list = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json({ feedback: list });
  }

  if (tab === "articles") {
    const snapshot = await adminDb.collection("articles").orderBy("publishedAt", "desc").get();
    const list = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json({ articles: list });
  }

  if (tab === "schemes") {
    const snapshot = await adminDb.collection("governmentSchemes").get();
    const list = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json({ schemes: list });
  }

  return NextResponse.json({ error: "Unknown tab" }, { status: 404 });
}

export async function DELETE(request: Request) {
  const session = await getCurrentUser();
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const url = new URL(request.url);
  const userId = url.searchParams.get("userId");
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

  if (userId === session.user.id) {
    return NextResponse.json({ error: "Cannot delete yourself" }, { status: 400 });
  }

  try {
    await adminAuth.deleteUser(userId);
    await adminDb.collection("users").doc(userId).delete();
    
    // Also delete profiles, etc.
    const profiles = await adminDb.collection("farmerProfiles").where("userId", "==", userId).get();
    for (const doc of profiles.docs) {
      await doc.ref.delete();
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
