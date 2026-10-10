import type { ReactNode } from "react";
import type { FieldError } from "react-hook-form";
import { Label } from "@/components/ui/form-controls";
import { cn } from "@/lib/utils";

/** Label, control and inline validation message. Keeps every form's error UI consistent. */
export function FormField({
  id,
  label,
  error,
  hint,
  children,
  className,
}: {
  id: string;
  label: string;
  error?: FieldError;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error ? (
        <p id={errorId} role="alert" className="text-xs font-medium text-destructive">
          {error.message}
        </p>
      ) : hint ? (
        <p id={hintId} className="text-xs text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

/** Props to spread on a control so screen readers link it to its message. */
export function fieldAria(id: string, error?: FieldError, hasHint = false) {
  const describedBy = error ? `${id}-error` : hasHint ? `${id}-hint` : undefined;
  return {
    id,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": describedBy,
  };
}
