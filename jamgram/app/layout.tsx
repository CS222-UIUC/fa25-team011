import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../styles/globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "JamGram",
  description: "Music that Matches Your Moments",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} flex min-h-screen flex-col bg-[#0e001a] text-neutral-100 antialiased`}
      >
        {/* HEADER – deep purple gradient */}
        <header className="border-b border-purple-500/30 bg-gradient-to-r from-[#1a0033] via-[#2a0050] to-[#4b0082] backdrop-blur-md shadow-[0_0_20px_#3b006a]">
          <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <span className="text-lg font-semibold tracking-tight text-purple-300 drop-shadow-[0_0_8px_#b066ff]">
              JamGram
            </span>
            <div className="flex items-center gap-4">
              <button
                type="button"
                aria-label="Connect your Spotify account"
                className="rounded-full border border-purple-300/40 bg-purple-500/20 px-4 py-2 text-sm font-medium text-purple-100 shadow-[0_0_10px_#a855f7] transition hover:bg-purple-500/30 hover:shadow-[0_0_15px_#c084fc] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-300"
              >
                Connect Spotify
              </button>
              <span
                aria-hidden="true"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-purple-400/40 bg-purple-900/30 shadow-[0_0_10px_#8b5cf6]"
              >
                🎵
              </span>
            </div>
          </div>
        </header>

        {/* MAIN – dark purple gradient background */}
        <main className="flex-1 bg-gradient-to-b from-[#150028] via-[#1f003d] to-[#2b0057] text-white">
          <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
            {/* Content panel – lilac background for chat/image upload */}
            <div className="content-panel rounded-2xl bg-[#cda8ff]/20 p-8 backdrop-blur-md border border-[#e2c8ff]/30 shadow-[0_0_25px_#a855f7]/30">
              {children}
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}