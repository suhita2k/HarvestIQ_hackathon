"use client";

import * as React from "react";
import { Sidebar } from "@/components/Sidebar";
import { Topbar } from "@/components/Topbar";

interface DashboardShellProps {
  userName: string;
  userRole: "farmer" | "admin";
  unreadNotifications: number;
  isAdmin: boolean;
  children: React.ReactNode;
}

export function DashboardShell({
  userName,
  userRole,
  unreadNotifications,
  isAdmin,
  children,
}: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isAdmin={isAdmin}
      />
      <div className="lg:pl-72">
        <Topbar
          onMenuClick={() => setSidebarOpen(true)}
          userName={userName}
          userRole={userRole}
          unreadNotifications={unreadNotifications}
        />
        <main className="min-h-[calc(100vh-4rem)] p-4 lg:p-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
