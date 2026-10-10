/**
 * Accepts only same-site relative paths from `?next=`. Anything else (absolute
 * URLs, protocol-relative `//host`) is rejected to prevent open redirects.
 */
export function safeNextPath(value: string | null | undefined): string | null {
  if (!value) return null;
  if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return null;
  return value;
}
