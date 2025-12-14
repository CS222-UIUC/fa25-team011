"use client";

import { useState } from "react";
import ChatPanel from "@/app/components/ChatPanel";
import ImageUpload from "./components/ImageUpload";

export default function Home() {
  const [extractedObjects, setExtractedObjects] = useState<string[]>([]);

  const handleObjectsExtracted = (objects: string[]) => {
    setExtractedObjects(objects);
  };

  const handleChatSend = async (
    message: string,
    context?: { imageId?: string; currentSongId?: string }
  ) => {
    try {
      if (extractedObjects && extractedObjects.length > 0) {
        const res = await fetch("/api/generate-recommendations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            objects: extractedObjects,
            instruction: message,
          }),
        });

        if (!res.ok) {
          const error = await res.json();
          return { error: `Failed to generate recommendations: ${error.error}` };
        }

        const data = await res.json();
        const recText: string = data.recommendations || "";

        // split mood line and song recommendations
        const lines = recText.split(/\r?\n/).filter(Boolean);
        const moodLineIndex = lines.findIndex((l) => /^\s*Mood\s*:/i.test(l));
        let mood = "";
        let songs = recText;

        if (moodLineIndex !== -1) {
          const moodLine = lines[moodLineIndex];
          const moodMatch = moodLine.match(/Mood\s*:\s*(.*)/i);
          const moodPhrase = moodMatch ? moodMatch[1].trim() : "";
          if (moodPhrase) {
            mood = `${moodPhrase}. This image conveys a ${moodPhrase.toLowerCase()} mood; the playlist matches that atmosphere.`;
          }
          // remove the mood line from songs output
          const remaining = lines.slice(0, moodLineIndex).concat(lines.slice(moodLineIndex + 1));
          songs = remaining.join("\n");
        }

        return { mood, songs };
      }

      return "Got your message!";
    } catch (error) {
      console.error("Chat handler error:", error);
      return "An error occurred while processing your request";
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <ImageUpload onObjectsExtracted={handleObjectsExtracted} />
      <ChatPanel
        isConnected={false}
        objects={extractedObjects}
        onSend={handleChatSend}
      />
    </div>
  );
}
