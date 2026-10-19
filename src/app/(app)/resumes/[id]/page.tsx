import type { Metadata } from "next";
import { ResumeEditor } from "@/components/editor/resume-editor";

export const metadata: Metadata = { title: "Edit resume" };
// ponytail: the resume loads client-side behind the auth guard. Revisit if auth moves server-side.
export const instant = false;

export default async function ResumePage(props: PageProps<"/resumes/[id]">) {
  const { id } = await props.params;
  return <ResumeEditor id={id} />;
}
