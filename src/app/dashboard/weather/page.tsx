"use client";

import * as React from "react";
import { Cloud, Wind, Droplets, Sun, MapPin, Loader2, Search } from "lucide-react";
import { Button, Card, Input, PageHeader, Skeleton } from "@/components/ui";
import { useApp } from "@/components/Providers";
import toast from "react-hot-toast";

export default function WeatherPage() {
  const { language } = useApp();
  const [city, setCity] = React.useState("");
  const [weather, setWeather] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const fetchWeather = async (searchCity?: string) => {
    setLoading(true);
    setError(null);
    try {
      const url = searchCity ? `/api/weather?city=${encodeURIComponent(searchCity)}` : "/api/weather";
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to fetch weather");
        setWeather(null);
        return;
      }
      setWeather(data);
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchWeather();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (city.trim()) fetchWeather(city.trim());
  };

  return (
    <div>
      <PageHeader
        title="Weather Intelligence"
        subtitle="Current conditions, 7-day forecast, and AI-powered farming advice"
      />

      <Card className="mb-6">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Enter city name (e.g. Chennai, Delhi, Mumbai)"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button type="submit" loading={loading}>
            <Search className="h-4 w-4" /> Search
          </Button>
        </form>
      </Card>

      {loading ? (
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-1">
            <Skeleton className="h-32 w-full" />
          </Card>
          <Card className="lg:col-span-2">
            <Skeleton className="h-32 w-full" />
          </Card>
        </div>
      ) : error ? (
        <Card>
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Cloud className="mb-3 h-12 w-12 text-amber-400" />
            <p className="text-sm font-medium text-slate-600 dark:text-slate-300">{error}</p>
            {error.includes("API Key") && (
              <p className="mt-2 text-xs text-slate-400">
                Set OPENWEATHER_API_KEY in your .env file to enable weather data. You may need to restart the server.
              </p>
            )}
          </div>
        </Card>
      ) : weather ? (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Current Weather */}
          <Card className="lg:col-span-1">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold text-slate-900 dark:text-white">Current Weather</h3>
              <MapPin className="h-4 w-4 text-slate-400" />
            </div>
            <p className="text-sm text-slate-500">{weather.current.city}</p>
            <div className="mt-3 flex items-center gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://openweathermap.org/img/wn/${weather.current.icon}@4x.png`}
                alt={weather.current.description}
                className="h-20 w-20"
              />
              <div>
                <p className="text-4xl font-bold text-slate-900 dark:text-white">{weather.current.temperature}°C</p>
                <p className="text-sm capitalize text-slate-500">{weather.current.description}</p>
                <p className="text-xs text-slate-400">Feels like {weather.current.feelsLike}°C</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <WeatherStat icon={Droplets} label="Humidity" value={`${weather.current.humidity}%`} />
              <WeatherStat icon={Wind} label="Wind Speed" value={`${weather.current.windSpeed} km/h`} />
              <WeatherStat icon={Sun} label="UV Index" value={`${weather.current.uvIndex}`} />
              <WeatherStat icon={Cloud} label="Cloud Cover" value={`${weather.current.clouds}%`} />
              <WeatherStat icon={Droplets} label="Rain Prob." value={`${weather.current.rainProbability}%`} />
              <WeatherStat icon={Cloud} label="Pressure" value={`${weather.current.pressure} hPa`} />
            </div>
          </Card>

          {/* 7-Day Forecast */}
          <Card className="lg:col-span-2">
            <h3 className="mb-4 font-semibold text-slate-900 dark:text-white">7-Day Forecast</h3>
            <div className="grid gap-2 sm:grid-cols-7">
              {weather.forecast?.map((day: any, i: number) => (
                <div key={i} className="rounded-xl border border-slate-100 p-3 text-center dark:border-slate-800">
                  <p className="text-xs font-medium text-slate-500">{day.dayName}</p>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://openweathermap.org/img/wn/${day.icon}.png`}
                    alt={day.description}
                    className="mx-auto my-1 h-10 w-10"
                  />
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{day.tempMax}°</p>
                  <p className="text-xs text-slate-400">{day.tempMin}°</p>
                  <div className="mt-1 flex items-center justify-center gap-1 text-[10px] text-blue-500">
                    <Droplets className="h-2.5 w-2.5" /> {day.rainProbability}%
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* AI Advice */}
          <Card className="lg:col-span-3">
            <div className="mb-3 flex items-center gap-2">
              <Sun className="h-5 w-5 text-amber-500" />
              <h3 className="font-semibold text-slate-900 dark:text-white">AI Farming Advice</h3>
            </div>
            <div className="rounded-xl bg-gradient-to-br from-emerald-50 to-green-50 p-4 dark:from-emerald-900/20 dark:to-green-900/20">
              <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">{weather.advice}</p>
            </div>
          </Card>
        </div>
      ) : null}
    </div>
  );
}

function WeatherStat({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg bg-slate-50 p-2 dark:bg-slate-800">
      <div className="flex items-center gap-1 text-xs text-slate-400">
        <Icon className="h-3 w-3" /> {label}
      </div>
      <p className="mt-0.5 text-sm font-semibold text-slate-700 dark:text-slate-200">{value}</p>
    </div>
  );
}
