/*
 * A client-specific header component that's dynamic. It shows a "Connect Spotify" 
 * button when the user is not logged in and the user's name + "Sign out" button
 * when logged in.
 */


"use client"; // shivi 10/17: needed for useSession hook

// shivi 10/17: importing NextAuth hooks
import { signIn, signOut, useSession } from "next-auth/react";

export default function ClientHeader() {
  // shivi 10/17: access current user session
  const { data: session } = useSession();

  return (
    <header className="border-b border-purple-500/30 bg-gradient-to-r from-[#1a0033] via-[#2a0050] to-[#4b0082] backdrop-blur-md shadow-[0_0_20px_#3b006a]">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <span className="text-lg font-semibold tracking-tight text-purple-300 drop-shadow-[0_0_8px_#b066ff]">
          JamGram
        </span>
        <div className="flex items-center gap-4">
          {/* shivi 10/17: show correct button based on login state */}
          {!session ? (
            <button
              type="button"
              onClick={() => signIn("spotify")} // triggers the Spotify login
              aria-label="Connect your Spotify account"
              className="rounded-full border border-purple-300/40 bg-purple-500/20 px-4 py-2 text-sm font-medium text-purple-100 shadow-[0_0_10px_#a855f7] transition hover:bg-purple-500/30 hover:shadow-[0_0_15px_#c084fc] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-300"
            >
              Connect Spotify
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-sm text-purple-200">
                {session.user?.name || "Spotify User"}
              </span>
              <button
                onClick={() => signOut()} // logs user out
                className="rounded-full border border-purple-300/40 bg-purple-500/20 px-3 py-1 text-xs font-medium text-purple-100 hover:bg-purple-500/30"
              >
                Sign out
              </button>
            </div>
          )}
          {/* end of conditional button */}

          <span
            aria-hidden="true"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-purple-400/40 bg-purple-900/30 shadow-[0_0_10px_#8b5cf6]"
          >
            🎵
          </span>
        </div>
      </div>
    </header>
  );
}
