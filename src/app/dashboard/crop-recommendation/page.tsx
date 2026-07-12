"use client";

import * as React from "react";
import { Sprout, TrendingUp, DollarSign, Droplets, Loader2 } from "lucide-react";
import { Button, Card, Input, Label, Select, PageHeader, Badge } from "@/components/ui";
import { SOIL_TYPES, IRRIGATION_METHODS } from "@/lib/constants";
import { useApp } from "@/components/Providers";
import { formatCurrency } from "@/lib/utils";
import toast from "react-hot-toast";

export default function CropRecommendationPage() {
  const { language } = useApp();
  const [soilType, setSoilType] = React.useState("");
  const [irrigationMethod, setIrrigationMethod] = React.useState("");
  const [farmSize, setFarmSize] = React.useState("1");
  const [season, setSeason] = React.useState("Kharif");
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState<any>(null);

  const recommend = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/ai/crop-recommendation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-language": language,
        },
        body: JSON.stringify({ soilType, irrigationMethod, farmSize: Number(farmSize), season }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Failed to get recommendations");
        return;
      }
      setResult(data);
      toast.success("Recommendations ready!");
    } catch {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Smart Crop Recommendation"
        subtitle="Get AI-powered crop suggestions based on your soil, weather, and farm conditions"
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Input Form */}
        <Card className="lg:col-span-1">
          <div className="mb-4 flex items-center gap-2">
            <Sprout className="h-5 w-5 text-emerald-500" />
            <h3 className="font-semibold text-slate-900 dark:text-white">Farm Parameters</h3>
          </div>

          <div className="space-y-4">
            <div>
              <Label>Soil Type</Label>
              <Select value={soilType} onChange={(e) => setSoilType(e.target.value)}>
                <option value="">Select soil type</option>
                {SOIL_TYPES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </Select>
            </div>

            <div>
              <Label>Irrigation Method</Label>
              <Select value={irrigationMethod} onChange={(e) => setIrrigationMethod(e.target.value)}>
                <option value="">Select method</option>
                {IRRIGATION_METHODS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </Select>
            </div>

            <div>
              <Label>Farm Size (acres)</Label>
              <Input
                type="number"
                step="0.1"
                value={farmSize}
                onChange={(e) => setFarmSize(e.target.value)}
              />
            </div>

            <div>
              <Label>Season</Label>
              <Select value={season} onChange={(e) => setSeason(e.target.value)}>
                <option value="Kharif">Kharif (Monsoon)</option>
                <option value="Rabi">Rabi (Winter)</option>
                <option value="Zaid">Zaid (Summer)</option>
                <option value="Annual">Annual</option>
              </Select>
            </div>

            <Button onClick={recommend} loading={loading} className="w-full" size="lg">
              {!loading && <Sprout className="h-5 w-5" />}
              Get Recommendation
            </Button>
          </div>
        </Card>

        {/* Results */}
        <div className="space-y-4 lg:col-span-2">
          {loading ? (
            <Card>
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
                <p className="mt-4 text-sm text-slate-500">Analyzing your farm conditions...</p>
              </div>
            </Card>
          ) : result ? (
            <>
              {/* Recommended Crops */}
              <div>
                <h3 className="mb-3 font-semibold text-slate-900 dark:text-white">Recommended Crops</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {result.recommendations?.map((rec: any, i: number) => (
                    <Card key={i}>
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold text-slate-900 dark:text-white">{rec.name}</h4>
                          <p className="text-xs text-slate-400">{rec.season} · {rec.duration}</p>
                        </div>
                        <Badge color={rec.waterRequirement === "Low" ? "emerald" : rec.waterRequirement === "Medium" ? "amber" : "blue"}>
                          {rec.waterRequirement} water
                        </Badge>
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                        <div className="rounded-lg bg-slate-50 p-2 dark:bg-slate-800">
                          <p className="flex items-center gap-1 text-slate-400"><TrendingUp className="h-3 w-3" /> Yield/acre</p>
                          <p className="font-semibold text-slate-700 dark:text-slate-200">{rec.expectedYieldPerAcre} q</p>
                        </div>
                        <div className="rounded-lg bg-slate-50 p-2 dark:bg-slate-800">
                          <p className="flex items-center gap-1 text-slate-400"><DollarSign className="h-3 w-3" /> Price/q</p>
                          <p className="font-semibold text-slate-700 dark:text-slate-200">₹{rec.marketPricePerQuintal}</p>
                        </div>
                        <div className="rounded-lg bg-emerald-50 p-2 dark:bg-emerald-900/20">
                          <p className="text-slate-400">Revenue</p>
                          <p className="font-semibold text-emerald-600">{formatCurrency(rec.expectedRevenue)}</p>
                        </div>
                        <div className="rounded-lg bg-emerald-50 p-2 dark:bg-emerald-900/20">
                          <p className="text-slate-400">Profit</p>
                          <p className="font-semibold text-emerald-600">{formatCurrency(rec.expectedProfit)}</p>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center gap-1 text-xs text-slate-400">
                        <Droplets className="h-3 w-3" />
                        {rec.fertilizerSchedule}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* AI Advice */}
              <Card>
                <h3 className="mb-3 font-semibold text-slate-900 dark:text-white">AI Guidance</h3>
                <MarkdownContent content={result.advice} />
              </Card>
            </>
          ) : (
            <Card>
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Sprout className="mb-3 h-12 w-12 text-slate-300" />
                <p className="text-sm font-medium text-slate-500">No recommendations yet</p>
                <p className="mt-1 text-xs text-slate-400">
                  Fill the form and click Get Recommendation to see AI-powered crop suggestions
                </p>
              </div>
            </Card>
          )}
        </div>
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
