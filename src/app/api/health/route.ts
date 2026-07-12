import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { ensureSeeded } from "@/lib/seed";

export async function GET() {
  let dbOk = false;
  try {
    // Just a simple query to check connectivity
    await adminDb.collection("users").limit(1).get();
    dbOk = true;
  } catch {
    dbOk = false;
  }
  
  try {
    if (dbOk) await ensureSeeded();
  } catch {
    // ignore seed errors
  }

  return NextResponse.json({
    status: "ok",
    database: dbOk ? "connected" : "disconnected",
    timestamp: new Date().toISOString(),
  });
}
