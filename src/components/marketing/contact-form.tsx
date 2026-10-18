"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input, Select, Textarea } from "@/components/ui/form-controls";
import { FormField, fieldAria } from "@/components/shared/form-field";

const contactSchema = z.object({
  name: z.string().trim().min(2, "Enter your name"),
  email: z.email("Enter a valid email address"),
  topic: z.enum(["account", "assessment", "payments", "partnership", "other"], { message: "Choose a topic" }),
  message: z.string().trim().min(20, "Tell us a little more (at least 20 characters)").max(2000, "Keep it under 2000 characters"),
});

type ContactValues = z.infer<typeof contactSchema>;

const TOPICS: Array<{ value: ContactValues["topic"]; label: string }> = [
  { value: "account", label: "Account help" },
  { value: "assessment", label: "Assessment question" },
  { value: "payments", label: "Payments" },
  { value: "partnership", label: "Partnership" },
  { value: "other", label: "Something else" },
];

// The site owner sets this at build time. Without it, the form cannot deliver anywhere.
const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "";

/** Opens the visitor's own mail client pre-filled with their message. Nothing is stored on the server. */
export function ContactForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", topic: "assessment", message: "" },
  });

  const onSubmit = handleSubmit((values) => {
    const topic = TOPICS.find((item) => item.value === values.topic)?.label ?? values.topic;
    const subject = encodeURIComponent(`[DevForge] ${topic} from ${values.name}`);
    const body = encodeURIComponent(`${values.message}\n\nFrom: ${values.name} <${values.email}>`);
    window.location.assign(`mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`);
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Send us a message</CardTitle>
        <CardDescription>Your message opens in your email app, addressed to the DevForge team.</CardDescription>
      </CardHeader>
      <CardContent>
        {CONTACT_EMAIL ? null : (
          <p role="status" className="mb-4 rounded-md border border-warning/30 bg-warning/10 p-3 text-xs text-warning">
            The contact address is not configured. Set NEXT_PUBLIC_CONTACT_EMAIL to enable this form.
          </p>
        )}
        <form onSubmit={onSubmit} noValidate className="grid gap-4 sm:grid-cols-2">
          <FormField id="name" label="Name" error={errors.name} className="sm:col-span-1">
            <Input autoComplete="name" {...fieldAria("name", errors.name)} {...register("name")} />
          </FormField>
          <FormField id="email" label="Email" error={errors.email}>
            <Input type="email" autoComplete="email" {...fieldAria("email", errors.email)} {...register("email")} />
          </FormField>
          <FormField id="topic" label="Topic" error={errors.topic} className="sm:col-span-2">
            <Select {...fieldAria("topic", errors.topic)} {...register("topic")}>
              {TOPICS.map((topic) => (
                <option key={topic.value} value={topic.value}>
                  {topic.label}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField id="message" label="Message" error={errors.message} className="sm:col-span-2">
            <Textarea rows={6} {...fieldAria("message", errors.message)} {...register("message")} />
          </FormField>
          <div className="sm:col-span-2">
            <Button type="submit" size="lg" disabled={!CONTACT_EMAIL}>
              <Mail aria-hidden />
              Open in email
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
