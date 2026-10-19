"use client";

import { AppwriteException } from "appwrite";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PAGE_LABEL, TEMPLATE_LABEL } from "@/lib/resume/labels";
import { getResume, updateResume, type Resume } from "@/lib/resume/repo";
import type { SaveStatus } from "@/lib/resume/autosave";
import {
  PAGE_SIZES,
  ResumeTooLargeError,
  TEMPLATE_IDS,
  pageSizeSchema,
  templateIdSchema,
  titleSchema,
} from "@/lib/resume/schema";
import { cn } from "@/lib/utils";
import { ContentForm } from "./content-form";
import { PrintSheet } from "./print-sheet";
import { SectionControls } from "./section-controls";
import { Preview } from "./preview";
import { useAutosave } from "./use-autosave";

type Doc = Pick<
  Resume,
  "title" | "templateId" | "pageSize" | "layout" | "content"
>;

const SELECT =
  "border-input bg-background h-8 rounded-md border px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

function describe(e: unknown): string {
  if (e instanceof AppwriteException) {
    if (e.code === 404) return "Resume not found.";
    if (e.code === 401) return "Session expired. Log in again.";
    return e.message;
  }
  return "Could not load this resume.";
}

/** Network blips and server errors retry; validation and auth errors do not. */
function retryable(e: unknown): boolean {
  if (e instanceof AppwriteException) {
    return e.code === 0 || e.code === 429 || e.code >= 500;
  }
  return e instanceof TypeError; // fetch network failure
}

function statusText(status: SaveStatus, error: unknown): string {
  switch (status) {
    case "saving":
      return "Saving…";
    case "saved":
      return "Saved";
    case "error":
      if (error instanceof ResumeTooLargeError) return error.message;
      if (error instanceof AppwriteException && error.code === 401)
        return "Session expired. Log in again to keep saving.";
      return retryable(error)
        ? "Could not save. Retrying…"
        : "Could not save. Check your last change.";
    default:
      return "";
  }
}

function Editor({ initial }: { initial: Resume }) {
  const [doc, setDoc] = useState<Doc>(() => ({
    title: initial.title,
    templateId: initial.templateId,
    pageSize: initial.pageSize,
    layout: initial.layout,
    content: initial.content,
  }));
  const [titleText, setTitleText] = useState(initial.title);
  const [tab, setTab] = useState<"edit" | "preview">("edit");

  // ponytail: writes the whole doc each save (<= 200 KB). Send diffs only if
  // saves get slow.
  const save = useCallback(
    (d: Doc) => updateResume(initial.id, d).then(() => undefined),
    [initial.id],
  );
  const { status, error } = useAutosave(doc, save, retryable);

  function onTitle(value: string) {
    setTitleText(value);
    const parsed = titleSchema.safeParse(value);
    if (parsed.success) setDoc((d) => ({ ...d, title: parsed.data }));
  }

  return (
    <>
      <div className="print:hidden">
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/dashboard"
            className={buttonVariants({ variant: "ghost", size: "sm" })}
          >
            ← Resumes
          </Link>
          <Input
            aria-label="Resume title"
            className="max-w-xs"
            value={titleText}
            maxLength={128}
            onChange={(e) => onTitle(e.target.value)}
            onBlur={() => setTitleText(doc.title)}
          />
          <select
            aria-label="Template"
            className={SELECT}
            value={doc.templateId}
            onChange={(e) =>
              setDoc((d) => ({
                ...d,
                templateId: templateIdSchema.parse(e.target.value),
              }))
            }
          >
            {TEMPLATE_IDS.map((t) => (
              <option key={t} value={t}>
                {TEMPLATE_LABEL[t]}
              </option>
            ))}
          </select>
          <select
            aria-label="Page size"
            className={SELECT}
            value={doc.pageSize}
            onChange={(e) =>
              setDoc((d) => ({
                ...d,
                pageSize: pageSizeSchema.parse(e.target.value),
              }))
            }
          >
            {PAGE_SIZES.map((p) => (
              <option key={p} value={p}>
                {PAGE_LABEL[p]}
              </option>
            ))}
          </select>
          <p
            role="status"
            aria-live="polite"
            className="text-muted-foreground ml-auto text-sm"
          >
            {statusText(status, error)}
          </p>
          <Button
            type="button"
            size="sm"
            onClick={() => window.print()}
            title="Opens the print dialog. Choose Save as PDF."
          >
            Download PDF
          </Button>
        </div>

        <div className="mt-4 flex gap-2 lg:hidden">
          <Button
            type="button"
            size="sm"
            variant={tab === "edit" ? "default" : "outline"}
            aria-pressed={tab === "edit"}
            onClick={() => setTab("edit")}
          >
            Edit
          </Button>
          <Button
            type="button"
            size="sm"
            variant={tab === "preview" ? "default" : "outline"}
            aria-pressed={tab === "preview"}
            onClick={() => setTab("preview")}
          >
            Preview
          </Button>
        </div>

        <div className="mt-6 grid gap-8 lg:grid-cols-2">
          <div className={cn(tab !== "edit" && "hidden lg:block")}>
            <div className="grid gap-8">
              <SectionControls
                layout={doc.layout}
                onChange={(layout) => setDoc((d) => ({ ...d, layout }))}
              />
              <ContentForm
                content={doc.content}
                onChange={(content) => setDoc((d) => ({ ...d, content }))}
              />
            </div>
          </div>
          <div
            className={cn(
              "lg:sticky lg:top-6 lg:self-start",
              tab !== "preview" && "hidden lg:block",
            )}
          >
            <Preview
              content={doc.content}
              layout={doc.layout}
              templateId={doc.templateId}
              pageSize={doc.pageSize}
            />
          </div>
        </div>
      </div>
      <PrintSheet
        content={doc.content}
        layout={doc.layout}
        templateId={doc.templateId}
        pageSize={doc.pageSize}
      />
    </>
  );
}

export function ResumeEditor({ id }: { id: string }) {
  const [state, setState] = useState<{ resume?: Resume; error?: string }>({});

  useEffect(() => {
    let active = true;
    getResume(id)
      .then((resume) => {
        if (active) setState({ resume });
      })
      .catch((e) => {
        if (active) setState({ error: describe(e) });
      });
    return () => {
      active = false;
    };
  }, [id]);

  if (state.error) {
    return (
      <div className="grid gap-4">
        <p role="alert" className="text-destructive text-sm">
          {state.error}
        </p>
        <div>
          <Link
            href="/dashboard"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            Back to resumes
          </Link>
        </div>
      </div>
    );
  }
  if (!state.resume || state.resume.id !== id) {
    return (
      <p role="status" className="text-muted-foreground text-sm">
        Loading resume…
      </p>
    );
  }
  return <Editor key={state.resume.id} initial={state.resume} />;
}
