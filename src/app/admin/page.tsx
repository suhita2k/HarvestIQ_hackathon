"use client";

import * as React from "react";
import {
  Shield, Users, Bot, MessageSquare, BarChart3, Trash2,
  Plus, FileText, Landmark, Bell, Loader2,
} from "lucide-react";
import { Button, Card, Badge, PageHeader, Skeleton, EmptyState } from "@/components/ui";
import toast from "react-hot-toast";
import { formatDateTime, formatDate } from "@/lib/utils";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";

type Tab = "overview" | "users" | "ai-usage" | "feedback" | "articles" | "schemes";

const TABS: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "overview", label: "Overview", icon: BarChart3 },
  { id: "users", label: "Users", icon: Users },
  { id: "ai-usage", label: "AI Usage", icon: Bot },
  { id: "feedback", label: "Feedback", icon: MessageSquare },
  { id: "articles", label: "Articles", icon: FileText },
  { id: "schemes", label: "Schemes", icon: Landmark },
];

export default function AdminPage() {
  const [tab, setTab] = React.useState<Tab>("overview");
  const [data, setData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  const loadData = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin?tab=${tab}`);
      const json = await res.json();
      setData(json);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [tab]);

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
  }, [loadData]);

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Delete this user? This cannot be undone.")) return;
    try {
      const res = await fetch(`/api/admin?userId=${userId}`, { method: "DELETE" });
      if (!res.ok) {
        const json = await res.json();
        toast.error(json.error ?? "Failed to delete");
        return;
      }
      toast.success("User deleted");
      await loadData();
    } catch {
      toast.error("Network error");
    }
  };

  const handleDeleteItem = async (type: string, id: string) => {
    if (!confirm("Delete this item?")) return;
    try {
      const res = await fetch(`/api/data/${type}?id=${id}`, { method: "DELETE" });
      if (!res.ok) {
        toast.error("Failed to delete");
        return;
      }
      toast.success("Deleted");
      await loadData();
    } catch {
      toast.error("Network error");
    }
  };

  return (
    <div>
      <PageHeader
        title="Admin Panel"
        subtitle="Manage users, monitor AI usage, and review content"
      />

      {/* Tabs */}
      <div className="mb-6 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
              tab === t.id
                ? "bg-emerald-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            }`}
          >
            <t.icon className="h-4 w-4" /> {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : (
        <>
          {/* Overview */}
          {tab === "overview" && data?.stats && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard icon={Users} label="Total Users" value={data.stats.totalUsers} color="blue" />
              <StatCard icon={FileText} label="Articles" value={data.stats.totalArticles} color="purple" />
              <StatCard icon={Landmark} label="Schemes" value={data.stats.totalSchemes} color="amber" />
              <StatCard icon={Bell} label="Notifications" value={data.stats.totalNotifications} color="emerald" />
              <StatCard icon={Bot} label="AI Chats" value={data.stats.totalChats} color="purple" />
              <StatCard icon={BarChart3} label="AI API Calls" value={data.stats.aiCalls} color="blue" />
              <StatCard icon={Bot} label="Total Tokens" value={data.stats.totalTokens} color="emerald" />
              <StatCard icon={MessageSquare} label="Feedback" value={data.stats.feedbackCount} color="amber" />
            </div>
          )}

          {/* Users */}
          {tab === "users" && (
            <Card>
              <h3 className="mb-4 font-semibold text-slate-900 dark:text-white">User Management</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-left dark:border-slate-800">
                      <th className="pb-2 pr-4 font-semibold text-slate-500">Name</th>
                      <th className="pb-2 pr-4 font-semibold text-slate-500">Email</th>
                      <th className="pb-2 pr-4 font-semibold text-slate-500">Role</th>
                      <th className="pb-2 pr-4 font-semibold text-slate-500">Joined</th>
                      <th className="pb-2 font-semibold text-slate-500">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.users?.map((u: any) => (
                      <tr key={u.id} className="border-b border-slate-50 dark:border-slate-800/50">
                        <td className="py-3 pr-4 font-medium text-slate-800 dark:text-slate-200">{u.fullName}</td>
                        <td className="py-3 pr-4 text-slate-600 dark:text-slate-400">{u.email}</td>
                        <td className="py-3 pr-4">
                          <Badge color={u.role === "admin" ? "purple" : "emerald"}>{u.role}</Badge>
                        </td>
                        <td className="py-3 pr-4 text-slate-400">{formatDate(u.createdAt)}</td>
                        <td className="py-3">
                          {u.role !== "admin" && (
                            <button onClick={() => handleDeleteUser(u.id)} className="text-red-400 hover:text-red-600">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* AI Usage */}
          {tab === "ai-usage" && (
            <div className="space-y-6">
              <Card>
                <h3 className="mb-4 font-semibold text-slate-900 dark:text-white">AI Usage by Endpoint</h3>
                {Object.keys(data.byEndpoint ?? {}).length > 0 ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={Object.entries(data.byEndpoint).map(([name, value]) => ({ name, value }))}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                        <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" />
                        <Tooltip contentStyle={{ background: "#1e293b", border: "none", borderRadius: 8, color: "#fff" }} />
                        <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                          {Object.entries(data.byEndpoint).map((_, i) => (
                            <Cell key={i} fill={`hsl(${(i * 50) % 360}, 70%, 50%)`} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <EmptyState icon={<Bot className="h-12 w-12" />} title="No AI usage data" />
                )}
              </Card>
              <Card>
                <h3 className="mb-4 font-semibold text-slate-900 dark:text-white">Recent AI Calls</h3>
                {data.list?.length > 0 ? (
                  <div className="space-y-2">
                    {data.list.slice(0, 20).map((item: any) => (
                      <div key={item.id} className="flex items-center justify-between rounded-lg border border-slate-100 p-2 dark:border-slate-800">
                        <div>
                          <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{item.endpoint}</p>
                          <p className="text-xs text-slate-400">{formatDateTime(item.createdAt)}</p>
                        </div>
                        <div className="flex gap-2">
                          <Badge color="blue">{item.model}</Badge>
                          <Badge color="emerald">{item.tokens} tokens</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState icon={<Bot className="h-12 w-12" />} title="No AI calls yet" />
                )}
              </Card>
            </div>
          )}

          {/* Feedback */}
          {tab === "feedback" && (
            <Card>
              <h3 className="mb-4 font-semibold text-slate-900 dark:text-white">User Feedback</h3>
              {data.feedback?.length > 0 ? (
                <div className="space-y-3">
                  {data.feedback.map((f: any) => (
                    <div key={f.id} className="rounded-lg border border-slate-100 p-3 dark:border-slate-800">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{f.userId}</span>
                          <Badge color="amber">★ {f.rating}</Badge>
                        </div>
                        <span className="text-xs text-slate-400">{formatDateTime(f.createdAt)}</span>
                      </div>
                      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{f.message}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState icon={<MessageSquare className="h-12 w-12" />} title="No feedback yet" />
              )}
            </Card>
          )}

          {/* Articles Management */}
          {tab === "articles" && (
            <Card>
              <h3 className="mb-4 font-semibold text-slate-900 dark:text-white">Articles Management</h3>
              {data.articles?.length > 0 ? (
                <div className="space-y-2">
                  {data.articles.map((a: any) => (
                    <div key={a.id} className="group flex items-center justify-between rounded-lg border border-slate-100 p-3 dark:border-slate-800">
                      <div>
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{a.title}</p>
                        <p className="text-xs text-slate-400">{a.category} · {formatDate(a.publishedAt)}</p>
                      </div>
                      <button onClick={() => handleDeleteItem("articles", a.id)} className="opacity-0 group-hover:opacity-100">
                        <Trash2 className="h-4 w-4 text-red-400 hover:text-red-600" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState icon={<FileText className="h-12 w-12" />} title="No articles" />
              )}
            </Card>
          )}

          {/* Schemes Management */}
          {tab === "schemes" && (
            <Card>
              <h3 className="mb-4 font-semibold text-slate-900 dark:text-white">Schemes Management</h3>
              {data.schemes?.length > 0 ? (
                <div className="space-y-2">
                  {data.schemes.map((s: any) => (
                    <div key={s.id} className="group flex items-center justify-between rounded-lg border border-slate-100 p-3 dark:border-slate-800">
                      <div>
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{s.name}</p>
                        <p className="text-xs text-slate-400">{s.ministry}</p>
                      </div>
                      <button onClick={() => handleDeleteItem("schemes", s.id)} className="opacity-0 group-hover:opacity-100">
                        <Trash2 className="h-4 w-4 text-red-400 hover:text-red-600" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState icon={<Landmark className="h-12 w-12" />} title="No schemes" />
              )}
            </Card>
          )}
        </>
      )}
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  color: "blue" | "purple" | "amber" | "emerald";
}) {
  const colors: Record<string, string> = {
    blue: "from-blue-500 to-cyan-600",
    purple: "from-purple-500 to-indigo-600",
    amber: "from-amber-500 to-orange-600",
    emerald: "from-emerald-500 to-green-600",
  };
  return (
    <Card>
      <div className="flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${colors[color]} text-white`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs text-slate-400">{label}</p>
          <p className="text-xl font-bold text-slate-900 dark:text-white">{value}</p>
        </div>
      </div>
    </Card>
  );
}
