"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";

export function AppHeader() {
  const { user, signOut } = useAuth();
  const { resolvedTheme, setTheme } = useTheme();
  const router = useRouter();

  async function onSignOut() {
    await signOut();
    router.replace("/login");
  }

  return (
    <header className="border-border border-b print:hidden">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-3 px-5 sm:px-10">
        <Link
          href="/dashboard"
          aria-label="Folio dashboard"
          className="font-serif text-xl font-semibold tracking-tight"
        >
          folio<span className="text-muted-foreground">.</span>
        </Link>
        <div className="flex items-center gap-1">
          <span className="text-muted-foreground mr-2 hidden max-w-48 truncate text-sm sm:inline">
            {user?.email}
          </span>
          <Button
            variant="ghost"
            size="sm"
            aria-label="Toggle color theme"
            onClick={() =>
              setTheme(resolvedTheme === "dark" ? "light" : "dark")
            }
          >
            Theme
          </Button>
          <Button variant="outline" size="sm" onClick={onSignOut}>
            Log out
          </Button>
        </div>
      </div>
    </header>
  );
}
