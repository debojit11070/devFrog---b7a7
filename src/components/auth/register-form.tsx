"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/form-controls";
import { FormField, fieldAria } from "@/components/shared/form-field";
import { authRequest } from "@/lib/api/client";
import type { User } from "@/lib/api/types";
import { ROLE_HOME } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { registerSchema, type RegisterFormValues } from "@/lib/validations/auth";

const ACCOUNT_TYPES = [
  { value: "CANDIDATE", label: "Candidate", hint: "Take assessments from companies" },
  { value: "COMPANY", label: "Company", hint: "Build and send assessments" },
] as const;

export function RegisterForm() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { fullName: "", email: "", password: "", confirmPassword: "", role: "CANDIDATE", companyName: "" },
  });

  const role = watch("role");

  const createAccount = useMutation({
    mutationFn: (values: RegisterFormValues) =>
      authRequest<{ user: User }>("/api/auth/register", values),
    onSuccess: ({ user }) => {
      toast.success("Account created. Welcome to DevForge!");
      router.replace(ROLE_HOME[user.role]);
      router.refresh();
    },
    onError: (error: Error) => {
      // A taken email is a field problem, so show it next to the input as well.
      if (/already/i.test(error.message)) {
        setError("email", { message: "This email is already registered" });
      }
    },
  });

  const onSubmit = handleSubmit((values) => createAccount.mutateAsync(values).catch(() => undefined));

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl">Create your account</CardTitle>
        <CardDescription>Choose the account type that fits you best.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
          <fieldset className="grid gap-3 sm:grid-cols-2">
            <legend className="mb-2 text-sm font-medium">Account type</legend>
            {ACCOUNT_TYPES.map((option) => (
              <label
                key={option.value}
                className={cn(
                  "flex cursor-pointer flex-col gap-1 rounded-lg border p-3 transition-all",
                  role === option.value
                    ? "border-primary bg-secondary/60 shadow-soft ring-2 ring-primary/20"
                    : "border-border hover:border-primary/30 hover:bg-muted/50",
                )}
              >
                <span className="flex items-center gap-2 text-sm font-medium">
                  <input type="radio" value={option.value} className="accent-primary" {...register("role")} />
                  {option.label}
                </span>
                <span className="pl-6 text-xs text-muted-foreground">{option.hint}</span>
              </label>
            ))}
          </fieldset>
          {errors.role ? (
            <p role="alert" className="-mt-3 text-xs font-medium text-destructive">
              {errors.role.message}
            </p>
          ) : null}

          <FormField id="fullName" label="Full name" error={errors.fullName}>
            <Input autoComplete="name" {...fieldAria("fullName", errors.fullName)} {...register("fullName")} />
          </FormField>

          {role === "COMPANY" ? (
            <FormField id="companyName" label="Company name" error={errors.companyName}>
              <Input autoComplete="organization" {...fieldAria("companyName", errors.companyName)} {...register("companyName")} />
            </FormField>
          ) : null}

          <FormField id="email" label="Email" error={errors.email}>
            <Input type="email" autoComplete="email" {...fieldAria("email", errors.email)} {...register("email")} />
          </FormField>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField id="password" label="Password" error={errors.password} hint="At least 8 characters, with a letter and a number">
              <Input
                type="password"
                autoComplete="new-password"
                {...fieldAria("password", errors.password, true)}
                {...register("password")}
              />
            </FormField>
            <FormField id="confirmPassword" label="Confirm password" error={errors.confirmPassword}>
              <Input
                type="password"
                autoComplete="new-password"
                {...fieldAria("confirmPassword", errors.confirmPassword)}
                {...register("confirmPassword")}
              />
            </FormField>
          </div>

          <Button type="submit" size="lg" loading={isSubmitting || createAccount.isPending} className="w-full">
            Create account
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Already registered?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
