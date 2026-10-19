"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Bot, MessageCircle, Send, Square, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/form-controls";
import { CHAT_MAX_LENGTH, chatErrorMessage, streamChat, trimHistory, type ChatMessage } from "@/lib/api/ai";
import { cn } from "@/lib/utils";

const SUGGESTIONS = ["How do I start an assessment?", "How do invitations work?", "How do payments work?"];

/** Floating support chatbot. History lives in state and is sent in full on each call (the API is stateless). */
export function ChatWidget() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Cancel any in-flight request when the widget unmounts.
  useEffect(() => () => abortRef.current?.abort(), []);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, error, open]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // Keep the assistant out of the way while a candidate is sitting an exam.
  if (pathname.startsWith("/candidate/attempts")) return null;

  async function send(text: string) {
    const content = text.trim().slice(0, CHAT_MAX_LENGTH);
    if (!content || streaming) return;

    const history = trimHistory([...messages.filter((message) => message.content), { role: "user", content }]);
    setMessages([...history, { role: "assistant", content: "" }]);
    setDraft("");
    setError(null);
    setStreaming(true);

    const controller = new AbortController();
    abortRef.current = controller;
    try {
      await streamChat(
        history,
        (chunk) =>
          setMessages((current) => {
            const next = [...current];
            const last = next[next.length - 1];
            if (last?.role === "assistant") next[next.length - 1] = { ...last, content: last.content + chunk };
            return next;
          }),
        controller.signal,
      );
    } catch (err) {
      if (!controller.signal.aborted) setError(chatErrorMessage(err));
    } finally {
      // Drop an assistant bubble that never received text so the history stays valid.
      setMessages((current) => {
        const last = current[current.length - 1];
        return last?.role === "assistant" && !last.content ? current.slice(0, -1) : current;
      });
      setStreaming(false);
      abortRef.current = null;
    }
  }

  function reset() {
    abortRef.current?.abort();
    setMessages([]);
    setError(null);
    setStreaming(false);
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      {open ? (
        <section
          role="dialog"
          aria-label="Support assistant"
          className="animate-in-up flex h-[min(34rem,calc(100dvh-7rem))] w-[min(24rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-xl border border-border bg-card shadow-raised"
        >
          <header className="flex items-center justify-between gap-2 border-b border-border bg-primary px-4 py-3 text-primary-foreground">
            <div className="flex items-center gap-2">
              <Bot className="size-5" aria-hidden />
              <div>
                <p className="text-sm font-semibold leading-tight">DevForge assistant</p>
                <p className="text-xs opacity-80">Roles, timers, payments &amp; invitations</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button type="button" onClick={reset} disabled={messages.length === 0} aria-label="Clear conversation" className="rounded-md p-1.5 hover:bg-white/15 disabled:opacity-40">
                <Trash2 className="size-4" />
              </button>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close assistant" className="rounded-md p-1.5 hover:bg-white/15">
                <X className="size-4" />
              </button>
            </div>
          </header>

          <div ref={scrollRef} className="flex flex-1 flex-col gap-3 overflow-y-auto p-4" aria-live="polite">
            {messages.length === 0 ? (
              <div className="flex flex-col gap-3">
                <p className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
                  Hi! I can answer questions about how this platform works. Try one of these:
                </p>
                {SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => void send(suggestion)}
                    className="rounded-lg border border-border px-3 py-2 text-left text-sm hover:border-primary/50 hover:bg-muted"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            ) : (
              messages.map((message, index) => (
                <div
                  key={index}
                  className={cn(
                    "max-w-[85%] whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2 text-sm leading-relaxed",
                    message.role === "user" ? "self-end bg-primary text-primary-foreground" : "self-start bg-muted text-foreground",
                  )}
                >
                  {message.content || (
                    <span className="inline-flex gap-1 py-1" role="status" aria-label="Assistant is typing">
                      <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground" />
                      <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:150ms]" />
                      <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:300ms]" />
                    </span>
                  )}
                </div>
              ))
            )}
            {error ? (
              <p role="alert" className="self-start rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            ) : null}
          </div>

          <form
            className="flex items-center gap-2 border-t border-border p-3"
            onSubmit={(event) => {
              event.preventDefault();
              void send(draft);
            }}
          >
            <Input
              ref={inputRef}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              maxLength={CHAT_MAX_LENGTH}
              placeholder="Type your question…"
              aria-label="Message"
            />
            {streaming ? (
              <Button type="button" size="icon" variant="outline" onClick={() => abortRef.current?.abort()} aria-label="Stop generating">
                <Square />
              </Button>
            ) : (
              <Button type="submit" size="icon" disabled={!draft.trim()} aria-label="Send message">
                <Send />
              </Button>
            )}
          </form>
        </section>
      ) : null}

      <Button
        size="icon"
        className="size-14 rounded-full shadow-raised"
        onClick={() => setOpen((value) => !value)}
        aria-label={open ? "Close assistant" : "Open support assistant"}
        aria-expanded={open}
      >
        {open ? <X className="size-6" /> : <MessageCircle className="size-6" />}
      </Button>
    </div>
  );
}
