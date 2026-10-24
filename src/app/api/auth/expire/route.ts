import { NextResponse, type NextRequest } from "next/server";
import { clearSessionCookies } from "@/lib/auth/cookies";

/** Drops a dead session and sends the visitor to the login page. */
export function GET(request: NextRequest): NextResponse {
  const response = NextResponse.redirect(new URL("/login", request.url));
  clearSessionCookies(response);
  return response;
}
