"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/form-controls";
import { useDebounce } from "@/hooks/use-debounce";

/**
 * Text search that updates the parent only after typing pauses, so each
 * keystroke does not become a URL change and an API call.
 */
export function SearchInput({
  value,
  onValueChange,
  placeholder = "Search…",
  label = "Search",
}: {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  label?: string;
}) {
  const [draft, setDraft] = useState(value);
  const debounced = useDebounce(draft);

  // Keep the box in sync when the URL changes (e.g. the browser back button).
  // Adjusting state during render avoids an extra render pass from an effect.
  const [lastValue, setLastValue] = useState(value);
  if (value !== lastValue) {
    setLastValue(value);
    setDraft(value);
  }

  useEffect(() => {
    if (debounced !== value) onValueChange(debounced);
    // Only react to the debounced text; `value` is intentionally excluded.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  return (
    <div className="relative w-full sm:max-w-xs">
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
      <Input
        type="search"
        aria-label={label}
        placeholder={placeholder}
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        className="pl-9"
      />
    </div>
  );
}
