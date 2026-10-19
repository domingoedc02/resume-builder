"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useAuth } from "./auth-provider";

function Pending() {
  return (
    <p
      role="status"
      className="text-muted-foreground flex flex-1 items-center justify-center p-10 text-sm"
    >
      Loading…
    </p>
  );
}

/** Client-side guard: Appwrite sessions are invisible to Next middleware. */
export function RequireUser({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  if (loading || !user) return <Pending />;
  return <>{children}</>;
}

export function RedirectIfSignedIn({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) router.replace("/dashboard");
  }, [loading, user, router]);

  if (loading || user) return <Pending />;
  return <>{children}</>;
}
