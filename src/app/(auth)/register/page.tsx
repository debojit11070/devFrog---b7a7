import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Create account",
  description: "Create a candidate or company account on DevForge.",
};

export default function RegisterPage() {
  return <RegisterForm />;
}
