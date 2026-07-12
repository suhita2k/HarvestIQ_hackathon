"use client";

import * as React from "react";
import { Shovel, Droplets, FlaskConical, Bug, Send, Loader2, Leaf } from "lucide-react";
import { Button, Card, Input, Label, Select, Textarea, PageHeader } from "@/components/ui";
import { CROPS } from "@/lib/constants";
import { useApp } from "@/components/Providers";
import toast from "react-hot-toast";

type Tab = "soil" | "irrigation" | "fertilizer" | "pest";

const TABS: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }>; desc: string }[] = [
  { id: "soil", label: "Soil Management", icon: Shovel, desc: "Soil fertility, pH, compost, nutrients" },
  { id: "irrigation", label: "Irrigation", icon: Droplets, desc: "Water management, scheduling, methods" },
  { id: "fertilizer", label: "Fertilizer", icon: FlaskConical, desc: "NPK ratios, organic, chemical, schedule" },
  { id: "pest", label: "Pest Management", icon: Bug, desc: "Pest ID, organic & chemical control" },
];

const SAMPLE_QUESTIONS: Record<Tab, string[]> = {
  soil: ["How can I improve soil fertility?", "What's the ideal pH for rice?", "How to add organic matter to sandy soil?"],
  irrigation: ["Best irrigation schedule for tomatoes?", "How to save water in rice cultivation?", "Drip vs sprinkler for vegetables?"],
  fertilizer: ["NPK ratio for wheat?", "Best organic fertilizer for vegetables?", "When to apply urea to rice?"],
  pest: ["How to control aphids organically?", "Whitefly treatment for cotton?", "Natural predators for pest control?"],
};

export default function GuidancePage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { language } = useApp();
  const [tab, setTab] = React.useState<Tab>("soil");
  const [question, setQuestion] = React.useState("");
  const [crop, setCrop] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState<string>("");

  React.useEffect(() => {
    (async () => {
      const params = await searchParams;
      if (params.tab && ["soil", "irrigation", "fertilizer", "pest"].includes(params.tab)) {
        setTab(params.tab as Tab);
      }
    })();
  }, [searchParams]);

  const ask = async () => {
    if (!question.trim()) {
      toast.error("Please enter a question");
      return;
    }
    setLoading(true);
    setResult("");
    try {
      const res = await fetch(`/api/ai/${tab}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-language": language,
        },
        body: JSON.stringify({ question, crop }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Failed to get advice");
        return;
      }
      setResult(data.advice);
    } catch {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  const activeTab = TABS.find((t) => t.id === tab)!;

  return (
    <div>
      <PageHeader
        title="AI Farming Guidance"
        subtitle="Get expert AI advice on soil, irrigation, fertilizer, and pest management"
      />

      {/* Tabs */}
      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`rounded-xl border p-4 text-left transition ${
              tab === t.id
                ? "border-emerald-500 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-900/20"
                : "border-slate-200 bg-white hover:border-emerald-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
            }`}
          >
            <div className="flex items-center gap-2">
              <t.icon className={`h-5 w-5 ${tab === t.id ? "text-emerald-600" : "text-slate-400"}`} />
              <span className="font-semibold text-slate-900 dark:text-white">{t.label}</span>
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{t.desc}</p>
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Form */}
        <Card className="lg:col-span-1">
          <div className="mb-4 flex items-center gap-2">
            <activeTab.icon className="h-5 w-5 text-emerald-500" />
            <h3 className="font-semibold text-slate-900 dark:text-white">{activeTab.label}</h3>
          </div>

          <div className="space-y-4">
            <div>
              <Label>Crop (optional)</Label>
              <Select value={crop} onChange={(e) => setCrop(e.target.value)}>
                <option value="">Select crop</option>
                {CROPS.map((c) => (
                  <option key={c.name} value={c.name}>{c.name}</option>
                ))}
              </Select>
            </div>

            <div>
              <Label>Your Question</Label>
              <Textarea
                rows={4}
                placeholder={`Ask about ${activeTab.label.toLowerCase()}...`}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
              />
            </div>

            <div>
              <p className="mb-2 text-xs font-medium text-slate-400">Try asking:</p>
              <div className="flex flex-wrap gap-2">
                {SAMPLE_QUESTIONS[tab].map((q) => (
                  <button
                    key={q}
                    onClick={() => setQuestion(q)}
                    className="rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-600 hover:border-emerald-300 hover:bg-emerald-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            <Button onClick={ask} loading={loading} className="w-full">
              {!loading && <Send className="h-4 w-4" />}
              Get Advice
            </Button>
          </div>
        </Card>

        {/* Result */}
        <Card className="lg:col-span-2">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
              <p className="mt-4 text-sm text-slate-500">Getting expert advice...</p>
            </div>
          ) : result ? (
            <div>
              <div className="mb-4 flex items-center gap-2">
                <Leaf className="h-5 w-5 text-emerald-500" />
                <h3 className="font-semibold text-slate-900 dark:text-white">AI Recommendation</h3>
              </div>
              <MarkdownContent content={result} />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <activeTab.icon className="mb-3 h-12 w-12 text-slate-300" />
              <p className="text-sm font-medium text-slate-500">No advice yet</p>
              <p className="mt-1 text-xs text-slate-400">
                Ask a question to get personalized {activeTab.label.toLowerCase()} advice
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function MarkdownContent({ content }: { content: string }) {
  const html = content
    .replace(/^## (.+)$/gm, '<h3 class="text-base font-semibold text-slate-900 dark:text-white mt-4 mb-2">$1</h3>')
    .replace(/^### (.+)$/gm, '<h4 class="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-3 mb-1">$1</h4>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, "<br/>");
  return <div dangerouslySetInnerHTML={{ __html: html }} className="text-sm leading-relaxed text-slate-600 dark:text-slate-300" />;
}
