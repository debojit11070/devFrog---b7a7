import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ApiError, getErrorMessage } from "@/lib/api/error";

function handleError(error: unknown): void {
  // An expired session that could not be refreshed: send the user back to sign in.
  if (error instanceof ApiError && error.status === 401 && typeof window !== "undefined") {
    if (window.location.pathname !== "/login") {
      // A full page load is intentional: it drops every cached client state.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.assign(`/login?next=${encodeURIComponent(window.location.pathname)}`);
    }
    return;
  }
  toast.error(getErrorMessage(error));
}

export function makeQueryClient(): QueryClient {
  return new QueryClient({
    queryCache: new QueryCache({ onError: handleError }),
    mutationCache: new MutationCache({ onError: handleError }),
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        refetchOnWindowFocus: false,
        retry: (failureCount, error) => {
          // Client errors (4xx) will not change on retry.
          if (error instanceof ApiError && error.status < 500) return false;
          return failureCount < 2;
        },
      },
    },
  });
}
