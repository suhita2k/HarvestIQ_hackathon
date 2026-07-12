"use client";

import * as React from "react";
import { TrendingUp, Loader2, DollarSign, AlertTriangle } from "lucide-react";
import { Button, Card, Input, Label, Select, PageHeader, Badge } from "@/components/ui";
import { CROPS } from "@/lib/constants";
import { useApp } from "@/components/Providers";
import { formatCurrency } from "@/lib/utils";
import toast from "react-hot-toast";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";

export default function PredictionPage() {
  const { language } = useApp();
  const [crop, setCrop] = React.useState(CROPS[0].name);
  const [farmSize, setFarmSize] = React.useState("2");
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState<any>(null);

  const selectedCrop = CROPS.find((c) => c.name === crop);

  const predict = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/ai/prediction", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-language": language,
        },
        body: JSON.stringify({
          crop,
          farmSize: Number(farmSize),
          investmentCost: selectedCrop?.costPerAcre ?? 0,
          expectedYield: selectedCrop?.expectedYieldPerAcre ?? 0,
          marketPrice: selectedCrop?.marketPricePerQuintal ?? 0,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Prediction failed");
        return;
      }
      setResult(data);
      toast.success("Prediction complete!");
    } catch {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  const chartData = result
    ? [
        { name: "Investment", value: result.prediction.investmentCost * result.prediction.farmSize, color: "#ef4444" },
        { name: "Revenue", value: result.prediction.revenue, color: "#10b981" },
        { name: "Profit", value: result.prediction.netProfit, color: "#3b82f6" },
      ]
    : [];

  return (
    <div>
      <PageHeader
        title="AI Yield & Profit Prediction"
        subtitle="Predict your crop yield, investment, revenue, and profit with AI insights"
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Form */}
        <Card className="lg:col-span-1">
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-emerald-500" />
            <h3 className="font-semibold text-slate-900 dark:text-white">Prediction Parameters</h3>
          </div>

          <div className="space-y-4">
            <div>
              <Label>Crop</Label>
              <Select value={crop} onChange={(e) => setCrop(e.target.value)}>
                {CROPS.map((c) => (
                  <option key={c.name} value={c.name}>{c.name}</option>
                ))}
              </Select>
            </div>

            <div>
              <Label>Farm Size (acres)</Label>
              <Input type="number" step="0.1" value={farmSize} onChange={(e) => setFarmSize(e.target.value)} />
            </div>

            {selectedCrop && (
              <div className="rounded-lg bg-slate-50 p-3 text-xs dark:bg-slate-800">
                <p className="font-medium text-slate-700 dark:text-slate-300">Crop Data:</p>
                <div className="mt-2 space-y-1 text-slate-500 dark:text-slate-400">
                  <p>Expected Yield: {selectedCrop.expectedYieldPerAcre} quintals/acre</p>
                  <p>Market Price: ₹{selectedCrop.marketPricePerQuintal}/quintal</p>
                  <p>Cost: ₹{selectedCrop.costPerAcre}/acre</p>
                </div>
              </div>
            )}

            <Button onClick={predict} loading={loading} className="w-full" size="lg">
              {!loading && <TrendingUp className="h-5 w-5" />}
              Predict Yield & Profit
            </Button>
          </div>
        </Card>

        {/* Results */}
        <div className="space-y-6 lg:col-span-2">
          {loading ? (
            <Card>
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
                <p className="mt-4 text-sm text-slate-500">Running prediction model...</p>
              </div>
            </Card>
          ) : result ? (
            <>
              {/* Prediction Summary */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-900/20">
                      <DollarSign className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Total Investment</p>
                      <p className="text-lg font-bold text-slate-900 dark:text-white">
                        {formatCurrency(result.prediction.investmentCost * result.prediction.farmSize)}
                      </p>
                    </div>
                  </div>
                </Card>
                <Card>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20">
                      <TrendingUp className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Expected Revenue</p>
                      <p className="text-lg font-bold text-slate-900 dark:text-white">
                        {formatCurrency(result.prediction.revenue)}
                      </p>
                    </div>
                  </div>
                </Card>
                <Card>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/20">
                      <DollarSign className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Net Profit</p>
                      <p className="text-lg font-bold text-slate-900 dark:text-white">
                        {formatCurrency(result.prediction.netProfit)}
                      </p>
                    </div>
                  </div>
                </Card>
                <Card>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-900/20">
                      <AlertTriangle className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Risk Level</p>
                      <Badge color={result.prediction.riskLevel === "Low" ? "emerald" : result.prediction.riskLevel === "Medium" ? "amber" : "red"}>
                        {result.prediction.riskLevel}
                      </Badge>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Charts */}
              <Card>
                <h3 className="mb-4 font-semibold text-slate-900 dark:text-white">Financial Breakdown</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                        <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" />
                        <Tooltip
                          formatter={(value: any) => formatCurrency(Number(value))}
                          contentStyle={{ background: "#1e293b", border: "none", borderRadius: 8, color: "#fff" }}
                        />
                        <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                          {chartData.map((entry, i) => (
                            <Cell key={i} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label={(entry: any) => entry.name}
                        >
                          {chartData.map((entry, i) => (
                            <Cell key={i} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: any) => formatCurrency(Number(value))} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </Card>

              {/* AI Insights */}
              <Card>
                <h3 className="mb-3 font-semibold text-slate-900 dark:text-white">AI-Powered Insights</h3>
                <MarkdownContent content={result.insights} />
              </Card>
            </>
          ) : (
            <Card>
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <TrendingUp className="mb-3 h-12 w-12 text-slate-300" />
                <p className="text-sm font-medium text-slate-500">No prediction yet</p>
                <p className="mt-1 text-xs text-slate-400">
                  Select a crop and click Predict to see yield and profit analysis
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
