"use client";

import { useEffect, useRef, useState } from "react";
import { Timer } from "lucide-react";
import { cn } from "@/lib/utils";

/** Counts down to the attempt's expiry and calls onExpire once when time runs out. */
export function CountdownTimer({ expiresAt, onExpire }: { expiresAt: string; onExpire: () => void }) {
  const [now, setNow] = useState(() => Date.now());
  const expiredRef = useRef(false);
  const target = new Date(expiresAt).getTime();
  const remainingSec = Math.max(0, Math.floor((target - now) / 1000));

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (remainingSec === 0 && !expiredRef.current) {
      expiredRef.current = true;
      onExpire();
    }
  }, [remainingSec, onExpire]);

  const minutes = Math.floor(remainingSec / 60);
  const seconds = String(remainingSec % 60).padStart(2, "0");
  const urgent = remainingSec > 0 && remainingSec <= 300;

  return (
    <div
      role="timer"
      aria-live={urgent ? "polite" : "off"}
      aria-label={`Time remaining ${minutes} minutes ${seconds} seconds`}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-semibold tabular-nums",
        remainingSec === 0 ? "border-rose-200 bg-rose-50 text-rose-700" : urgent ? "border-amber-200 bg-amber-50 text-amber-700" : "border-border bg-card",
      )}
    >
      <Timer className="size-4" aria-hidden />
      {remainingSec === 0 ? "Time is up" : `${minutes}:${seconds}`}
    </div>
  );
}
