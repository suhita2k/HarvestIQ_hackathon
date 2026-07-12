"use client";

import * as React from "react";
import Link from "next/link";
import {
  Cloud, Bot, Bug, Sprout, Landmark, TrendingUp, BookOpen,
  Bell, Droplets, FlaskConical, Calendar, ArrowRight, Sparkles, Sun,
} from "lucide-react";
import { Card, Badge, Skeleton, Button } from "@/components/ui";
import { useApp } from "@/components/Providers";
import { FARMING_TIPS, FARMING_CALENDAR } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import toast from "react-hot-toast";

interface QuickLink {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
  color: string;
}

const QUICK_LINKS: QuickLink[] = [
  { href: "/dashboard/assistant", icon: Bot, title: "AI Assistant", desc: "Ask anything about farming", color: "from-purple-500 to-indigo-600" },
  { href: "/dashboard/disease", icon: Bug, title: "Disease Advisory", desc: "Detect crop diseases", color: "from-red-500 to-rose-600" },
  { href: "/dashboard/crop-recommendation", icon: Sprout, title: "Crop Recommendation", desc: "Find the best crops", color: "from-emerald-500 to-green-600" },
  { href: "/dashboard/weather", icon: Cloud, title: "Weather", desc: "7-day forecast & advice", color: "from-blue-500 to-cyan-600" },
  { href: "/dashboard/schemes", icon: Landmark, title: "Govt Schemes", desc: "Subsidies & programs", color: "from-amber-500 to-orange-600" },
  { href: "/dashboard/market", icon: TrendingUp, title: "Market Prices", desc: "Live crop prices", color: "from-teal-500 to-emerald-600" },
  { href: "/dashboard/knowledge", icon: BookOpen, title: "Knowledge Center", desc: "Expert articles", color: "from-pink-500 to-rose-600" },
];

export default function DashboardPage() {
  const { t } = useApp();
  const [weather, setWeather] = React.useState<any>(null);
  const [weatherLoading, setWeatherLoading] = React.useState(true);
  const [notifications, setNotifications] = React.useState<any[]>([]);
  const [tip, setTip] = React.useState(FARMING_TIPS[0]);
  const [currentMonth, setCurrentMonth] = React.useState(FARMING_CALENDAR[0]);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    setTip(FARMING_TIPS[Math.floor(Math.random() * FARMING_TIPS.length)]);
    setCurrentMonth(FARMING_CALENDAR[new Date().getMonth()]);

    fetch("/api/weather")
      .then((r) => r.json())
      .then((data) => {
        if (data.current) setWeather(data);
      })
      .catch(() => {})
      .finally(() => setWeatherLoading(false));

    fetch("/api/data/notifications")
      .then((r) => r.json())
      .then((data) => setNotifications(data.notifications ?? []))
      .catch(() => {});
  }, []);

  const handleAskAI = () => {
    toast("Opening AI Assistant...", { icon: "🤖" });
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 p-6 text-white shadow-lg shadow-emerald-500/20 sm:p-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-emerald-50">{t("label_welcome")}</p>
            <h1 className="mt-1 text-2xl font-bold sm:text-3xl">{t("appName")} Dashboard</h1>
            <p className="mt-2 max-w-lg text-sm text-emerald-50">
              Your AI-powered farming companion. Get personalized advice, monitor weather,
              track finances, and boost your yield.
            </p>
          </div>
          <div className="hidden sm:block">
            <Sparkles className="h-16 w-16 text-emerald-200/50" />
          </div>
        </div>
      </div>

      {/* Weather + Tip */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900 dark:text-white">{t("label_weather")}</h3>
            <Cloud className="h-5 w-5 text-blue-500" />
          </div>
          {weatherLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-8 w-2/3" />
            </div>
          ) : weather ? (
            <div>
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://openweathermap.org/img/wn/${weather.current.icon}@2x.png`}
                  alt={weather.current.description}
                  className="h-14 w-14"
                />
                <div>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">
                    {weather.current.temperature}°C
                  </p>
                  <p className="text-sm capitalize text-slate-500">{weather.current.description}</p>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-lg bg-slate-50 p-2 dark:bg-slate-800">
                  <p className="text-slate-400">Humidity</p>
                  <p className="font-semibold text-slate-700 dark:text-slate-200">{weather.current.humidity}%</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-2 dark:bg-slate-800">
                  <p className="text-slate-400">Wind</p>
                  <p className="font-semibold text-slate-700 dark:text-slate-200">{weather.current.windSpeed} km/h</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-2 dark:bg-slate-800">
                  <p className="text-slate-400">UV Index</p>
                  <p className="font-semibold text-slate-700 dark:text-slate-200">{weather.current.uvIndex}</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-2 dark:bg-slate-800">
                  <p className="text-slate-400">Rain Prob.</p>
                  <p className="font-semibold text-slate-700 dark:text-slate-200">{weather.current.rainProbability}%</p>
                </div>
              </div>
              <p className="mt-3 text-xs text-emerald-600">{weather.advice}</p>
            </div>
          ) : (
            <div className="rounded-lg bg-amber-50 p-3 text-xs text-amber-700 dark:bg-amber-900/20 dark:text-amber-300">
              Weather data unavailable.
            </div>
          )}
        </Card>

        <Card className="lg:col-span-2">
          <div className="mb-3 flex items-center gap-2">
            <Sun className="h-5 w-5 text-amber-500" />
            <h3 className="font-semibold text-slate-900 dark:text-white">{t("label_today_tip")}</h3>
          </div>
          {mounted ? (
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{tip}</p>
          ) : (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          )}
          <div className="mt-4 rounded-xl bg-gradient-to-br from-emerald-50 to-green-50 p-4 dark:from-emerald-900/20 dark:to-green-900/20">
            <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              Need personalized advice?
            </p>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              Ask the AI Assistant for crop-specific guidance in your language.
            </p>
            <Link href="/dashboard/assistant">
              <Button size="sm" className="mt-3">
                <Bot className="h-4 w-4" /> Ask AI Assistant
              </Button>
            </Link>
          </div>
        </Card>
      </div>

      {/* Quick Links */}
      <div>
        <h2 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">Quick Access</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {QUICK_LINKS.map((link) => (
            <Link key={link.href} href={link.href}>
              <Card className="h-full transition-all hover:-translate-y-1 hover:shadow-md">
                <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${link.color} text-white`}>
                  <link.icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white">{link.title}</h3>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{link.desc}</p>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Farming Calendar + Notifications */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <div className="mb-3 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-emerald-500" />
            <h3 className="font-semibold text-slate-900 dark:text-white">
              Farming Calendar — {mounted ? currentMonth.month : "..."}
            </h3>
          </div>
          <ul className="space-y-2">
            {mounted ? (
              currentMonth.activities.map((activity: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                  {activity}
                </li>
              ))
            ) : (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/6" />
              </div>
            )}
          </ul>
        </Card>

        <Card>
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-amber-500" />
              <h3 className="font-semibold text-slate-900 dark:text-white">Recent Notifications</h3>
            </div>
            <Link href="/dashboard/notifications" className="text-xs font-medium text-emerald-600 hover:underline">
              View all
            </Link>
          </div>
          {notifications.length === 0 ? (
            <p className="text-sm text-slate-400">No notifications</p>
          ) : (
            <ul className="space-y-2">
              {notifications.slice(0, 4).map((n) => (
                <li key={n.id} className="rounded-lg border border-slate-100 p-3 dark:border-slate-800">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{n.title}</p>
                    <Badge color={n.read ? "slate" : "emerald"}>{n.type.replace(/_/g, " ")}</Badge>
                  </div>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{n.message}</p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {/* Analytics Cards */}
      <div>
        <h2 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">{t("label_analytics")}</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnalyticsCard icon={Sprout} label="Active Crops" value={weather ? "— " : "0"} color="emerald" />
          <AnalyticsCard icon={Bot} label="AI Chats" value="—" color="purple" />
          <AnalyticsCard icon={TrendingUp} label="Market Trends" value="—" color="blue" />
        </div>
      </div>
    </div>
  );
}

function AnalyticsCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  color: "emerald" | "violet" | "purple" | "blue";
}) {
  const colors: Record<string, string> = {
    emerald: "from-emerald-500 to-green-600",
    violet: "from-violet-500 to-purple-600",
    purple: "from-purple-500 to-indigo-600",
    blue: "from-blue-500 to-cyan-600",
  };
  return (
    <Card>
      <div className="flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${colors[color]} text-white`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
          <p className="text-xl font-bold text-slate-900 dark:text-white">{value}</p>
        </div>
      </div>
    </Card>
  );
}
