import { ApiError } from "@/lib/api/error";

export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

/** The API accepts at most 12 messages of up to 1000 characters each. */
export const CHAT_MAX_MESSAGES = 12;
export const CHAT_MAX_LENGTH = 1000;

/** Keeps the newest messages and makes sure the history starts at a user turn. */
export function trimHistory(messages: ChatMessage[]): ChatMessage[] {
  const trimmed = messages.slice(-CHAT_MAX_MESSAGES);
  const firstUser = trimmed.findIndex((message) => message.role === "user");
  return firstUser > 0 ? trimmed.slice(firstUser) : trimmed;
}

/**
 * Streams the support chatbot reply through the /api/backend pass-through.
 * `onText` receives each text chunk as it arrives; abort with `signal` to stop.
 */
export async function streamChat(messages: ChatMessage[], onText: (text: string) => void, signal?: AbortSignal): Promise<void> {
  const response = await fetch("/api/backend/ai/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "text/event-stream" },
    body: JSON.stringify({ messages }),
    signal,
    cache: "no-store",
  });

  if (!response.ok || !response.body) {
    const json = (await response.json().catch(() => null)) as { message?: string; errors?: unknown } | null;
    throw new ApiError(json?.message ?? "The assistant is unavailable right now.", response.status, json?.errors);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  for (;;) {
    const { done, value } = await reader.read();
    if (done) return;
    buffer += decoder.decode(value, { stream: true });

    let boundary: number;
    while ((boundary = buffer.indexOf("\n\n")) !== -1) {
      const block = buffer.slice(0, boundary).trim();
      buffer = buffer.slice(boundary + 2);
      if (!block.startsWith("data:")) continue;
      const payload = block.slice(5).trim();
      if (payload === "[DONE]") return;
      let event: { text?: string; error?: string };
      try {
        event = JSON.parse(payload);
      } catch {
        continue;
      }
      if (event.error) throw new ApiError(event.error, 502);
      if (event.text) onText(event.text);
    }
  }
}

/** Friendly copy for the failures the chat endpoint documents. */
export function chatErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 429) return "You're sending messages too quickly. Please wait a few minutes and try again.";
    if (error.status === 503) return "The assistant isn't available right now.";
    if (error.status === 502) return "The assistant had a problem answering. Please try again.";
    return error.message;
  }
  return "Something went wrong. Please try again.";
}
