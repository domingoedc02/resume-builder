import type { ResumeContent, ResumeLayout, SectionKey } from "./schema";

export type TemplateSection =
  | { key: "summary"; text: string }
  | { key: "experience"; items: ResumeContent["experience"] }
  | { key: "education"; items: ResumeContent["education"] }
  | { key: "skills"; items: ResumeContent["skills"] }
  | { key: "projects"; items: ResumeContent["projects"] }
  | { key: "certifications"; items: ResumeContent["certifications"] };

export type TemplateModel = {
  contact: ResumeContent["contact"];
  sections: TemplateSection[];
};

const blank = (v: unknown): boolean =>
  typeof v === "string"
    ? v.trim() === ""
    : Array.isArray(v)
      ? v.every(blank)
      : typeof v === "boolean";

/** Drops items with no text; trims blank bullets from the rest. */
function keep<T extends { id: string }>(items: T[]): T[] {
  return items
    .filter((i) => !Object.entries(i).every(([k, v]) => k === "id" || blank(v)))
    .map((i) =>
      "bullets" in i && Array.isArray(i.bullets)
        ? { ...i, bullets: i.bullets.filter((b) => !blank(b)) }
        : i,
    );
}

function build(key: SectionKey, c: ResumeContent): TemplateSection | null {
  switch (key) {
    case "summary":
      return blank(c.summary) ? null : { key, text: c.summary.trim() };
    case "experience": {
      const items = keep(c.experience);
      return items.length ? { key, items } : null;
    }
    case "education": {
      const items = keep(c.education);
      return items.length ? { key, items } : null;
    }
    case "skills": {
      const items = keep(c.skills);
      return items.length ? { key, items } : null;
    }
    case "projects": {
      const items = keep(c.projects);
      return items.length ? { key, items } : null;
    }
    case "certifications": {
      const items = keep(c.certifications);
      return items.length ? { key, items } : null;
    }
  }
}

/**
 * Single mapping used by every template and the print view:
 * layout order, hidden sections dropped, empty sections dropped.
 */
export function toTemplateModel({
  content,
  layout,
}: {
  content: ResumeContent;
  layout: ResumeLayout;
}): TemplateModel {
  const hidden = new Set(layout.hidden);
  const sections: TemplateSection[] = [];
  for (const key of layout.order) {
    if (hidden.has(key)) continue;
    const section = build(key, content);
    if (section) sections.push(section);
  }
  return {
    contact: {
      ...content.contact,
      links: content.contact.links.filter((l) => !blank(l.url)),
    },
    sections,
  };
}
