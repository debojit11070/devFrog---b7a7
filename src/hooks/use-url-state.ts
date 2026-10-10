"use client";

import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { PAGE_SIZE } from "@/lib/constants";

type UrlUpdates = Record<string, string | number | null | undefined>;

/**
 * Reads and writes filters, sorting and pagination through the query string,
 * so every filtered view can be bookmarked or shared (e.g. ?page=2&status=DRAFT).
 * Must be rendered inside a <Suspense> boundary because it reads useSearchParams.
 */
export function useUrlState() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const get = useCallback((key: string) => searchParams.get(key) ?? "", [searchParams]);

  const getInt = useCallback(
    (key: string, fallback: number) => {
      const parsed = Number.parseInt(searchParams.get(key) ?? "", 10);
      return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
    },
    [searchParams],
  );

  /** Updates one or more params. Changing any filter resets pagination unless `page` is set. */
  const update = useCallback(
    (updates: UrlUpdates) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === undefined || value === "") params.delete(key);
        else params.set(key, String(value));
      }
      if (!("page" in updates)) params.delete("page");
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  return {
    get,
    getInt,
    update,
    page: getInt("page", 1),
    limit: PAGE_SIZE,
  };
}
