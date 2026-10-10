"use client";

import { useEffect } from "react";

/** Last-resort boundary when the root layout itself fails. Must render its own <html>. */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", background: "#f6f7fb", color: "#0f172a" }}>
        <main style={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div role="alert" style={{ maxWidth: 420, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 32, textAlign: "center" }}>
            <h1 style={{ fontSize: 20, margin: 0 }}>The app hit an unexpected error</h1>
            <p style={{ color: "#64748b", fontSize: 14 }}>Reloading usually fixes it. If it keeps happening, try again later.</p>
            <button
              type="button"
              onClick={reset}
              style={{ marginTop: 16, background: "#4f46e5", color: "#fff", border: 0, borderRadius: 8, padding: "10px 16px", cursor: "pointer" }}
            >
              Try again
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
