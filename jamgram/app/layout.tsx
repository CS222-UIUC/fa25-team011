// app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../styles/globals.css";

// shivi 10/17: import client wrapper that handles SessionProvider & ClientHeader
import ClientLayout from "./ClientLayout";

// load custom fonts (server-safe)
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// server-side metadata export (it must stay in a server file)
export const metadata: Metadata = {
  title: "JamGram",
  description: "Music that Matches Your Moments",
};

// root layout
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} flex min-h-screen flex-col bg-[#0e001a] text-neutral-100 antialiased`}
      >
        {/* wrap dynamic client content */}
        <ClientLayout>
          {/* Main body */}
          <main className="flex-1 bg-gradient-to-b from-[#150028] via-[#1f003d] to-[#2b0057] text-white">
            <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
              <div className="content-panel rounded-2xl bg-[#cda8ff]/20 p-8 backdrop-blur-md border border-[#e2c8ff]/30 shadow-[0_0_25px_#a855f7]/30">
                {children}
              </div>
            </div>
          </main>
        </ClientLayout>
      </body>
    </html>
  );
}
