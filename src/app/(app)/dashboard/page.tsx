import type { Metadata } from "next";
import { ResumeList } from "@/components/dashboard/resume-list";

export const metadata: Metadata = { title: "Your resumes" };

export default function DashboardPage() {
  return <ResumeList />;
}
