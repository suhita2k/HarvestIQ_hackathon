"use client";

import * as React from "react";
import { TrendingUp, Search } from "lucide-react";
import { Card, Badge, PageHeader, Skeleton, EmptyState } from "@/components/ui";
import { CROPS } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

export default function MarketPage() {
  const [prices, setPrices] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");

  React.useEffect(() => {
    fetch("/api/data/market")
      .then((r) => r.json())
      .then((d) => setPrices(d.prices ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = prices.filter(
    (p) => !search || p.crop.toLowerCase().includes(search.toLowerCase()) || p.market.toLowerCase().includes(search.toLowerCase())
  );

  // Group by crop for chart
  const cropPrices: Record<string, any[]> = {};
  for (const p of filtered) {
    if (!cropPrices[p.crop]) cropPrices[p.crop] = [];
    cropPrices[p.crop].push(p);
  }

  const chartData = filtered.map((p) => ({ name: `${p.crop}`, market: p.market, price: p.price, crop: p.crop }));
  const uniqueCrops = Array.from(new Set(filtered.map((p) => p.crop)));
  const avgByCrop = uniqueCrops.map((crop) => ({
    crop,
    avgPrice: Math.round(
      filtered.filter((p) => p.crop === crop).reduce((sum, p) => sum + p.price, 0) /
      filtered.filter((p) => p.crop === crop).length
    ),
  }));

  return (
    <div>
      <PageHeader
        title="Market Prices"
        subtitle="Daily crop prices from nearby markets with trend analysis"
      />

      <div className="mb-6 relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          placeholder="Search by crop or market..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md rounded-xl border border-slate-300 bg-white py-2 pl-10 pr-4 text-sm dark:border-slate-700 dark:bg-slate-800"
        />
      </div>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      ) : (
        <>
          {/* Price Chart */}
          {avgByCrop.length > 0 && (
            <Card className="mb-6">
              <h3 className="mb-4 font-semibold text-slate-900 dark:text-white">Average Price by Crop (₹/quintal)</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={avgByCrop}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="crop" tick={{ fontSize: 10 }} stroke="#94a3b8" angle={-30} textAnchor="end" height={60} />
                    <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" />
                    <Tooltip
                      formatter={(value: any) => formatCurrency(Number(value))}
                      contentStyle={{ background: "#1e293b", border: "none", borderRadius: 8, color: "#fff" }}
                    />
                    <Bar dataKey="avgPrice" radius={[8, 8, 0, 0]}>
                      {avgByCrop.map((_, i) => (
                        <Cell key={i} fill={`hsl(${(i * 40) % 360}, 70%, 50%)`} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          )}

          {/* Price Table */}
          <Card>
            <h3 className="mb-4 font-semibold text-slate-900 dark:text-white">Current Market Prices</h3>
            {filtered.length === 0 ? (
              <EmptyState icon={<TrendingUp className="h-12 w-12" />} title="No prices found" />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-left dark:border-slate-800">
                      <th className="pb-2 pr-4 font-semibold text-slate-500">Crop</th>
                      <th className="pb-2 pr-4 font-semibold text-slate-500">Market</th>
                      <th className="pb-2 pr-4 font-semibold text-slate-500">Price (₹)</th>
                      <th className="pb-2 font-semibold text-slate-500">Unit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((p, i) => (
                      <tr key={i} className="border-b border-slate-50 dark:border-slate-800/50">
                        <td className="py-3 pr-4 font-medium text-slate-800 dark:text-slate-200">{p.crop}</td>
                        <td className="py-3 pr-4 text-slate-600 dark:text-slate-400">{p.market}</td>
                        <td className="py-3 pr-4">
                          <Badge color="emerald">₹{p.price.toLocaleString()}</Badge>
                        </td>
                        <td className="py-3 text-slate-400">per {p.unit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
