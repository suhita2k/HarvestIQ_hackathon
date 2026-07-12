"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Menu, Moon, Sun, Search, Globe, LogOut, Bell } from "lucide-react";
import { cn } from "@/components/ui";
import { useApp } from "@/components/Providers";
import { LANGUAGES, type LanguageCode } from "@/lib/i18n";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import toast from "react-hot-toast";

interface TopbarProps {
  onMenuClick: () => void;
  userName: string;
  userRole: "farmer" | "admin";
  unreadNotifications: number;
}

export function Topbar({ onMenuClick, userName, userRole, unreadNotifications }: TopbarProps) {
  const router = useRouter();
  const { theme, toggleTheme, language, setLanguage, t } = useApp();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [langOpen, setLangOpen] = React.useState(false);
  const [userOpen, setUserOpen] = React.useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/dashboard?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch {
      // ignore client signout errors
    }
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    toast.success(t("msg_logout_success"));
    // Use full page navigation to ensure cookie is cleared
    window.location.href = "/login";
  };

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/80 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80">
      <div className="flex h-16 items-center gap-3 px-4 lg:px-8">
        <button
          onClick={onMenuClick}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        <form onSubmit={handleSearch} className="relative hidden flex-1 sm:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("label_search_placeholder")}
            className="w-full max-w-md rounded-xl border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100 dark:focus:bg-slate-800"
          />
        </form>

        <div className="ml-auto flex items-center gap-1.5">
          <button
            onClick={() => router.push("/dashboard/notifications")}
            className="relative rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            <Bell className="h-5 w-5" />
            {unreadNotifications > 0 && (
              <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                {unreadNotifications > 9 ? "9+" : unreadNotifications}
              </span>
            )}
          </button>

          <div className="relative">
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              <Globe className="h-5 w-5" />
              <span className="hidden text-sm font-medium uppercase sm:inline">{language}</span>
            </button>
            {langOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setLangOpen(false)} />
                <div className="absolute right-0 z-20 mt-1 w-44 rounded-xl border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-800 dark:bg-slate-900">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code as LanguageCode);
                        setLangOpen(false);
                      }}
                      className={cn(
                        "flex w-full items-center justify-between px-3 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-800",
                        language === lang.code
                          ? "font-semibold text-emerald-600"
                          : "text-slate-700 dark:text-slate-300"
                      )}
                    >
                      <span>{lang.native}</span>
                      <span className="text-xs text-slate-400">{lang.label}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <button
            onClick={toggleTheme}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

          <div className="relative ml-1">
            <button
              onClick={() => setUserOpen(!userOpen)}
              className="flex items-center gap-2 rounded-lg p-1 pr-2 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-green-600 text-sm font-semibold text-white">
                {userName.charAt(0).toUpperCase()}
              </div>
            </button>
            {userOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setUserOpen(false)} />
                <div className="absolute right-0 z-20 mt-1 w-56 rounded-xl border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-800 dark:bg-slate-900">
                  <div className="border-b border-slate-100 px-3 py-2 dark:border-slate-800">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{userName}</p>
                    <p className="text-xs capitalize text-emerald-600">{userRole}</p>
                  </div>
                  <button
                    onClick={() => {
                      setUserOpen(false);
                      router.push("/dashboard/profile");
                    }}
                    className="block w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    {t("nav_profile")}
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <LogOut className="h-4 w-4" />
                    {t("btn_logout")}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
