import type { Role } from "@/lib/api/types";

export interface SessionClaims {
  sub: string;
  role: Role;
  email: string;
  /** Seconds since epoch. */
  exp: number;
  iat?: number;
}

/**
 * Reads the claims of a JWT without verifying the signature.
 * Used only for routing decisions (proxy) and UI hints. The API verifies the
 * token on every real request, so a forged payload cannot read protected data.
 */
export function decodeJwtClaims(token: string): SessionClaims | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const claims = JSON.parse(atob(base64)) as Partial<SessionClaims>;
    if (!claims.sub || !claims.role || typeof claims.exp !== "number") return null;
    return claims as SessionClaims;
  } catch {
    return null;
  }
}

export function isRole(value: unknown): value is Role {
  return value === "CANDIDATE" || value === "COMPANY" || value === "ADMIN";
}
