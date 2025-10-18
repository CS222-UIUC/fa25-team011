import ChatPanel from "@/app/components/ChatPanel";
import ImageUpload from "./components/ImageUpload";

export default function Home() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <section className="rounded-lg border border-purple-400/30 bg-purple-900/20 p-6 shadow-[0_0_15px_#8b5cf6]/20">
        <ImageUpload />
      </section>
      <ChatPanel isConnected={false} />
    </div>
  );
}
