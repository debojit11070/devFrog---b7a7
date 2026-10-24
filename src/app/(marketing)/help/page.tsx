import type { Metadata } from "next";
import Link from "next/link";
import { AskAiButton } from "@/components/ai/ask-ai-button";
import { Button } from "@/components/ui/button";
import { FAQS } from "@/lib/faq";

export const metadata: Metadata = {
  title: "Help centre",
  description: "Answers to common questions about building, taking and paying for DevForge assessments.",
};

export default function HelpPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:py-16">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Help centre</h1>
      <p className="mt-2 text-muted-foreground">Answers to the questions we hear most often.</p>
      <div className="mt-8 flex flex-col gap-3">
        {FAQS.map((faq) => (
          <details key={faq.question} className="group rounded-xl border border-border bg-card p-5 shadow-soft">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium [&::-webkit-details-marker]:hidden">
              {faq.question}
              <span className="text-primary transition-transform group-open:rotate-45" aria-hidden>+</span>
            </summary>
            <p className="mt-3 text-sm text-muted-foreground">{faq.answer}</p>
          </details>
        ))}
      </div>
      <div className="mt-10 rounded-xl border border-border bg-card p-6 text-center shadow-soft">
        <h2 className="font-semibold">Still stuck?</h2>
        <p className="mt-1 text-sm text-muted-foreground">Send us a message and we will get back to you by email.</p>
        <div className="mt-4 flex flex-wrap justify-center gap-3">
          <AskAiButton>Ask the AI assistant</AskAiButton>
          <Button asChild>
            <Link href="/contact">Contact support</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
