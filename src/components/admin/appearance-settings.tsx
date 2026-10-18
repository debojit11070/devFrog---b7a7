"use client";

import { useSyncExternalStore } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const OPTIONS = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
] as const;

const subscribe = () => () => undefined;

export function AppearanceSettings() {
  const { theme, setTheme } = useTheme();
  // The stored theme is only known on the client; avoid a hydration mismatch.
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Appearance</CardTitle>
        <CardDescription>Choose how DevForge looks on this device.</CardDescription>
      </CardHeader>
      <CardContent>
        <div role="radiogroup" aria-label="Theme" className="grid gap-3 sm:grid-cols-3">
          {OPTIONS.map((option) => {
            const selected = mounted && theme === option.value;
            return (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => setTheme(option.value)}
                className={cn(
                  "flex items-center gap-3 rounded-lg border p-4 text-sm font-medium transition-colors",
                  selected ? "border-primary bg-secondary ring-2 ring-primary/20" : "border-border hover:bg-muted",
                )}
              >
                <option.icon className="size-4" aria-hidden />
                {option.label}
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
