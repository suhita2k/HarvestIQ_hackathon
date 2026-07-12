"use client";

import * as React from "react";
import { Landmark, ChevronDown, CheckCircle, FileText } from "lucide-react";
import { Card, Badge, PageHeader, Skeleton, EmptyState } from "@/components/ui";

export default function SchemesPage() {
  const [schemes, setSchemes] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [expanded, setExpanded] = React.useState<string | null>(null);

  React.useEffect(() => {
    fetch("/api/data/schemes")
      .then((r) => r.json())
      .then((d) => setSchemes(d.schemes ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <PageHeader
        title="Government Schemes"
        subtitle="Discover agricultural subsidies, insurance, and support programs"
      />

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : schemes.length === 0 ? (
        <EmptyState icon={<Landmark className="h-12 w-12" />} title="No schemes available" />
      ) : (
        <div className="space-y-4">
          {schemes.map((scheme) => (
            <Card key={scheme.id}>
              <button
                onClick={() => setExpanded(expanded === scheme.id ? null : scheme.id)}
                className="flex w-full items-start justify-between gap-3 text-left"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Landmark className="h-5 w-5 text-amber-500" />
                    <h3 className="font-semibold text-slate-900 dark:text-white">{scheme.name}</h3>
                  </div>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{scheme.description}</p>
                  {scheme.ministry && (
                    <div className="mt-2">
                      <Badge color="slate">{scheme.ministry}</Badge>
                    </div>
                  )}
                </div>
                <ChevronDown
                  className={`h-5 w-5 shrink-0 text-slate-400 transition ${expanded === scheme.id ? "rotate-180" : ""}`}
                />
              </button>

              {expanded === scheme.id && (
                <div className="mt-4 space-y-3 border-t border-slate-100 pt-4 dark:border-slate-800">
                  <SchemeSection icon={CheckCircle} title="Eligibility" content={scheme.eligibility} />
                  <SchemeSection icon={CheckCircle} title="Benefits" content={scheme.benefits} color="emerald" />
                  <SchemeSection icon={FileText} title="Required Documents" content={scheme.requiredDocuments} />
                  <SchemeSection icon={FileText} title="Application Process" content={scheme.applicationProcess} />
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function SchemeSection({
  icon: Icon,
  title,
  content,
  color = "blue",
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  content: string;
  color?: "blue" | "emerald";
}) {
  if (!content) return null;
  return (
    <div className="flex gap-3">
      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
        color === "emerald" ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20" : "bg-blue-100 text-blue-600 dark:bg-blue-900/20"
      }`}>
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{title}</p>
        <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-400">{content}</p>
      </div>
    </div>
  );
}
