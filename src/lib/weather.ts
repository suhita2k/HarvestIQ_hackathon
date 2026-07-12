import axios from "axios";

export interface CurrentWeather {
  city: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  description: string;
  icon: string;
  uvIndex: number;
  rainProbability: number;
  pressure: number;
  clouds: number;
  visibility: number;
}

export interface DailyForecast {
  date: string;
  dayName: string;
  tempMin: number;
  tempMax: number;
  description: string;
  icon: string;
  humidity: number;
  windSpeed: number;
  rainProbability: number;
}

export function isWeatherConfigured(): boolean {
  return Boolean(process.env.OPENWEATHER_API_KEY);
}

const BASE_URL = "https://api.openweathermap.org/data/2.5";

export async function getCurrentWeather(city: string): Promise<CurrentWeather> {
  if (!isWeatherConfigured()) {
    throw new Error("OPENWEATHER_API_KEY is not configured");
  }
  const apiKey = process.env.OPENWEATHER_API_KEY!;
  const [currentRes, forecastRes] = await Promise.all([
    axios.get(`${BASE_URL}/weather`, {
      params: { q: city, appid: apiKey, units: "metric" },
      timeout: 15_000,
    }),
    axios.get(`${BASE_URL}/forecast`, {
      params: { q: city, appid: apiKey, units: "metric" },
      timeout: 15_000,
    }),
  ]);

  const c = currentRes.data;
  const rainProb = forecastRes.data?.list?.[0]?.pop ?? 0;
  const uv = estimateUV(c.weather?.[0]?.main, c.clouds?.all ?? 0);

  return {
    city: c.name,
    temperature: Math.round(c.main.temp),
    feelsLike: Math.round(c.main.feels_like),
    humidity: c.main.humidity,
    windSpeed: Math.round(c.wind.speed * 3.6),
    description: c.weather?.[0]?.description ?? "Clear",
    icon: c.weather?.[0]?.icon ?? "01d",
    uvIndex: uv,
    rainProbability: Math.round(rainProb * 100),
    pressure: c.main.pressure,
    clouds: c.clouds?.all ?? 0,
    visibility: Math.round((c.visibility ?? 10000) / 1000),
  };
}

export async function getForecast(city: string): Promise<DailyForecast[]> {
  if (!isWeatherConfigured()) {
    throw new Error("OPENWEATHER_API_KEY is not configured");
  }
  const apiKey = process.env.OPENWEATHER_API_KEY!;
  const res = await axios.get(`${BASE_URL}/forecast`, {
    params: { q: city, appid: apiKey, units: "metric" },
    timeout: 15_000,
  });

  const byDay = new Map<string, DailyForecast>();
  for (const item of res.data.list ?? []) {
    const dt = new Date(item.dt * 1000);
    const dayKey = dt.toDateString();
    if (!byDay.has(dayKey)) {
      byDay.set(dayKey, {
        date: dt.toISOString().slice(0, 10),
        dayName: dt.toLocaleDateString("en-US", { weekday: "short" }),
        tempMin: item.main.temp_min,
        tempMax: item.main.temp_max,
        description: item.weather?.[0]?.description ?? "",
        icon: item.weather?.[0]?.icon ?? "01d",
        humidity: item.main.humidity,
        windSpeed: Math.round(item.wind.speed * 3.6),
        rainProbability: Math.round((item.pop ?? 0) * 100),
      });
    } else {
      const existing = byDay.get(dayKey)!;
      existing.tempMin = Math.min(existing.tempMin, item.main.temp_min);
      existing.tempMax = Math.max(existing.tempMax, item.main.temp_max);
    }
  }
  return Array.from(byDay.values()).slice(0, 7);
}

function estimateUV(weatherMain: string, clouds: number): number {
  let base = 6;
  if (weatherMain === "Clear") base = 8;
  else if (weatherMain === "Clouds") base = 5;
  else if (weatherMain === "Rain" || weatherMain === "Drizzle") base = 3;
  else if (weatherMain === "Thunderstorm") base = 2;
  const cloudFactor = 1 - clouds / 200;
  return Math.max(1, Math.round(base * cloudFactor));
}

export function weatherAdvice(w: CurrentWeather, forecast: DailyForecast[]): string {
  const lines: string[] = [];
  if (w.rainProbability > 60) {
    lines.push("High rain probability — avoid irrigation and postpone pesticide application.");
  } else if (w.temperature > 35) {
    lines.push("Extreme heat — irrigate early morning or evening to reduce evaporation.");
  }
  if (w.uvIndex > 7) {
    lines.push("High UV index — wear protective clothing while working in the field.");
  }
  const hotDays = forecast.filter((d) => d.tempMax > 35).length;
  if (hotDays > 0) {
    lines.push(`${hotDays} hot days expected this week — plan water management accordingly.`);
  }
  const rainyDays = forecast.filter((d) => d.rainProbability > 60).length;
  if (rainyDays > 0) {
    lines.push(`${rainyDays} rainy days expected — harvest ready crops if possible.`);
  }
  if (lines.length === 0) {
    lines.push("Weather conditions are favorable for routine farm operations.");
  }
  return lines.join(" ");
}
