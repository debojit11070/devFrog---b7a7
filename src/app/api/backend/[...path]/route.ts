import { NextResponse, type NextRequest } from "next/server";
import { ACCESS_COOKIE, REFRESH_COOKIE, clearSessionCookies, setSessionCookies, type TokenPair } from "@/lib/auth/cookies";
import { refreshSession } from "@/lib/auth/refresh";
import { API_BASE_URL } from "@/lib/config";

interface RouteContext {
  params: Promise<{ path: string[] }>;
}

/**
 * Browser-facing pass-through to the API. It attaches the access token from the
 * HTTP-only cookie, and on a 401 it refreshes the session once and retries.
 */
async function forward(
  request: NextRequest,
  path: string[],
  body: string | undefined,
  accessToken: string | undefined,
): Promise<Response> {
  const headers = new Headers({ Accept: "application/json" });
  if (body !== undefined) headers.set("Content-Type", "application/json");
  if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);
  // The API rate-limits per IP; pass the visitor's address so users do not share this server's quota.
  const clientIp = request.headers.get("x-forwarded-for");
  if (clientIp) headers.set("X-Forwarded-For", clientIp);

  const target = `${API_BASE_URL}/${path.map(encodeURIComponent).join("/")}${request.nextUrl.search}`;
  try {
    return await fetch(target, { method: request.method, headers, body, cache: "no-store", signal: request.signal });
  } catch (error) {
    // Backend unreachable: return a clear error instead of crashing the handler.
    console.error(`[api/backend] cannot reach ${target}`, error);
    return NextResponse.json({ success: false, message: "Cannot reach the API service." }, { status: 502 });
  }
}

async function handle(request: NextRequest, context: RouteContext): Promise<NextResponse> {
  const { path } = await context.params;
  const body = request.method === "GET" || request.method === "HEAD" ? undefined : await request.text();
  const accessToken = request.cookies.get(ACCESS_COOKIE)?.value;
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;

  let upstream = await forward(request, path, body, accessToken);
  let tokens: TokenPair | null = null;

  if (upstream.status === 401 && refreshToken) {
    tokens = await refreshSession(refreshToken);
    if (tokens) upstream = await forward(request, path, body, tokens.accessToken);
  }

  // Server-sent events (the AI chat) must be streamed through, not buffered.
  const isStream = upstream.ok && (upstream.headers.get("Content-Type") ?? "").includes("text/event-stream");
  if (isStream && upstream.body) {
    return new NextResponse(upstream.body, {
      status: upstream.status,
      headers: { "Content-Type": "text/event-stream; charset=utf-8", "Cache-Control": "no-cache, no-transform", "X-Accel-Buffering": "no" },
    });
  }

  const response = new NextResponse(await upstream.text(), {
    status: upstream.status,
    headers: { "Content-Type": upstream.headers.get("Content-Type") ?? "application/json" },
  });

  if (tokens) setSessionCookies(response, tokens);
  if (upstream.status === 401 && refreshToken && !tokens) clearSessionCookies(response);
  return response;
}

export const GET = handle;
export const POST = handle;
export const PATCH = handle;
export const DELETE = handle;
