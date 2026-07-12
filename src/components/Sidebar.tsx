"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Bot, Bug, Sprout, Cloud, Shovel as SoilIcon, Droplets,
  FlaskConical, Bug as BugIcon, Landmark, TrendingUp, BookOpen,
  Bell, User, Shield, Leaf, X,
} from "lucide-react";
import { cn } from "@/components/ui";
import { useApp } from "@/components/Providers";
import type { LanguageCode } from "@/lib/i18n";

interface NavItem {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  labelKey: string;
  adminOnly?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", icon: LayoutDashboard, labelKey: "nav_dashboard" },
  { href: "/dashboard/assistant", icon: Bot, labelKey: "nav_assistant" },
  { href: "/dashboard/disease", icon: Bug, labelKey: "nav_disease" },
  { href: "/dashboard/crop-recommendation", icon: Sprout, labelKey: "nav_crop" },
  { href: "/dashboard/weather", icon: Cloud, labelKey: "nav_weather" },
  { href: "/dashboard/guidance?tab=soil", icon: SoilIcon, labelKey: "nav_soil" },
  { href: "/dashboard/guidance?tab=irrigation", icon: Droplets, labelKey: "nav_irrigation" },
  { href: "/dashboard/guidance?tab=fertilizer", icon: FlaskConical, labelKey: "nav_fertilizer" },
  { href: "/dashboard/guidance?tab=pest", icon: BugIcon, labelKey: "nav_pest" },
  { href: "/dashboard/schemes", icon: Landmark, labelKey: "nav_schemes" },
  { href: "/dashboard/market", icon: TrendingUp, labelKey: "nav_market" },
  { href: "/dashboard/knowledge", icon: BookOpen, labelKey: "nav_knowledge" },
  { href: "/dashboard/prediction", icon: TrendingUp, labelKey: "nav_prediction" },
  { href: "/dashboard/notifications", icon: Bell, labelKey: "nav_notifications" },
  { href: "/dashboard/profile", icon: User, labelKey: "nav_profile" },
];

export function Sidebar({
  open,
  onClose,
  isAdmin = false,
}: {
  open: boolean;
  onClose: () => void;
  isAdmin?: boolean;
}) {
  const pathname = usePathname();
  const { t } = useApp();

  const items = isAdmin ? [...NAV_ITEMS, { href: "/admin", icon: Shield, labelKey: "nav_admin" }] : NAV_ITEMS;

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 flex h-screen w-72 flex-col border-r border-slate-200 bg-white transition-transform duration-300 dark:border-slate-800 dark:bg-slate-900 lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-500/30">
              <Leaf className="h-5 w-5" />
            </div>
            <div>
              <span className="text-lg font-bold text-slate-900 dark:text-white">HarvestIQ</span>
              <p className="text-[10px] uppercase tracking-wider text-emerald-600">Smart Agriculture</p>
            </div>
          </Link>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-1">
            {items.map((item) => {
              const isActive =
                item.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname.startsWith(item.href.split("?")[0]);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                      isActive
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                    )}
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    <span>{t(item.labelKey)}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t border-slate-200 px-6 py-4 dark:border-slate-800">
          <div className="rounded-xl bg-gradient-to-br from-emerald-50 to-green-50 p-4 dark:from-emerald-900/20 dark:to-green-900/20">
            <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">AI-Powered Farming</p>
            <p className="mt-1 text-[11px] text-slate-600 dark:text-slate-400">
              Ask your AI assistant anytime for personalized advice.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
