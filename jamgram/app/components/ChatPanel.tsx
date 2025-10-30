"use client";

import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";

export type ChatPanelProps = {
  onSend?: (message: string, context?: { imageId?: string; currentSongId?: string }) => Promise<string | void> | void;
  isConnected?: boolean;
  imageId?: string;        //add image reference
  currentSongId?: string;  //add current recommended song reference
};

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function ChatPanel({
  onSend,
  isConnected = true,
  imageId,
  currentSongId,
}: ChatPanelProps) {
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const chatLogRef = useRef<HTMLDivElement | null>(null);

  // auto-scroll to latest
  useEffect(() => {
    chatLogRef.current?.scrollTo({
      top: chatLogRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`;
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [inputValue]);

  const handleSend = async () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;

    // show user message immediately
    setMessages((prev) => [...prev, { role: "user", content: trimmed }]);
    setInputValue("");
    adjustTextareaHeight();

    try {
      // send both text and context (image + current song)
      const response = await onSend?.(trimmed, { imageId, currentSongId });
      if (response) {
        setMessages((prev) => [...prev, { role: "assistant", content: response }]);
      }
    } catch (error) {
      console.error("Chat send error", error);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void handleSend();
    }
  };

  const sendDisabled = useMemo(() => inputValue.trim().length === 0, [inputValue]);

  return (
    <div className="flex h-full flex-col">
      <header>
        <h2 className="text-2xl font-semibold text-white/90">Chat</h2>
        <p className="mt-1 text-sm text-purple-100/80">
          Tailor and/or tweak recommendations here.
        </p>
      </header>

      <div className="mt-6 flex flex-1 flex-col overflow-hidden rounded-3xl border border-white/10 bg-purple-600/20 p-6 sm:p-8 lg:p-10 shadow-[0_10px_60px_-10px_rgba(168,85,247,0.35)] backdrop-blur-md">
        <div
          ref={chatLogRef}
          role="log"
          aria-live="polite"
          aria-relevant="additions"
          className="min-h-[420px] flex-1 overflow-y-auto pr-1 space-y-4"
        >
          {messages.length === 0 ? (
            <div className="flex h-full items-center justify-center text-center text-sm text-purple-100/70">
              Start the conversation with an image upload to unlock personalized playlists.
            </div>
          ) : (
            messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                    m.role === "user"
                      ? "bg-purple-500 text-white"
                      : "bg-white/10 text-purple-100"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-6 flex flex-col gap-2">
          {!isConnected && (
            <p className="text-xs text-purple-100/70">
              Connect Spotify to personalize recommendations.
            </p>
          )}
          <div className="flex items-end gap-3 rounded-2xl bg-white/5 p-2 ring-1 ring-white/10 backdrop-blur">
            <textarea
              aria-label="Type a message"
              ref={textareaRef}
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message…"
              className="h-[44px] min-h-[44px] max-h-40 flex-1 resize-none bg-transparent text-sm text-white placeholder:text-purple-100/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-200/60"
            />
            <button
              aria-label="Send message"
              type="button"
              onClick={() => void handleSend()}
              disabled={sendDisabled}
              className="rounded-full bg-purple-600 px-4 py-2 text-sm font-medium text-white shadow transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-200 disabled:cursor-not-allowed disabled:bg-purple-600/60 hover:bg-purple-500"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
