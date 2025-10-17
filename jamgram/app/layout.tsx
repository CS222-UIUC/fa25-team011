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
        className={`${geistSans.variable} ${geistMono.variable} flex min-h-screen flex-col bg-neutral-950 text-neutral-100 antialiased`}
      >
        <header className="border-b border-white/10">
          <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <span className="text-lg font-semibold tracking-tight">JamGram</span>
            <div className="flex items-center gap-4">
              <button
                type="button"
                aria-label="Connect your Spotify account"
                className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-neutral-100 transition hover:bg-white/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Connect Spotify
              </button>
              <span
                aria-hidden="true"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-neutral-900/80"
              />
            </div>
          </div>
        </header>
        <main className="flex-1">
          <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">{children}</div>
        </main>
      </body>
    </html>
  );
}
