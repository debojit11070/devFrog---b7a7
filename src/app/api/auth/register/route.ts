import { NextResponse } from "next/server";
import { setSessionCookies, type TokenPair } from "@/lib/auth/cookies";
import { API_BASE_URL } from "@/lib/config";
import { registerSchema } from "@/lib/validations/auth";
import type { ApiEnvelope, AuthPayload } from "@/lib/api/types";

export async function POST(request: Request): Promise<NextResponse> {
  const parsed = registerSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Please check the form and try again.";
    return NextResponse.json({ success: false, message }, { status: 400 });
  }

  const { fullName, email, password, role, companyName } = parsed.data;
  const payload = role === "COMPANY" ? { fullName, email, password, role, companyName } : { fullName, email, password, role };
  let upstream: Response;
  try {
    upstream = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
    });
  } catch (error) {
    console.error(`[auth/register] cannot reach ${API_BASE_URL}/auth/register`, error);
    return NextResponse.json(
      { success: false, message: "Cannot reach the registration service. Please try again." },
      { status: 502 },
    );
  }
  const json = (await upstream.json().catch(() => null)) as (ApiEnvelope<AuthPayload & { tokens: TokenPair }>) | null;

  if (!upstream.ok || !json?.success) {
    return NextResponse.json(
      { success: false, message: json?.message ?? "Registration failed", errors: json?.errors },
      { status: upstream.status || 500 },
    );
  }

  const response = NextResponse.json({ success: true, message: json.message, data: { user: json.data.user } }, { status: 201 });
  setSessionCookies(response, json.data.tokens);
  return response;
}
