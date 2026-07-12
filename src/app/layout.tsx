import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { AppProvider } from "@/components/Providers";

export const metadata: Metadata = {
  title: "HarvestIQ — AI-Powered Smart Agriculture Platform",
  description:
    "HarvestIQ is an enterprise-grade AI-powered agriculture platform offering crop recommendations, disease detection, weather insights, market prices, government schemes, and more.",
  keywords: "agriculture, AI farming, crop recommendation, disease detection, smart farming, India agriculture",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-slate-100 text-slate-900 antialiased dark:bg-slate-950 dark:text-slate-100">
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
