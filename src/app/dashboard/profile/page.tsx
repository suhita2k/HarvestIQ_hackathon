"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save, MapPin, Sprout, Droplets, Wallet, Target } from "lucide-react";
import { Button, Card, Input, Label, Select, Textarea, PageHeader, Skeleton } from "@/components/ui";
import { useApp } from "@/components/Providers";
import { INDIAN_STATES, SOIL_TYPES, IRRIGATION_METHODS, CROPS } from "@/lib/constants";
import toast from "react-hot-toast";

const schema = z.object({
  state: z.string().optional(),
  district: z.string().optional(),
  village: z.string().optional(),
  preferredLanguage: z.string().optional(),
  farmSize: z.string().optional(),
  soilType: z.string().optional(),
  irrigationMethod: z.string().optional(),
  mainCrops: z.string().optional(),
  farmingExperience: z.string().optional(),
  annualIncome: z.string().optional(),
  farmingGoals: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export default function ProfilePage() {
  const router = useRouter();
  const { language, setLanguage } = useApp();
  const [loading, setLoading] = React.useState(true);
  const [userId, setUserId] = React.useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  React.useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((data) => {
        if (data.user) {
          setUserId(data.user.id);
          if (data.profile) {
            reset({
              state: data.profile.state ?? "",
              district: data.profile.district ?? "",
              village: data.profile.village ?? "",
              preferredLanguage: data.profile.preferredLanguage ?? "en",
              farmSize: data.profile.farmSize ?? "",
              soilType: data.profile.soilType ?? "",
              irrigationMethod: data.profile.irrigationMethod ?? "",
              mainCrops: data.profile.mainCrops?.join(", ") ?? "",
              farmingExperience: data.profile.farmingExperience ?? "",
              annualIncome: data.profile.annualIncome ?? "",
              farmingGoals: data.profile.farmingGoals ?? "",
            });
            if (data.profile.preferredLanguage) {
              setLanguage(data.profile.preferredLanguage);
            }
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [reset, setLanguage]);

  const onSubmit = async (data: FormData) => {
    try {
      const mainCropsArray = data.mainCrops
        ? data.mainCrops.split(",").map((c) => c.trim()).filter(Boolean)
        : [];
      const payload = {
        ...data,
        mainCrops: mainCropsArray,
        farmSize: data.farmSize ? Number(data.farmSize) : null,
        farmingExperience: data.farmingExperience ? Number(data.farmingExperience) : null,
        annualIncome: data.annualIncome ? Number(data.annualIncome) : null,
        state: data.state || null,
        district: data.district || null,
        village: data.village || null,
        soilType: data.soilType || null,
        irrigationMethod: data.irrigationMethod || null,
        farmingGoals: data.farmingGoals || null,
      };
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const json = await res.json();
        toast.error(json.error ?? "Failed to save profile");
        return;
      }
      toast.success("Profile saved successfully");
      router.refresh();
    } catch {
      toast.error("Network error");
    }
  };

  if (loading) {
    return (
      <div>
        <PageHeader title="Farmer Profile" subtitle="Complete your profile for personalized advice" />
        <Card className="space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </Card>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Farmer Profile"
        subtitle="Complete your profile for personalized farming advice"
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <h3 className="mb-4 flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
            <MapPin className="h-5 w-5 text-emerald-500" /> Location
          </h3>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label>State</Label>
              <Select {...register("state")}>
                <option value="">Select state</option>
                {INDIAN_STATES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label>District</Label>
              <Input placeholder="District" {...register("district")} />
            </div>
            <div>
              <Label>Village</Label>
              <Input placeholder="Village" {...register("village")} />
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="mb-4 flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
            <Sprout className="h-5 w-5 text-emerald-500" /> Farm Details
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Farm Size (acres)</Label>
              <Input type="number" step="0.1" placeholder="e.g. 2.5" {...register("farmSize")} />
            </div>
            <div>
              <Label>Soil Type</Label>
              <Select {...register("soilType")}>
                <option value="">Select soil type</option>
                {SOIL_TYPES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Irrigation Method</Label>
              <Select {...register("irrigationMethod")}>
                <option value="">Select method</option>
                {IRRIGATION_METHODS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Main Crops (comma-separated)</Label>
              <Input placeholder="Rice, Wheat, Tomato" {...register("mainCrops")} />
              <p className="mt-1 text-xs text-slate-400">
                Available: {CROPS.slice(0, 6).map((c) => c.name).join(", ")}...
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="mb-4 flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
            <Wallet className="h-5 w-5 text-emerald-500" /> Experience & Goals
          </h3>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label>Preferred Language</Label>
              <Select
                value={language}
                onChange={(e) => {
                  register("preferredLanguage").onChange(e);
                  setLanguage(e.target.value as any);
                }}
              >
                <option value="en">English</option>
                <option value="ta">Tamil</option>
                <option value="te">Telugu</option>
                <option value="ml">Malayalam</option>
                <option value="kn">Kannada</option>
                <option value="hi">Hindi</option>
              </Select>
            </div>
            <div>
              <Label>Farming Experience (years)</Label>
              <Input type="number" placeholder="e.g. 5" {...register("farmingExperience")} />
            </div>
            <div>
              <Label>Annual Income (₹)</Label>
              <Input type="number" placeholder="e.g. 250000" {...register("annualIncome")} />
            </div>
          </div>
          <div className="mt-4">
            <Label>Farming Goals</Label>
            <Textarea
              rows={3}
              placeholder="e.g. Increase yield, switch to organic farming, reduce water usage..."
              {...register("farmingGoals")}
            />
          </div>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" loading={isSubmitting} size="lg">
            {!isSubmitting && <Save className="h-5 w-5" />}
            Save Profile
          </Button>
        </div>
      </form>
    </div>
  );
}
