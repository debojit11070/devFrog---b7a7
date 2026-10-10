import { API_BASE_URL } from "@/lib/config";
import type { ApiEnvelope } from "@/lib/api/types";
import type { TokenPair } from "@/lib/auth/cookies";

/**
 * Exchanges a refresh token for a new token pair. The API rotates refresh
 * tokens, so the caller must store the returned pair or the session is lost.
 * Returns null when the refresh token is rejected.
 */
export async function refreshSession(refreshToken: string): Promise<TokenPair | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
      cache: "no-store",
    });
    if (!response.ok) return null;
    const json = (await response.json()) as ApiEnvelope<{ tokens: TokenPair }>;
    return json.data?.tokens ?? null;
  } catch {
    return null;
  }
}
