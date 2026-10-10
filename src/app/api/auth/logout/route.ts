import { NextResponse } from "next/server";
import { ACCESS_COOKIE, clearSessionCookies } from "@/lib/auth/cookies";
import { API_BASE_URL } from "@/lib/config";

export async function POST(request: Request): Promise<NextResponse> {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const accessToken = readCookie(cookieHeader, ACCESS_COOKIE);

  // Best effort: revoke the refresh token server-side, but always clear the browser session.
  if (accessToken) {
    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    }).catch(() => undefined);
  }

  const response = NextResponse.json({ success: true, message: "Logged out", data: null });
  clearSessionCookies(response);
  return response;
}

function readCookie(cookieHeader: string, name: string): string | undefined {
  const match = cookieHeader.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : undefined;
}
