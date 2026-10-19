"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Search, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/form-controls";
import { useAiSuggestions } from "@/hooks/api/ai";
import { useDebounce } from "@/hooks/use-debounce";
import { cn, formatCurrency } from "@/lib/utils";

/**
 * Catalog search with AI-ranked autocomplete. Typing (debounced 300ms) shows matching
 * assessments to jump to; pressing Enter applies the text as the catalog filter.
 */
export function AssessmentSearch({ value, onValueChange }: { value: string; onValueChange: (value: string) => void }) {
  const router = useRouter();
  const listId = useId();
  const [draft, setDraft] = useState(value);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounced = useDebounce(draft, 300);
  const suggestions = useAiSuggestions(debounced, 5);

  // Keep the box in sync when the URL changes (e.g. the browser back button).
  const [lastValue, setLastValue] = useState(value);
  if (value !== lastValue) {
    setLastValue(value);
    setDraft(value);
  }

  // Filter the catalog once typing pauses, like the shared SearchInput.
  useEffect(() => {
    if (debounced !== value) onValueChange(debounced);
    // Only react to the debounced text; `value` is intentionally excluded.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  const trimmed = draft.trim();
  const items = trimmed.length >= 2 ? (suggestions.data?.items ?? []) : [];
  const showList = open && items.length > 0;

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      setOpen(false);
    } else if (event.key === "ArrowDown" && items.length > 0) {
      event.preventDefault();
      setOpen(true);
      setActive((index) => (index + 1) % items.length);
    } else if (event.key === "ArrowUp" && items.length > 0) {
      event.preventDefault();
      setActive((index) => (index <= 0 ? items.length - 1 : index - 1));
    } else if (event.key === "Enter") {
      if (showList && active >= 0) {
        event.preventDefault();
        router.push(`/assessments/${items[active].id}`);
      } else {
        onValueChange(draft);
        setOpen(false);
      }
    }
  }

  return (
    <div ref={containerRef} className="relative w-full sm:max-w-xs">
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
      <Input
        type="search"
        role="combobox"
        aria-label="Search assessments"
        aria-expanded={showList}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={showList && active >= 0 ? `${listId}-${active}` : undefined}
        placeholder="Search by title or topic"
        value={draft}
        onChange={(event) => {
          setDraft(event.target.value);
          setOpen(true);
          setActive(-1);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        className="pl-9"
      />
      {suggestions.isFetching && trimmed.length >= 2 ? (
        <Loader2 className="absolute right-9 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" aria-hidden />
      ) : null}

      {showList ? (
        <ul
          id={listId}
          role="listbox"
          aria-label="Suggested assessments"
          className="absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-xl border border-border bg-card shadow-raised sm:min-w-[22rem]"
        >
          {items.map((item, index) => (
            <li
              key={item.id}
              id={`${listId}-${index}`}
              role="option"
              aria-selected={index === active}
              onMouseEnter={() => setActive(index)}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => router.push(`/assessments/${item.id}`)}
              className={cn("flex cursor-pointer items-center justify-between gap-3 px-4 py-2.5 text-sm", index === active ? "bg-muted" : "")}
            >
              <span className="min-w-0">
                <span className="block truncate font-medium">{item.title}</span>
                <span className="block truncate text-xs text-muted-foreground">
                  {item.durationMin} min{item.tags.length > 0 ? ` · ${item.tags.slice(0, 3).join(", ")}` : ""}
                </span>
              </span>
              <span className="shrink-0 text-xs font-medium text-muted-foreground">
                {item.priceCents === 0 ? "Free" : formatCurrency(item.priceCents, item.currency)}
              </span>
            </li>
          ))}
          {suggestions.data?.reranked ? (
            <li role="presentation" className="flex items-center gap-1.5 border-t border-border px-4 py-2 text-xs text-muted-foreground">
              <Sparkles className="size-3.5 text-primary" aria-hidden /> Ranked by AI
            </li>
          ) : null}
        </ul>
      ) : null}
    </div>
  );
}
