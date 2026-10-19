import type { ReactNode } from "react";
import type { TemplateModel, TemplateSection } from "@/lib/resume/mapping";
import type { TemplateId } from "@/lib/resume/schema";

// ponytail: one renderer + style map, not four components. Split a template
// into its own file only when its structure (not just styling) diverges.
type Style = {
  root: string;
  header: string;
  name: string;
  headline: string;
  contact: string;
  section: string;
  h2: string;
  item: string;
  meta: string;
};

const STYLES: Record<TemplateId, Style> = {
  classic: {
    root: "font-serif text-[10.5pt] leading-snug",
    header: "text-center",
    name: "text-[22pt] font-semibold tracking-tight",
    headline: "text-[11pt]",
    contact: "justify-center",
    section: "mt-4",
    h2: "mb-1.5 border-b border-neutral-800 pb-0.5 text-[10.5pt] font-semibold tracking-widest uppercase",
    item: "mt-2",
    meta: "text-neutral-600",
  },
  modern: {
    root: "font-sans text-[10pt] leading-relaxed",
    header: "text-left",
    name: "text-[24pt] font-bold tracking-tight",
    headline: "text-[11pt] text-neutral-600",
    contact: "justify-start",
    section: "mt-5",
    h2: "mb-2 text-[9.5pt] font-bold tracking-[0.18em] uppercase text-neutral-500",
    item: "mt-2.5",
    meta: "text-neutral-500",
  },
  compact: {
    root: "font-sans text-[9pt] leading-tight",
    header: "text-left",
    name: "text-[18pt] font-bold",
    headline: "text-[9.5pt]",
    contact: "justify-start",
    section: "mt-2.5",
    h2: "mb-1 border-b border-neutral-300 text-[9pt] font-bold uppercase",
    item: "mt-1.5",
    meta: "text-neutral-600",
  },
  executive: {
    root: "font-serif text-[11pt] leading-relaxed",
    header: "text-center border-y border-neutral-800 py-3",
    name: "text-[26pt] font-medium tracking-[0.08em] uppercase",
    headline: "text-[11pt] italic",
    contact: "justify-center",
    section: "mt-5",
    h2: "mb-2 text-center text-[10.5pt] font-semibold tracking-[0.25em] uppercase",
    item: "mt-3",
    meta: "text-neutral-600",
  },
};

const dates = (start: string, end: string, current = false) =>
  [start, current ? "Present" : end].filter(Boolean).join(" – ");

function Row({ left, right }: { left: ReactNode; right?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <p className="font-semibold">{left}</p>
      {right ? <p className="shrink-0">{right}</p> : null}
    </div>
  );
}

function Bullets({ items }: { items: string[] }) {
  if (!items.length) return null;
  return (
    <ul className="mt-0.5 list-disc pl-5">
      {items.map((b, i) => (
        <li key={i}>{b}</li>
      ))}
    </ul>
  );
}

function Block({
  title,
  st,
  children,
}: {
  title: string;
  st: Style;
  children: ReactNode;
}) {
  return (
    <section className={st.section}>
      <h2 className={st.h2}>{title}</h2>
      {children}
    </section>
  );
}

function Section({ s, st }: { s: TemplateSection; st: Style }) {
  switch (s.key) {
    case "summary":
      return (
        <Block title="Summary" st={st}>
          <p>{s.text}</p>
        </Block>
      );
    case "experience":
      return (
        <Block title="Experience" st={st}>
          {s.items.map((i) => (
            <div key={i.id} className={st.item}>
              <Row
                left={[i.role, i.company].filter(Boolean).join(", ")}
                right={dates(i.startDate, i.endDate, i.current)}
              />
              {i.location ? <p className={st.meta}>{i.location}</p> : null}
              <Bullets items={i.bullets} />
            </div>
          ))}
        </Block>
      );
    case "education":
      return (
        <Block title="Education" st={st}>
          {s.items.map((i) => (
            <div key={i.id} className={st.item}>
              <Row
                left={[i.degree, i.school].filter(Boolean).join(", ")}
                right={dates(i.startDate, i.endDate)}
              />
              {i.location ? <p className={st.meta}>{i.location}</p> : null}
              {i.details ? <p>{i.details}</p> : null}
            </div>
          ))}
        </Block>
      );
    case "skills":
      return (
        <Block title="Skills" st={st}>
          {s.items.map((i) => (
            <p key={i.id}>
              {i.group ? <strong>{i.group}: </strong> : null}
              {i.items}
            </p>
          ))}
        </Block>
      );
    case "projects":
      return (
        <Block title="Projects" st={st}>
          {s.items.map((i) => (
            <div key={i.id} className={st.item}>
              <Row left={i.name} right={i.url} />
              {i.description ? <p>{i.description}</p> : null}
              <Bullets items={i.bullets} />
            </div>
          ))}
        </Block>
      );
    case "certifications":
      return (
        <Block title="Certifications" st={st}>
          {s.items.map((i) => (
            <div key={i.id} className={st.item}>
              <Row
                left={[i.name, i.issuer].filter(Boolean).join(", ")}
                right={i.date}
              />
            </div>
          ))}
        </Block>
      );
  }
}

/** Pure, single-column, real text. Same output for preview and print. */
export function ResumeTemplate({
  model,
  templateId,
}: {
  model: TemplateModel;
  templateId: TemplateId;
}) {
  const st = STYLES[templateId];
  const { contact } = model;
  const line = [contact.email, contact.phone, contact.location].filter(Boolean);
  return (
    <article className={`bg-white text-neutral-900 ${st.root}`}>
      <header className={st.header}>
        <h1 className={st.name}>{contact.fullName || "Your name"}</h1>
        {contact.headline ? (
          <p className={st.headline}>{contact.headline}</p>
        ) : null}
        <p className={`mt-1 flex flex-wrap gap-x-3 ${st.contact}`}>
          {line.map((v) => (
            <span key={v}>{v}</span>
          ))}
          {contact.links.map((l) => (
            <a key={l.id} href={l.url}>
              {l.label ? `${l.label}: ${l.url}` : l.url}
            </a>
          ))}
        </p>
      </header>
      {model.sections.map((s) => (
        <Section key={s.key} s={s} st={st} />
      ))}
    </article>
  );
}
