"use client";

import Link from "next/link";
import { Leaf, Bot, Bug, Cloud, TrendingUp, Landmark, BookOpen, Shield, Sprout, CheckCircle, ArrowRight } from "lucide-react";

const FEATURES = [
  { icon: Bot, title: "AI Farming Assistant", desc: "24/7 multilingual AI guidance for every farming question." },
  { icon: Bug, title: "Disease Advisory", desc: "Upload crop images for instant disease detection and treatment." },
  { icon: Sprout, title: "Smart Crop Recommendation", desc: "Get data-driven crop suggestions based on soil, weather, and season." },
  { icon: Cloud, title: "Weather Intelligence", desc: "7-day forecasts with AI-powered farming advice." },
  { icon: TrendingUp, title: "Market Prices", desc: "Real-time crop prices from nearby mandis with trend charts." },
  { icon: Landmark, title: "Government Schemes", desc: "Discover and apply for agricultural subsidies and programs." },
  { icon: BookOpen, title: "Knowledge Center", desc: "Expert articles on organic farming, hydroponics, and more." },
];

const STATS = [
  { value: "6", label: "Indian Languages" },
  { value: "14+", label: "Crop Types" },
  { value: "6", label: "Govt Schemes" },
  { value: "7-Day", label: "Weather Forecast" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-slate-200/60 bg-white/80 backdrop-blur-lg dark:border-slate-800 dark:bg-slate-950/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-500/30">
              <Leaf className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold text-slate-900 dark:text-white">HarvestIQ</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-xl px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm shadow-emerald-600/20 hover:bg-emerald-700"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-green-50 dark:from-slate-900 dark:via-slate-950 dark:to-emerald-950" />
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-emerald-400/20 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-green-400/20 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-sm font-medium text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300">
              <Shield className="h-4 w-4" />
              Enterprise-Grade Smart Agriculture
            </span>
            <h1 className="mt-6 text-4xl font-extrabold leading-tight tracking-tight text-slate-900 dark:text-white sm:text-5xl lg:text-6xl">
              Grow Smarter with{" "}
              <span className="gradient-text">AI-Powered</span> Farming
            </h1>
            <p className="mt-6 text-lg text-slate-600 dark:text-slate-400">
              HarvestIQ brings artificial intelligence, weather intelligence, and market insights
              to your fingertips — helping farmers make better decisions, increase yields, and boost income.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-emerald-600/30 transition hover:bg-emerald-700"
              >
                Start Free <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-6 py-3 text-base font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                I have an account
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="mx-auto mt-16 grid max-w-3xl grid-cols-2 gap-4 sm:grid-cols-4">
            {STATS.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-slate-200 bg-white/60 p-5 text-center backdrop-blur dark:border-slate-800 dark:bg-slate-900/60"
              >
                <div className="text-2xl font-bold text-emerald-600">{stat.value}</div>
                <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
            Everything a Modern Farmer Needs
          </h2>
          <p className="mt-3 text-slate-600 dark:text-slate-400">
            One platform, endless possibilities — powered by AI and data.
          </p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-2xl border border-slate-200 bg-white p-6 transition-all hover:-translate-y-1 hover:border-emerald-300 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900 dark:hover:border-emerald-700"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition group-hover:bg-emerald-600 group-hover:text-white dark:bg-emerald-900/20 dark:text-emerald-400">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 to-green-700 px-8 py-16 text-center shadow-2xl shadow-emerald-600/20">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
          <div className="relative">
            <h2 className="text-3xl font-bold text-white">Ready to Transform Your Farm?</h2>
            <p className="mt-3 text-emerald-50">
              Join thousands of farmers using HarvestIQ to grow more with less.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-emerald-700 shadow-lg hover:bg-emerald-50"
              >
                Create Free Account <ArrowRight className="h-5 w-5" />
              </Link>
              <div className="flex items-center gap-2 text-sm text-emerald-50">
                <CheckCircle className="h-4 w-4" />
                No credit card required
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-10 dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-2">
            <Leaf className="h-5 w-5 text-emerald-600" />
            <span className="font-bold text-slate-900 dark:text-white">HarvestIQ</span>
          </div>
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
            AI-Powered Smart Agriculture Platform · Built for Indian Farmers
          </p>
          <p className="mt-2 text-xs text-slate-400">
            © {new Date().getFullYear()} HarvestIQ. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
