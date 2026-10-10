import { NextResponse, type NextRequest } from "next/server";
import { ACCESS_COOKIE, REFRESH_COOKIE, clearSessionCookies, setSessionCookies, type TokenPair } from "@/lib/auth/cookies";
import { decodeJwtClaims, isRole, type SessionClaims } from "@/lib/auth/jwt";
import { refreshSession } from "@/lib/auth/refresh";
import { ROLE_HOME } from "@/lib/constants";
import type { Role } from "@/lib/api/types";

interface ProtectedRule {
  prefix: string;
  /** Omit to allow any signed-in role. */
  role?: Role;
}

const PROTECTED_ROUTES: ProtectedRule[] = [
  { prefix: "/admin", role: "ADMIN" },
  { prefix: "/company", role: "COMPANY" },
  { prefix: "/candidate", role: "CANDIDATE" },
  { prefix: "/payment" },
];

const AUTH_PAGES = ["/login", "/register"];

// Refresh this long before expiry so a request never starts with a token that dies mid-flight.
const REFRESH_LEEWAY_MS = 60 * 1000;

function matchesPrefix(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

function findProtectedRule(pathname: string): ProtectedRule | undefined {
  return PROTECTED_ROUTES.find((rule) => matchesPrefix(pathname, rule.prefix));
}

function isExpiring(claims: SessionClaims): boolean {
  return claims.exp * 1000 - REFRESH_LEEWAY_MS <= Date.now();
}

/**
 * Continues the request. When tokens were refreshed here, the new cookies are
 * also written into the request headers so the Server Components rendered for
 * this same request see the new session.
 */
function continueWith(request: NextRequest, tokens: TokenPair | null): NextResponse {
  if (!tokens) return NextResponse.next();

  const cookieHeader = request.cookies
    .getAll()
    .filter((cookie) => cookie.name !== ACCESS_COOKIE && cookie.name !== REFRESH_COOKIE)
    .map((cookie) => `${cookie.name}=${cookie.value}`);
  cookieHeader.push(`${ACCESS_COOKIE}=${tokens.accessToken}`, `${REFRESH_COOKIE}=${tokens.refreshToken}`);

  const headers = new Headers(request.headers);
  headers.set("cookie", cookieHeader.join("; "));

  const response = NextResponse.next({ request: { headers } });
  setSessionCookies(response, tokens);
  return response;
}

function redirectTo(request: NextRequest, path: string, tokens: TokenPair | null, clearSession = false): NextResponse {
  const response = NextResponse.redirect(new URL(path, request.url));
  if (tokens) setSessionCookies(response, tokens);
  if (clearSession) clearSessionCookies(response);
  return response;
}

/**
 * Route protection and role-based redirects. The API stays the source of truth;
 * this only keeps users off pages they cannot use and refreshes expiring sessions.
 */
export async function proxy(request: NextRequest): Promise<NextResponse> {
  const { pathname, search } = request.nextUrl;
  const accessToken = request.cookies.get(ACCESS_COOKIE)?.value;
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;

  const isAuthPage = AUTH_PAGES.includes(pathname);
  const rule = findProtectedRule(pathname);

  let claims = accessToken ? decodeJwtClaims(accessToken) : null;
  let tokens: TokenPair | null = null;

  if ((rule || isAuthPage) && refreshToken && (!claims || isExpiring(claims))) {
    tokens = await refreshSession(refreshToken);
    if (tokens) claims = decodeJwtClaims(tokens.accessToken);
  }

  const role = claims && isRole(claims.role) ? claims.role : null;

  if (isAuthPage && role) {
    return redirectTo(request, ROLE_HOME[role], tokens);
  }

  if (rule) {
    if (!role) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("next", `${pathname}${search}`);
      const response = NextResponse.redirect(loginUrl);
      if (tokens) setSessionCookies(response, tokens);
      // A rejected refresh token is dead; drop it so the user is not bounced around.
      if (refreshToken && !tokens) clearSessionCookies(response);
      return response;
    }
    if (rule.role && rule.role !== role) {
      return redirectTo(request, ROLE_HOME[role], tokens);
    }
  }

  return continueWith(request, tokens);
}

export const config = {
  // Skip API routes (they authenticate themselves), Next internals and static files.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
