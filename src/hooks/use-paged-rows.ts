import { useState } from "react";
import type { PaginationMeta } from "@/lib/api/types";

/** Client-side pagination for lists the API returns in one piece (payments, invitations, attempts). */
export function usePagedRows<T>(rows: T[], pageSize = 8) {
  const [requested, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const page = Math.min(requested, totalPages);
  const meta: PaginationMeta = { page, limit: pageSize, total: rows.length, totalPages };
  return { rows: rows.slice((page - 1) * pageSize, page * pageSize), meta, setPage };
}
