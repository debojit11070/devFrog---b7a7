import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export interface Column<T> {
  key: string;
  header: string;
  cell: (row: T) => ReactNode;
  className?: string;
  /** Hide on small screens to keep the table readable. */
  hideOnMobile?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  isLoading?: boolean;
  empty: ReactNode;
  caption: string;
}

/** Semantic table that scrolls horizontally on narrow screens instead of breaking the layout. */
export function DataTable<T>({ columns, rows, rowKey, isLoading, empty, caption }: DataTableProps<T>) {
  if (!isLoading && rows.length === 0) return <Card>{empty}</Card>;

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[36rem] border-collapse text-sm">
          <caption className="sr-only">{caption}</caption>
          <thead className="bg-muted/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={cn("px-4 py-3 font-medium", column.hideOnMobile && "hidden md:table-cell", column.className)}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading
              ? Array.from({ length: 5 }).map((_, index) => (
                  <tr key={`skeleton-${index}`}>
                    {columns.map((column) => (
                      <td key={column.key} className={cn("px-4 py-3.5", column.hideOnMobile && "hidden md:table-cell")}>
                        <Skeleton className="h-4 w-full max-w-[10rem]" />
                      </td>
                    ))}
                  </tr>
                ))
              : rows.map((row) => (
                  <tr key={rowKey(row)} className="transition-colors hover:bg-muted/40">
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className={cn("px-4 py-3.5 align-middle", column.hideOnMobile && "hidden md:table-cell", column.className)}
                      >
                        {column.cell(row)}
                      </td>
                    ))}
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
