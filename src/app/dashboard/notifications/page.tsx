"use client";

import * as React from "react";
import { Bell, Cloud, Sun, TrendingUp, Landmark, Bug } from "lucide-react";
import { Card, Badge, PageHeader, Skeleton, EmptyState } from "@/components/ui";
import { timeAgo } from "@/lib/utils";

const TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  rainfall: Cloud,
  heatwave: Sun,
  disease_outbreak: Bug,
  market_price: TrendingUp,
  scheme_update: Landmark,
};

const TYPE_COLORS: Record<string, "blue" | "amber" | "red" | "emerald" | "purple"> = {
  rainfall: "blue",
  heatwave: "amber",
  disease_outbreak: "red",
  market_price: "emerald",
  scheme_update: "purple",
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [filter, setFilter] = React.useState("all");

  React.useEffect(() => {
    fetch("/api/data/notifications")
      .then((r) => r.json())
      .then((d) => setNotifications(d.notifications ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const types = Array.from(new Set(notifications.map((n) => n.type)));
  const filtered = filter === "all" ? notifications : notifications.filter((n) => n.type === filter);

  return (
    <div>
      <PageHeader
        title="Notifications"
        subtitle="Stay updated on weather, market prices, schemes, and disease alerts"
      />

      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setFilter("all")}
          className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
            filter === "all" ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
          }`}
        >
          All
        </button>
        {types.map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
              filter === type ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
            }`}
          >
            {type.replace(/_/g, " ")}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={<Bell className="h-12 w-12" />} title="No notifications" description="You're all caught up!" />
      ) : (
        <div className="space-y-3">
          {filtered.map((n) => {
            const Icon = TYPE_ICONS[n.type] ?? Bell;
            const color = TYPE_COLORS[n.type] ?? "slate";
            return (
              <Card key={n.id}>
                <div className="flex items-start gap-3">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-${color}-100 text-${color}-600 dark:bg-${color}-900/20`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-slate-900 dark:text-white">{n.title}</h3>
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{n.message}</p>
                      </div>
                      <Badge color={color}>{n.type.replace(/_/g, " ")}</Badge>
                    </div>
                    <p className="mt-2 text-xs text-slate-400">{timeAgo(n.createdAt)}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
