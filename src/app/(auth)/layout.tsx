import Link from "next/link";
import { RedirectIfSignedIn } from "@/components/auth/guards";

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-screen flex-1 flex-col px-5 py-5 sm:px-10">
      <Link
        href="/"
        aria-label="Folio home"
        className="w-fit font-serif text-xl font-semibold tracking-tight"
      >
        folio<span className="text-muted-foreground">.</span>
      </Link>
      <main className="flex flex-1 items-center justify-center py-12">
        <RedirectIfSignedIn>{children}</RedirectIfSignedIn>
      </main>
    </div>
  );
}
