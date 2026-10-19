import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = { title: "Create account" };
// ponytail: auth is a client-side check, so the segment can't be prerendered. Revisit if auth moves server-side.
export const instant = false;

export default function SignupPage() {
  return <AuthForm mode="signup" />;
}
