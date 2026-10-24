"use client";

import { Sparkles } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { openChat } from "@/lib/api/ai";

/** Opens the support chatbot, optionally with a ready-made question. */
export function AskAiButton({ question, children = "Ask the assistant", ...props }: { question?: string } & ButtonProps) {
  return (
    <Button type="button" variant="outline" onClick={() => openChat(question)} {...props}>
      <Sparkles aria-hidden />
      {children}
    </Button>
  );
}
