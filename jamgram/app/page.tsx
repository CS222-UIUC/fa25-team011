import ChatPanel from "@/app/components/ChatPanel";
import ImageUpload from "./components/ImageUpload";

export default function Home() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <ImageUpload />
      <ChatPanel isConnected={false} />
    </div>
  );
}
