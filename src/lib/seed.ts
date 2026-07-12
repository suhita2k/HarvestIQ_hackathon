import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase-admin";
import { DEFAULT_ARTICLES, DEFAULT_GOVERNMENT_SCHEMES, DEFAULT_MARKET_PRICES } from "./constants";


let seeded = false;

export async function ensureSeeded(): Promise<void> {
  if (seeded) return;
  try {
    const articlesCount = await adminDb.collection("articles").count().get();
    if (articlesCount.data().count === 0) {
      const batch = adminDb.batch();
      DEFAULT_ARTICLES.forEach((a) => {
        const ref = adminDb.collection("articles").doc();
        batch.set(ref, {
          ...a,
          author: "HarvestIQ Editorial",
          publishedAt: FieldValue.serverTimestamp(),
          createdAt: FieldValue.serverTimestamp(),
        });
      });
      await batch.commit();
    }

    const schemesCount = await adminDb.collection("governmentSchemes").count().get();
    if (schemesCount.data().count === 0) {
      const batch = adminDb.batch();
      DEFAULT_GOVERNMENT_SCHEMES.forEach((s) => {
        const ref = adminDb.collection("governmentSchemes").doc();
        batch.set(ref, {
          ...s,
          createdAt: FieldValue.serverTimestamp(),
        });
      });
      await batch.commit();
    }

    const pricesCount = await adminDb.collection("marketPrices").count().get();
    if (pricesCount.data().count === 0) {
      const batch = adminDb.batch();
      DEFAULT_MARKET_PRICES.forEach((p) => {
        const ref = adminDb.collection("marketPrices").doc();
        batch.set(ref, {
          ...p,
          date: FieldValue.serverTimestamp(),
          createdAt: FieldValue.serverTimestamp(),
        });
      });
      await batch.commit();
    }

    const notifsCount = await adminDb.collection("notifications").count().get();
    if (notifsCount.data().count === 0) {
      const batch = adminDb.batch();
      const initialNotifs = [
        {
          userId: null,
          type: "scheme_update",
          title: "PM-KISAN 17th installment released",
          message: "The 17th installment of PM-KISAN has been released. Check your eligibility and update your eKYC.",
        },
        {
          userId: null,
          type: "rainfall",
          title: "Monsoon advisory issued",
          message: "IMD predicts above-normal rainfall this season. Plan drainage and harvest ready crops.",
        },
        {
          userId: null,
          type: "market_price",
          title: "Cotton prices surge 8%",
          message: "Cotton prices rose 8% in major mandis. Consider holding stock for better returns.",
        },
      ];
      initialNotifs.forEach((n) => {
        const ref = adminDb.collection("notifications").doc();
        batch.set(ref, {
          ...n,
          read: false,
          createdAt: FieldValue.serverTimestamp(),
        });
      });
      await batch.commit();
    }
    seeded = true;
  } catch (err) {
    console.error("Seed error:", err);
  }
}
