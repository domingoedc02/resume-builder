import type { Metadata } from "next";
import { ResumeList } from "@/components/dashboard/resume-list";

export const metadata: Metadata = { title: "Your resumes" };
// ponytail: data loads client-side behind the auth guard. Revisit if auth moves server-side.
export const instant = false;

export default function DashboardPage() {
  return <ResumeList />;
}
