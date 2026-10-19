import { z } from "zod";

export const TEMPLATE_IDS = [
  "classic",
  "modern",
  "compact",
  "executive",
] as const;
export const PAGE_SIZES = ["a4", "letter"] as const;
export const SECTION_KEYS = [
  "summary",
  "experience",
  "education",
  "skills",
  "projects",
  "certifications",
] as const;

export type TemplateId = (typeof TEMPLATE_IDS)[number];
export type PageSize = (typeof PAGE_SIZES)[number];
export type SectionKey = (typeof SECTION_KEYS)[number];

/** App-level cap, well under the 4M-char mediumtext column limit. */
export const MAX_CONTENT_BYTES = 200_000;

export const titleSchema = z.string().trim().min(1, "Enter a title.").max(128);
// `.catch` keeps old or hand-edited rows readable instead of crashing the list.
export const templateIdSchema = z.enum(TEMPLATE_IDS).catch("classic");
export const pageSizeSchema = z.enum(PAGE_SIZES).catch("a4");

const text = (max: number) => z.string().max(max).default("");
const id = z.string().min(1).max(36);
const bullets = z.array(z.string().max(1000)).max(30).default([]);

const link = z.object({ id, label: text(64), url: text(300) });
const experience = z.object({
  id,
  role: text(128),
  company: text(128),
  location: text(128),
  startDate: text(32),
  endDate: text(32),
  current: z.boolean().default(false),
  bullets,
});
const education = z.object({
  id,
  school: text(128),
  degree: text(128),
  location: text(128),
  startDate: text(32),
  endDate: text(32),
  details: text(1000),
});
const skillGroup = z.object({ id, group: text(64), items: text(500) });
const project = z.object({
  id,
  name: text(128),
  url: text(300),
  description: text(500),
  bullets,
});
const certification = z.object({
  id,
  name: text(128),
  issuer: text(128),
  date: text(32),
});

export const contentSchema = z.object({
  schemaVersion: z.literal(1).default(1),
  contact: z
    .object({
      fullName: text(128),
      headline: text(128),
      email: text(254),
      phone: text(32),
      location: text(128),
      links: z.array(link).max(6).default([]),
    })
    .prefault({}),
  summary: text(3000),
  experience: z.array(experience).max(20).default([]),
  education: z.array(education).max(10).default([]),
  skills: z.array(skillGroup).max(12).default([]),
  projects: z.array(project).max(12).default([]),
  certifications: z.array(certification).max(20).default([]),
});

export type ResumeContent = z.infer<typeof contentSchema>;

export type ResumeLayout = { order: SectionKey[]; hidden: SectionKey[] };

/** Dedupes and appends any missing section, so old rows survive new sections. */
export const layoutSchema = z
  .object({
    order: z.array(z.enum(SECTION_KEYS)).max(SECTION_KEYS.length),
    hidden: z.array(z.enum(SECTION_KEYS)).max(SECTION_KEYS.length),
  })
  .transform((l): ResumeLayout => {
    const order = [...new Set(l.order)];
    for (const key of SECTION_KEYS) if (!order.includes(key)) order.push(key);
    return { order, hidden: [...new Set(l.hidden)] };
  });

export class ResumeTooLargeError extends Error {
  constructor() {
    super(
      `Resume exceeds ${MAX_CONTENT_BYTES / 1000} KB. Remove some content.`,
    );
    this.name = "ResumeTooLargeError";
  }
}

export const defaultLayout = (): ResumeLayout => ({
  order: [...SECTION_KEYS],
  hidden: [],
});

export const emptyContent = (): ResumeContent => contentSchema.parse({});

export function serializeContent(content: ResumeContent): string {
  const json = JSON.stringify(contentSchema.parse(content));
  if (new TextEncoder().encode(json).length > MAX_CONTENT_BYTES) {
    throw new ResumeTooLargeError();
  }
  return json;
}

export const parseContent = (raw: string): ResumeContent =>
  contentSchema.parse(JSON.parse(raw));

export const serializeLayout = (layout: ResumeLayout): string =>
  JSON.stringify(layoutSchema.parse(layout));

export const parseLayout = (raw: string): ResumeLayout =>
  layoutSchema.parse(JSON.parse(raw));
