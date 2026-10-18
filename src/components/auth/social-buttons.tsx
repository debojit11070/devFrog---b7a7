"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { FacebookIcon, GoogleIcon } from "@/components/shared/brand-icons";

// Base URL of an OAuth start endpoint, e.g. https://api.example.com/api/v1/auth. Set when the backend supports social sign-in.
const SOCIAL_AUTH_URL = process.env.NEXT_PUBLIC_SOCIAL_AUTH_URL ?? "";

const PROVIDERS = [
  { id: "google", label: "Google", icon: GoogleIcon },
  { id: "facebook", label: "Facebook", icon: FacebookIcon },
] as const;

/** Google / Facebook sign-in. Redirects to the configured OAuth endpoint, or explains that it is not enabled. */
export function SocialButtons() {
  function start(provider: (typeof PROVIDERS)[number]) {
    if (!SOCIAL_AUTH_URL) {
      toast.info(`${provider.label} sign-in is not enabled on this server yet. Use email and password or a demo login.`);
      return;
    }
    window.location.assign(`${SOCIAL_AUTH_URL.replace(/\/$/, "")}/${provider.id}`);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        {PROVIDERS.map((provider) => (
          <Button key={provider.id} type="button" variant="outline" onClick={() => start(provider)}>
            <provider.icon className="size-4" />
            {provider.label}
          </Button>
        ))}
      </div>
      <div className="flex items-center gap-3 text-xs uppercase tracking-wider text-muted-foreground" aria-hidden>
        <span className="h-px flex-1 bg-border" />
        or continue with email
        <span className="h-px flex-1 bg-border" />
      </div>
    </div>
  );
}
