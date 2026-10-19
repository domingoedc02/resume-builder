import { ResumeTemplate } from "@/components/templates";
import { toTemplateModel } from "@/lib/resume/mapping";
import type {
  PageSize,
  ResumeContent,
  ResumeLayout,
  TemplateId,
} from "@/lib/resume/schema";

const PAGE_CSS: Record<PageSize, string> = {
  a4: "A4",
  letter: "letter",
};

/** Print-only copy of the resume. Real text, real @page breaks. */
export function PrintSheet({
  content,
  layout,
  templateId,
  pageSize,
}: {
  content: ResumeContent;
  layout: ResumeLayout;
  templateId: TemplateId;
  pageSize: PageSize;
}) {
  const model = toTemplateModel({ content, layout });
  return (
    <div className="hidden print:block">
      <style>{`@page { size: ${PAGE_CSS[pageSize]}; margin: 0.6in; }`}</style>
      <ResumeTemplate model={model} templateId={templateId} />
    </div>
  );
}
