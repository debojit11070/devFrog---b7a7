"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, LogIn, ShieldCheck, Briefcase, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/form-controls";
import { FormField, fieldAria } from "@/components/shared/form-field";
import { useSignIn, type Credentials } from "@/components/auth/use-sign-in";
import { DEMO_ACCOUNTS } from "@/lib/constants";
import { loginSchema, type LoginFormValues } from "@/lib/validations/auth";
import type { Role } from "@/lib/api/types";

const ROLE_ICON: Record<Role, typeof ShieldCheck> = {
  ADMIN: ShieldCheck,
  COMPANY: Briefcase,
  CANDIDATE: UserRound,
};

export function LoginForm() {
  const signIn = useSignIn();
  const [pendingDemo, setPendingDemo] = useState<Role | null>(null);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  // Failures are already reported by the global mutation error handler (toast).
  const onSubmit = handleSubmit((values) => signIn.mutateAsync(values).catch(() => undefined));

  function signInAsDemo(role: Role, credentials: Credentials) {
    // Fill the form so the visitor sees which credentials are being used, then sign in.
    setValue("email", credentials.email, { shouldValidate: true });
    setValue("password", credentials.password, { shouldValidate: true });
    setPendingDemo(role);
    signIn.mutate(credentials, { onSettled: () => setPendingDemo(null) });
  }

  return (
    <div className="flex w-full flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Welcome back</CardTitle>
          <CardDescription>Sign in to continue to your dashboard.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
            <FormField id="email" label="Email" error={errors.email}>
              <Input type="email" autoComplete="email" {...fieldAria("email", errors.email)} {...register("email")} />
            </FormField>
            <FormField id="password" label="Password" error={errors.password}>
              <Input
                type="password"
                autoComplete="current-password"
                {...fieldAria("password", errors.password)}
                {...register("password")}
              />
            </FormField>
            <Button type="submit" size="lg" className="mt-1 w-full" loading={isSubmitting || signIn.isPending}>
              {!isSubmitting && !signIn.isPending ? <LogIn aria-hidden /> : null}
              Sign in
            </Button>
          </form>
          <p className="text-center text-sm text-muted-foreground">
            New here?{" "}
            <Link href="/register" className="font-medium text-primary hover:underline">
              Create an account
            </Link>
          </p>
        </CardContent>
      </Card>

      <div className="flex items-center gap-3 text-xs uppercase tracking-wider text-muted-foreground" aria-hidden>
        <span className="h-px flex-1 bg-border" />
        or
        <span className="h-px flex-1 bg-border" />
      </div>

      <section aria-labelledby="demo-heading" className="flex flex-col gap-3">
        <div>
          <h2 id="demo-heading" className="text-sm font-semibold">
            Quick demo login
          </h2>
          <p className="text-xs text-muted-foreground">One click fills the credentials and signs you in as that role.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {DEMO_ACCOUNTS.map((account) => {
            const Icon = ROLE_ICON[account.role];
            const isPending = pendingDemo === account.role;
            return (
              <button
                key={account.role}
                type="button"
                disabled={pendingDemo !== null}
                onClick={() => signInAsDemo(account.role, { email: account.email, password: account.password })}
                aria-busy={isPending || undefined}
                className="flex flex-col items-start gap-2 rounded-xl border border-border bg-card p-4 text-left shadow-soft transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-raised focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span className="flex size-9 items-center justify-center rounded-lg bg-secondary text-primary">
                  <Icon className="size-4" aria-hidden />
                </span>
                <span className="text-sm font-semibold">{account.label}</span>
                <span className="text-xs text-muted-foreground">{account.description}</span>
                <span className="mt-1 inline-flex items-center gap-1.5 text-xs font-medium text-primary">
                  {isPending ? <Loader2 className="size-3.5 animate-spin" aria-hidden /> : null}
                  {isPending ? "Signing in…" : "Demo login"}
                </span>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
