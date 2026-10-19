"use client";

import { ID } from "appwrite";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { ResumeContent } from "@/lib/resume/schema";

type Contact = ResumeContent["contact"];
type Kind = "text" | "area" | "lines" | "check";
type FieldDef<T> = {
  key: Extract<keyof T, string>;
  label: string;
  max: number;
  kind?: Kind;
};

const MAX_LINES = 30;
const MAX_LINE = 1000;
const read = (item: object, key: string): unknown =>
  (item as Record<string, unknown>)[key];

function Labeled({
  label,
  children,
  wide,
}: {
  label: string;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <label className={`grid gap-1 text-sm ${wide ? "sm:col-span-2" : ""}`}>
      <span className="text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function ItemList<T extends { id: string }>({
  title,
  noun,
  items,
  max,
  fields,
  blank,
  heading,
  onChange,
}: {
  title: string;
  noun: string;
  items: T[];
  max: number;
  fields: FieldDef<T>[];
  blank: () => T;
  heading: (item: T) => string;
  onChange: (items: T[]) => void;
}) {
  const set = (id: string, key: string, value: unknown) =>
    onChange(
      items.map((i) => (i.id === id ? ({ ...i, [key]: value } as T) : i)),
    );

  return (
    <section className="grid gap-3">
      <h2 className="font-serif text-xl tracking-tight">{title}</h2>
      {items.map((item, n) => (
        <fieldset
          key={item.id}
          className="border-border grid gap-3 rounded-lg border p-4 sm:grid-cols-2"
        >
          <legend className="px-1 text-sm font-medium">
            {heading(item) || `${noun} ${n + 1}`}
          </legend>
          {fields.map((f) => {
            const v = read(item, f.key);
            if (f.kind === "check") {
              return (
                <label
                  key={f.key}
                  className="flex items-center gap-2 text-sm sm:col-span-2"
                >
                  <input
                    type="checkbox"
                    checked={v === true}
                    onChange={(e) => set(item.id, f.key, e.target.checked)}
                  />
                  {f.label}
                </label>
              );
            }
            if (f.kind === "lines") {
              return (
                <Labeled key={f.key} label={f.label} wide>
                  <Textarea
                    value={Array.isArray(v) ? v.join("\n") : ""}
                    onChange={(e) =>
                      set(
                        item.id,
                        f.key,
                        e.target.value
                          .split("\n")
                          .slice(0, MAX_LINES)
                          .map((l) => l.slice(0, MAX_LINE)),
                      )
                    }
                  />
                </Labeled>
              );
            }
            const text = typeof v === "string" ? v : "";
            return (
              <Labeled key={f.key} label={f.label} wide={f.kind === "area"}>
                {f.kind === "area" ? (
                  <Textarea
                    value={text}
                    maxLength={f.max}
                    onChange={(e) => set(item.id, f.key, e.target.value)}
                  />
                ) : (
                  <Input
                    value={text}
                    maxLength={f.max}
                    onChange={(e) => set(item.id, f.key, e.target.value)}
                  />
                )}
              </Labeled>
            );
          })}
          <div className="sm:col-span-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onChange(items.filter((i) => i.id !== item.id))}
            >
              Remove {noun}
            </Button>
          </div>
        </fieldset>
      ))}
      <div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={items.length >= max}
          onClick={() => onChange([...items, blank()])}
        >
          Add {noun}
        </Button>
      </div>
    </section>
  );
}

const CONTACT_FIELDS: Array<{
  key: Exclude<keyof Contact, "links">;
  label: string;
  max: number;
}> = [
  { key: "fullName", label: "Full name", max: 128 },
  { key: "headline", label: "Headline", max: 128 },
  { key: "email", label: "Email", max: 254 },
  { key: "phone", label: "Phone", max: 32 },
  { key: "location", label: "Location", max: 128 },
];

export function ContentForm({
  content,
  onChange,
}: {
  content: ResumeContent;
  onChange: (next: ResumeContent) => void;
}) {
  const c = content.contact;
  const patch = <K extends keyof ResumeContent>(
    key: K,
    value: ResumeContent[K],
  ) => onChange({ ...content, [key]: value });

  return (
    <div className="grid gap-8">
      <section className="grid gap-3">
        <h2 className="font-serif text-xl tracking-tight">Contact</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {CONTACT_FIELDS.map((f) => (
            <Labeled key={f.key} label={f.label}>
              <Input
                value={c[f.key]}
                maxLength={f.max}
                onChange={(e) =>
                  patch("contact", { ...c, [f.key]: e.target.value })
                }
              />
            </Labeled>
          ))}
        </div>
        <ItemList
          title="Links"
          noun="link"
          items={c.links}
          max={6}
          heading={(l) => l.label}
          blank={() => ({ id: ID.unique(), label: "", url: "" })}
          fields={[
            { key: "label", label: "Label", max: 64 },
            { key: "url", label: "URL", max: 300 },
          ]}
          onChange={(links) => patch("contact", { ...c, links })}
        />
      </section>

      <section className="grid gap-3">
        <h2 className="font-serif text-xl tracking-tight">Summary</h2>
        <Textarea
          aria-label="Summary"
          value={content.summary}
          maxLength={3000}
          onChange={(e) => patch("summary", e.target.value)}
        />
      </section>

      <ItemList
        title="Experience"
        noun="position"
        items={content.experience}
        max={20}
        heading={(i) => [i.role, i.company].filter(Boolean).join(", ")}
        blank={() => ({
          id: ID.unique(),
          role: "",
          company: "",
          location: "",
          startDate: "",
          endDate: "",
          current: false,
          bullets: [],
        })}
        fields={[
          { key: "role", label: "Role", max: 128 },
          { key: "company", label: "Company", max: 128 },
          { key: "location", label: "Location", max: 128 },
          { key: "startDate", label: "Start date", max: 32 },
          { key: "endDate", label: "End date", max: 32 },
          { key: "current", label: "I work here now", max: 0, kind: "check" },
          {
            key: "bullets",
            label: "Highlights (one per line)",
            max: 0,
            kind: "lines",
          },
        ]}
        onChange={(v) => patch("experience", v)}
      />

      <ItemList
        title="Education"
        noun="school"
        items={content.education}
        max={10}
        heading={(i) => [i.degree, i.school].filter(Boolean).join(", ")}
        blank={() => ({
          id: ID.unique(),
          school: "",
          degree: "",
          location: "",
          startDate: "",
          endDate: "",
          details: "",
        })}
        fields={[
          { key: "school", label: "School", max: 128 },
          { key: "degree", label: "Degree", max: 128 },
          { key: "location", label: "Location", max: 128 },
          { key: "startDate", label: "Start date", max: 32 },
          { key: "endDate", label: "End date", max: 32 },
          { key: "details", label: "Details", max: 1000, kind: "area" },
        ]}
        onChange={(v) => patch("education", v)}
      />

      <ItemList
        title="Skills"
        noun="skill group"
        items={content.skills}
        max={12}
        heading={(i) => i.group}
        blank={() => ({ id: ID.unique(), group: "", items: "" })}
        fields={[
          { key: "group", label: "Group (optional)", max: 64 },
          { key: "items", label: "Skills, comma separated", max: 500 },
        ]}
        onChange={(v) => patch("skills", v)}
      />

      <ItemList
        title="Projects"
        noun="project"
        items={content.projects}
        max={12}
        heading={(i) => i.name}
        blank={() => ({
          id: ID.unique(),
          name: "",
          url: "",
          description: "",
          bullets: [],
        })}
        fields={[
          { key: "name", label: "Name", max: 128 },
          { key: "url", label: "URL", max: 300 },
          { key: "description", label: "Description", max: 500, kind: "area" },
          {
            key: "bullets",
            label: "Highlights (one per line)",
            max: 0,
            kind: "lines",
          },
        ]}
        onChange={(v) => patch("projects", v)}
      />

      <ItemList
        title="Certifications"
        noun="certification"
        items={content.certifications}
        max={20}
        heading={(i) => i.name}
        blank={() => ({ id: ID.unique(), name: "", issuer: "", date: "" })}
        fields={[
          { key: "name", label: "Name", max: 128 },
          { key: "issuer", label: "Issuer", max: 128 },
          { key: "date", label: "Date", max: 32 },
        ]}
        onChange={(v) => patch("certifications", v)}
      />
    </div>
  );
}
