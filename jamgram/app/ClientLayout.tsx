/*
 * shivi 10/17: A client-specific layout that's dynamic component that's 
 * dynamic. Sort of like a client-side wrapper for interactivity and context.
 */

"use client"; // shivi 10/17: needed for SessionProvider & client hooks

// shivi 10/17: import NextAuth provider
import { SessionProvider } from "next-auth/react";
import ClientHeader from "./ClientHeader";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    // shivi 10/17: wrap dynamic header and content with SessionProvider
    <SessionProvider>
      <ClientHeader /> {/* client header with useSession */}
      {children}
    </SessionProvider>
  );
}
