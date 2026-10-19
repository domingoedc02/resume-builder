import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = { title: "Log in" };
// ponytail: auth is a client-side check, so the segment can't be prerendered. Revisit if auth moves server-side.
export const instant = false;

export default function LoginPage() {
  return <AuthForm mode="login" />;
}
