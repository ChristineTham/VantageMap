"use client";

/**
 * Phase 10 — Auth Session Provider
 *
 * Wraps the app to provide session context to all client components.
 * Uses Better Auth's React integration.
 */

import { createContext, useContext } from "react";
import { useSession } from "@/lib/auth-client";

interface SessionContextValue {
  user: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  } | null;
  isPending: boolean;
}

const SessionContext = createContext<SessionContextValue>({
  user: null,
  isPending: true,
});

export function useAuthSession() {
  return useContext(SessionContext);
}

export function AuthSessionProvider({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = useSession();

  const value: SessionContextValue = {
    user: session?.user
      ? {
          id: session.user.id,
          name: session.user.name,
          email: session.user.email,
          image: session.user.image,
        }
      : null,
    isPending,
  };

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}
