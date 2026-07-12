import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { adminDb } from "@/lib/firebase-admin";
import { getCurrentUser } from "@/lib/auth";
import { ensureSeeded } from "@/lib/seed";
import { DashboardShell } from "./dashboard-shell";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await getCurrentUser();
  console.log("[dashboard/layout] Session check:", session ? `found user ${session.user.email}` : "NO SESSION - redirecting to login");
  if (!session) {
    redirect("/api/auth/clear-session");
  }

  try {
    await ensureSeeded();
  } catch {
    // ignore
  }

  let unreadCount = 0;
  try {
    const [globalNotifs, userNotifs] = await Promise.all([
      adminDb.collection("notifications").where("userId", "==", null).where("read", "==", false).count().get(),
      adminDb.collection("notifications").where("userId", "==", session.user.id).where("read", "==", false).count().get()
    ]);
    unreadCount = globalNotifs.data().count + userNotifs.data().count;
  } catch {
    // ignore
  }

  return (
    <DashboardShell
      userName={session.user.fullName}
      userRole={session.user.role}
      unreadNotifications={unreadCount}
      isAdmin={session.user.role === "admin"}
    >
      {children}
    </DashboardShell>
  );
}
