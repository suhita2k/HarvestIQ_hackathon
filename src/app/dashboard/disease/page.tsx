"use client";

import * as React from "react";
import { Upload, Bug, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { Button, Card, Input, Label, Select, Textarea, PageHeader, Badge } from "@/components/ui";
import { CROPS } from "@/lib/constants";
import { useApp } from "@/components/Providers";
import toast from "react-hot-toast";

export default function DiseasePage() {
  const { language, t } = useApp();
  const [crop, setCrop] = React.useState("");
  const [symptoms, setSymptoms] = React.useState("");
  const [image, setImage] = React.useState<File | null>(null);
  const [preview, setPreview] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState<any>(null);
  const [history, setHistory] = React.useState<any[]>([]);

  React.useEffect(() => {
    fetch("/api/ai/disease-history")
      .then((r) => r.json())
      .then((d) => setHistory(d.history ?? []))
      .catch(() => {});
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const analyze = async () => {
    if (!crop) {
      toast.error("Please select a crop");
      return;
    }
    if (!symptoms.trim()) {
      toast.error("Please describe the symptoms");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("crop", crop);
      formData.append("symptoms", symptoms);
      if (image) formData.append("image", image);

      const res = await fetch("/api/ai/disease", {
        method: "POST",
        headers: { "x-language": language },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Analysis failed");
        return;
      }
      setResult(data);
      setHistory((prev) => [data.report, ...prev]);
      toast.success("Analysis complete!");
    } catch {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Crop Disease Advisory"
        subtitle="Upload crop images and describe symptoms for AI-powered diagnosis"
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input Form */}
        <Card>
          <div className="mb-4 flex items-center gap-2">
            <Bug className="h-5 w-5 text-red-500" />
            <h3 className="font-semibold text-slate-900 dark:text-white">Report Symptoms</h3>
          </div>

          <div className="space-y-4">
            <div>
              <Label>Select Crop</Label>
              <Select value={crop} onChange={(e) => setCrop(e.target.value)}>
                <option value="">Select crop</option>
                {CROPS.map((c) => (
                  <option key={c.name} value={c.name}>{c.name}</option>
                ))}
              </Select>
            </div>

            <div>
              <Label>Upload Crop Image (optional)</Label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 p-6 text-center transition hover:border-emerald-400 dark:border-slate-700"
                >
                  {preview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={preview} alt="Preview" className="max-h-40 rounded-lg" />
                  ) : (
                    <>
                      <Upload className="mb-2 h-8 w-8 text-slate-400" />
                      <p className="text-sm text-slate-500">Click to upload crop image</p>
                      <p className="text-xs text-slate-400">JPG, PNG up to 5MB</p>
                    </>
                  )}
                </label>
              </div>
            </div>

            <div>
              <Label>Describe Symptoms</Label>
              <Textarea
                rows={5}
                placeholder="e.g. Yellow spots on leaves, wilting, brown patches on stems..."
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
              />
            </div>

            <Button onClick={analyze} loading={loading} className="w-full" size="lg">
              {!loading && <Bug className="h-5 w-5" />}
              Analyze & Diagnose
            </Button>
          </div>
        </Card>

        {/* Result */}
        <Card>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
              <p className="mt-4 text-sm text-slate-500">Analyzing crop symptoms...</p>
            </div>
          ) : result ? (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-emerald-500" />
                  <h3 className="font-semibold text-slate-900 dark:text-white">Diagnosis Result</h3>
                </div>
                <Badge color="emerald">{result.report.crop}</Badge>
              </div>
              {result.report.imagePath && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={result.report.imagePath}
                  alt="Uploaded crop"
                  className="mb-4 max-h-48 rounded-xl"
                />
              )}
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <MarkdownContent content={result.advice} />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Bug className="mb-3 h-12 w-12 text-slate-300" />
              <p className="text-sm font-medium text-slate-500">No diagnosis yet</p>
              <p className="mt-1 text-xs text-slate-400">
                Fill the form and click Analyze to get AI-powered disease diagnosis
              </p>
            </div>
          )}
        </Card>
      </div>

      {/* History */}
      {history.length > 0 && (
        <Card className="mt-6">
          <h3 className="mb-3 font-semibold text-slate-900 dark:text-white">Diagnosis History</h3>
          <div className="space-y-2">
            {history.slice(0, 5).map((h) => (
              <div key={h.id} className="flex items-center justify-between rounded-lg border border-slate-100 p-3 dark:border-slate-800">
                <div>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{h.crop}</p>
                  <p className="text-xs text-slate-400">{new Date(h.createdAt).toLocaleDateString()}</p>
                </div>
                {h.imagePath && <Badge color="blue">Image</Badge>}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

function MarkdownContent({ content }: { content: string }) {
  const html = content
    .replace(/^## (.+)$/gm, '<h3 class="text-base font-semibold text-slate-900 dark:text-white mt-4 mb-2">$1</h3>')
    .replace(/^### (.+)$/gm, '<h4 class="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-3 mb-1">$1</h4>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, "<br/>");
  return <div dangerouslySetInnerHTML={{ __html: html }} className="text-sm text-slate-600 dark:text-slate-300" />;
}
