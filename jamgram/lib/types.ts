/*
 * defines the shared ChatMessage TypeScript type used to describe chat messages
 */

export type ChatMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  ts: string; // ISO timestamp
};
