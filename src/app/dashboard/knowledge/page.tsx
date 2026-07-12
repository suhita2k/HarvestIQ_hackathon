"use client";

import * as React from "react";
import { BookOpen, Search, Clock } from "lucide-react";
import { Card, Badge, PageHeader, Skeleton, EmptyState } from "@/components/ui";

export default function KnowledgePage() {
  const [articles, setArticles] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [expanded, setExpanded] = React.useState<string | null>(null);
  const [category, setCategory] = React.useState("");
  const [search, setSearch] = React.useState("");

  React.useEffect(() => {
    fetch("/api/data/articles")
      .then((r) => r.json())
      .then((d) => setArticles(d.articles ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const categories = Array.from(new Set(articles.map((a) => a.category)));
  const filtered = articles.filter((a) => {
    const catMatch = !category || a.category === category;
    const searchMatch = !search || a.title.toLowerCase().includes(search.toLowerCase()) || a.summary?.toLowerCase().includes(search.toLowerCase());
    return catMatch && searchMatch;
  });

  return (
    <div>
      <PageHeader
        title="Agricultural Knowledge Center"
        subtitle="Expert articles on organic farming, smart farming, hydroponics, and more"
      />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            placeholder="Search articles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white py-2 pl-10 pr-4 text-sm dark:border-slate-700 dark:bg-slate-800"
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={<BookOpen className="h-12 w-12" />} title="No articles found" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((article) => (
            <Card key={article.id} className="cursor-pointer" >
              <div onClick={() => setExpanded(expanded === article.id ? null : article.id)}>
                <div className="mb-3 flex items-center justify-between">
                  <Badge color="purple">{article.category}</Badge>
                  <span className="flex items-center gap-1 text-xs text-slate-400">
                    <Clock className="h-3 w-3" /> {new Date(article.publishedAt).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white">{article.title}</h3>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{article.summary}</p>
                <span className="mt-3 inline-block text-xs font-medium text-emerald-600">
                  {expanded === article.id ? "Read less" : "Read more →"}
                </span>
              </div>
              {expanded === article.id && (
                <div className="mt-3 border-t border-slate-100 pt-3 dark:border-slate-800">
                  <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300 whitespace-pre-wrap">
                    {article.content}
                  </p>
                  <p className="mt-3 text-xs text-slate-400">By {article.author}</p>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
