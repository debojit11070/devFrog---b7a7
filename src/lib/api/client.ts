import { ApiError } from "@/lib/api/error";
import type { ApiEnvelope } from "@/lib/api/types";

export type QueryValue = string | number | boolean | undefined | null;

export interface ApiRequestOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  query?: Record<string, QueryValue>;
}

/** Builds a query string, skipping empty values so URLs stay clean. */
export function buildQueryString(query: Record<string, QueryValue> | undefined): string {
  if (!query) return "";
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === "") continue;
    params.set(key, String(value));
  }
  const serialized = params.toString();
  return serialized ? `?${serialized}` : "";
}

/**
 * Browser-side call to the API through the /api/backend pass-through.
 * Tokens never leave the server; the cookie carries authentication.
 */
export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const { method = "GET", body, query } = options;
  const response = await fetch(`/api/backend${path}${buildQueryString(query)}`, {
    method,
    headers: body === undefined ? undefined : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: "no-store",
  });

  const json = (await response.json().catch(() => null)) as ApiEnvelope<T> | null;
  if (!response.ok || !json?.success) {
    throw new ApiError(json?.message ?? "Something went wrong. Please try again.", response.status, json?.errors);
  }
  return json.data;
}

/** Auth endpoints that set session cookies on the Next.js side. */
export async function authRequest<T>(path: "/api/auth/login" | "/api/auth/register" | "/api/auth/logout", body?: unknown): Promise<T> {
  const response = await fetch(path, {
    method: "POST",
    headers: body === undefined ? undefined : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: "no-store",
  });
  const json = (await response.json().catch(() => null)) as ApiEnvelope<T> | null;
  if (!response.ok || !json?.success) {
    throw new ApiError(json?.message ?? "Request failed", response.status, json?.errors);
  }
  return json.data;
}
