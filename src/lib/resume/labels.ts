import type { PageSize, TemplateId } from "./schema";

export const TEMPLATE_LABEL: Record<TemplateId, string> = {
  classic: "Classic",
  modern: "Modern",
  compact: "Compact",
  executive: "Executive",
};

export const PAGE_LABEL: Record<PageSize, string> = {
  a4: "A4",
  letter: "Letter",
};
