import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getCurrentWeather, getForecast, weatherAdvice } from "@/lib/weather";
import { checkRateLimit } from "@/lib/rate-limit";

export async function GET(request: Request) {
  const session = await getCurrentUser();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!checkRateLimit(request, 20, 60_000)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const url = new URL(request.url);
  let city = url.searchParams.get("city");

  if (!city) {
    if (session.profile?.district) {
      city = session.profile.district;
    } else if (session.profile?.state) {
      city = session.profile.state;
    } else {
      city = "Delhi";
    }
  }

  try {
    const [current, forecast] = await Promise.all([
      getCurrentWeather(city),
      getForecast(city),
    ]);
    const advice = weatherAdvice(current, forecast);
    return NextResponse.json({ current, forecast, advice });
  } catch (err: any) {
    if (err.response?.status === 404) {
      return NextResponse.json({ error: `City '${city}' not found` }, { status: 404 });
    }
    if (err.response?.status === 401) {
      return NextResponse.json(
        { error: "Invalid OpenWeather API Key", hint: "Check your OPENWEATHER_API_KEY" },
        { status: 401 }
      );
    }
    const message = err instanceof Error ? err.message : "Weather service unavailable";
    return NextResponse.json(
      { error: message, hint: "Set OPENWEATHER_API_KEY in your environment" },
      { status: 503 }
    );
  }
}
