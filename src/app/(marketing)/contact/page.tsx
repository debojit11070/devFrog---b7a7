import type { Metadata } from "next";
import { ContactForm } from "@/components/marketing/contact-form";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with the DevForge team about assessments, partnerships or support.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-5 lg:py-20">
      <div className="lg:col-span-2">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">Contact</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">Talk to us</h1>
        <p className="mt-4 text-muted-foreground">
          Questions about running an assessment, a paid listing, or your account? Send us a message and we will reply by email.
        </p>
        <dl className="mt-8 flex flex-col gap-4 text-sm">
          <div>
            <dt className="font-medium">Account help</dt>
            <dd className="text-muted-foreground">Forgotten password or a locked account? Mention the email you registered with.</dd>
          </div>
          <div>
            <dt className="font-medium">Assessment questions</dt>
            <dd className="text-muted-foreground">Include the assessment title so we can find it quickly.</dd>
          </div>
        </dl>
      </div>

      <div className="lg:col-span-3">
        <ContactForm />
      </div>
    </div>
  );
}
