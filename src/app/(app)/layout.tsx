import { AppHeader } from "@/components/app-header";
import { RequireUser } from "@/components/auth/guards";

export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <RequireUser>
      <AppHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-8 sm:px-10 print:max-w-none print:p-0">
        {children}
      </main>
    </RequireUser>
  );
}
