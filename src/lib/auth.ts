import { cookies } from "next/headers";
import { adminAuth, adminDb } from "./firebase-admin";
import type { User, FarmerProfile } from "./firestore";

const SESSION_COOKIE = "harvestiq_session";
const SESSION_DURATION_DAYS = 5; // Firebase max is 14 days

export function isSecureRequest(request: Request): boolean {
  const forwardedProto = request.headers.get("x-forwarded-proto");
  if (forwardedProto) {
    return forwardedProto.split(",")[0].trim().toLowerCase() === "https";
  }
  try {
    const url = new URL(request.url);
    return url.protocol === "https:";
  } catch {
    return false;
  }
}

export async function createSession(idToken: string): Promise<{ cookieValue: string; expiresAt: Date }> {
  const expiresIn = SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000;
  const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });
  const expiresAt = new Date(Date.now() + expiresIn);
  return { cookieValue: sessionCookie, expiresAt };
}

export function sessionCookieOptions(expiresAt: Date, secure: boolean) {
  return {
    httpOnly: true,
    secure,
    sameSite: "lax" as const,
    expires: expiresAt,
    path: "/",
  };
}

export async function getSessionId(): Promise<string | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE)?.value;
  if (!sessionCookie) return null;
  
  try {
    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);
    return decodedClaims.uid;
  } catch (error) {
    return null;
  }
}

export async function getCurrentUser(): Promise<{ user: User; profile: FarmerProfile | null } | null> {
  const userId = await getSessionId();
  if (!userId) return null;

  try {
    const userDoc = await adminDb.collection("users").doc(userId).get();
    if (!userDoc.exists) return null;
    
    // Dates from Firestore come as Timestamps, converting them is needed if we strictly want Date,
    // but typically it's fine. We'll typecast for simplicity.
    const user = { id: userDoc.id, ...userDoc.data() } as unknown as User;
    
    const profileDoc = await adminDb.collection("farmerProfiles").doc(userId).get();
      
    let profile: FarmerProfile | null = null;
    if (profileDoc.exists) {
      profile = { id: profileDoc.id, ...profileDoc.data() } as unknown as FarmerProfile;
    }

    return { user, profile };
  } catch (error) {
    console.error("Error fetching current user:", error);
    return null;
  }
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE)?.value;
  if (sessionCookie) {
    try {
      const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie);
      await adminAuth.revokeRefreshTokens(decodedClaims.sub);
    } catch (error) {
      // Ignore errors on destroy
    }
  }
}

export async function cleanupExpiredSessions(): Promise<void> {
  // Firebase handles session expiration
}

export { SESSION_COOKIE };
export type SessionUser = NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;
