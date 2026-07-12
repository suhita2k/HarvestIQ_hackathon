import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import {
  createSession,
  destroySession,
  getCurrentUser,
  sessionCookieOptions,
  isSecureRequest,
  SESSION_COOKIE,
} from "@/lib/auth";
import * as admin from "firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ action: string }> }
) {
  const { action } = await params;

  if (action === "me") {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ user: null }, { status: 401 });
    }
    return NextResponse.json({
      user: {
        id: session.user.id,
        fullName: session.user.fullName,
        email: session.user.email,
        mobile: session.user.mobile,
        role: session.user.role,
      },
      profile: session.profile,
    });
  }

  if (action === "clear-session") {
    const secure = isSecureRequest(request);
    await destroySession();
    
    // Redirect to login page
    const url = new URL("/login", request.url);
    const response = NextResponse.redirect(url);
    
    response.cookies.set(SESSION_COOKIE, "", {
      httpOnly: true,
      secure,
      sameSite: "lax",
      expires: new Date(0),
      path: "/",
    });
    return response;
  }

  return NextResponse.json({ error: "Not found" }, { status: 404 });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ action: string }> }
) {
  const { action } = await params;

  if (action === "register") {
    const { idToken, fullName, mobile } = await request.json();
    
    try {
      const decoded = await adminAuth.verifyIdToken(idToken);
      const userRef = adminDb.collection("users").doc(decoded.uid);
      const doc = await userRef.get();
      
      if (!doc.exists) {
        await userRef.set({
          fullName,
          email: decoded.email,
          mobile,
          role: "farmer",
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        });
        await adminDb.collection("farmerProfiles").doc(decoded.uid).set({
          userId: decoded.uid,
          preferredLanguage: "en",
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        });
      }

      const { cookieValue, expiresAt } = await createSession(idToken);
      const secure = isSecureRequest(request);
      const response = NextResponse.json({ success: true }, { status: 201 });
      response.cookies.set(SESSION_COOKIE, cookieValue, sessionCookieOptions(expiresAt, secure));
      return response;
    } catch (err) {
      console.error("[auth/register] Error:", err);
      // Clean up orphaned Firebase Auth user if Firestore creation failed
      try {
        const decoded = await adminAuth.verifyIdToken(idToken);
        await adminAuth.deleteUser(decoded.uid);
      } catch (cleanupErr) {
        console.error("[auth/register] Cleanup failed:", cleanupErr);
      }
      return NextResponse.json(
        { error: "Registration failed", detail: err instanceof Error ? err.message : String(err) },
        { status: 500 }
      );
    }
  }

  if (action === "login") {
    const { idToken } = await request.json();
    
    try {
      const decoded = await adminAuth.verifyIdToken(idToken);
      
      // Auto-heal: verify Firestore docs exist
      const userRef = adminDb.collection("users").doc(decoded.uid);
      const doc = await userRef.get();
      if (!doc.exists) {
        console.log(`[auth/login] Auto-healing missing Firestore docs for user: ${decoded.uid}`);
        await userRef.set({
          fullName: decoded.name || decoded.email?.split("@")[0] || "Farmer",
          email: decoded.email,
          mobile: "",
          role: "farmer",
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        });
      }
      
      const profileRef = adminDb.collection("farmerProfiles").doc(decoded.uid);
      const profileDoc = await profileRef.get();
      if (!profileDoc.exists) {
        console.log(`[auth/login] Auto-healing missing farmerProfiles doc for user: ${decoded.uid}`);
        await profileRef.set({
          userId: decoded.uid,
          preferredLanguage: "en",
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        });
      }

      const { cookieValue, expiresAt } = await createSession(idToken);
      const secure = isSecureRequest(request);
      const response = NextResponse.json({ success: true });
      response.cookies.set(SESSION_COOKIE, cookieValue, sessionCookieOptions(expiresAt, secure));
      return response;
    } catch (err) {
      console.error("[auth/login] Error:", err);
      return NextResponse.json(
        { error: "Login failed", detail: err instanceof Error ? err.message : String(err) },
        { status: 401 }
      );
    }
  }

  if (action === "logout") {
    const secure = isSecureRequest(request);
    await destroySession();
    const response = NextResponse.json({ success: true });
    response.cookies.set(SESSION_COOKIE, "", {
      httpOnly: true,
      secure,
      sameSite: "lax",
      expires: new Date(0),
      path: "/",
    });
    return response;
  }

  return NextResponse.json({ error: "Not found" }, { status: 404 });
}
