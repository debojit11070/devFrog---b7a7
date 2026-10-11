import { NextResponse } from "next/server";
import { setSessionCookies } from "@/lib/auth/cookies";
import { API_BASE_URL } from "@/lib/config";
import { loginSchema } from "@/lib/validations/auth";
import type { ApiEnvelope, AuthPayload } from "@/lib/api/types";
import type { TokenPair } from "@/lib/auth/cookies";

export async function POST(request: Request): Promise<NextResponse> {
  const parsed = loginSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ success: false, message: "Enter a valid email and password." }, { status: 400 });
  }

  let upstream: Response;
  try {
    upstream = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
      cache: "no-store",
    });
  } catch {
    // The backend could not be reached (wrong BACKEND_API_URL, network, cold start).
    return NextResponse.json(
      { success: false, message: "Cannot reach the sign-in service. Please try again." },
      { status: 502 },
    );
  }
  const json = (await upstream.json().catch(() => null)) as (ApiEnvelope<AuthPayload & { tokens: TokenPair }>) | null;

  if (!upstream.ok || !json?.success) {
    return NextResponse.json(
      { success: false, message: json?.message ?? "Login failed" },
      { status: upstream.status || 500 },
    );
  }

  // Tokens go into HTTP-only cookies; the browser only receives the user profile.
  const response = NextResponse.json({ success: true, message: json.message, data: { user: json.data.user } });
  setSessionCookies(response, json.data.tokens);
  return response;
}
