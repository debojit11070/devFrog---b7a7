import type { NextResponse } from "next/server";

// Session tokens live in HTTP-only cookies, so client JavaScript never sees them.
// The browser sends them to /api/backend/* and to the proxy automatically.
export const ACCESS_COOKIE = "da_access";
export const REFRESH_COOKIE = "da_refresh";

const ACCESS_MAX_AGE = 60 * 60; // matches the API's 1h access token
const REFRESH_MAX_AGE = 7 * 24 * 60 * 60; // matches the API's 7d refresh token

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

const baseOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

export function setSessionCookies(response: NextResponse, tokens: TokenPair): void {
  response.cookies.set(ACCESS_COOKIE, tokens.accessToken, { ...baseOptions, maxAge: ACCESS_MAX_AGE });
  response.cookies.set(REFRESH_COOKIE, tokens.refreshToken, { ...baseOptions, maxAge: REFRESH_MAX_AGE });
}

export function clearSessionCookies(response: NextResponse): void {
  response.cookies.set(ACCESS_COOKIE, "", { ...baseOptions, maxAge: 0 });
  response.cookies.set(REFRESH_COOKIE, "", { ...baseOptions, maxAge: 0 });
}
