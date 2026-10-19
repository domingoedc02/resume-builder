"use client";

import { AppwriteException } from "appwrite";
import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  createResume,
  deleteResume,
  duplicateResume,
  listResumes,
  updateResume,
  type ResumeSummary,
} from "@/lib/resume/repo";
import {
  ResumeTooLargeError,
  titleSchema,
  type PageSize,
  type TemplateId,
} from "@/lib/resume/schema";

const TEMPLATE_LABEL: Record<TemplateId, string> = {
  classic: "Classic",
  modern: "Modern",
  compact: "Compact",
  executive: "Executive",
};
const PAGE_LABEL: Record<PageSize, string> = { a4: "A4", letter: "Letter" };
const dateFormat = new Intl.DateTimeFormat("en", { dateStyle: "medium" });

function describe(e: unknown): string {
  if (e instanceof AppwriteException) return e.message;
  if (e instanceof ResumeTooLargeError) return e.message;
  return "Something went wrong. Try again.";
}

export function ResumeList() {
  const { user } = useAuth();
  const userId = user?.$id;
  const [items, setItems] = useState<ResumeSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [confirmId, setConfirmId] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    let active = true;
    listResumes(userId)
      .then((rows) => {
        if (active) setItems(rows);
      })
      .catch((e) => {
        if (active) setError(describe(e));
      });
    return () => {
      active = false;
    };
  }, [userId]);

  async function run(action: () => Promise<void>) {
    setBusy(true);
    setError(null);
    try {
      await action();
    } catch (e) {
      setError(describe(e));
    } finally {
      setBusy(false);
    }
  }

  const onCreate = () =>
    userId &&
    run(async () => {
      const created = await createResume(userId, { title: "Untitled resume" });
      setItems((prev) => [created, ...(prev ?? [])]);
    });

  const onDuplicate = (id: string) =>
    userId &&
    run(async () => {
      const copy = await duplicateResume(userId, id);
      setItems((prev) => [copy, ...(prev ?? [])]);
    });

  const onDelete = (id: string) =>
    run(async () => {
      await deleteResume(id);
      setItems((prev) => (prev ?? []).filter((r) => r.id !== id));
      setConfirmId(null);
    });

  function startRename(item: ResumeSummary) {
    setRenamingId(item.id);
    setDraft(item.title);
    setConfirmId(null);
  }

  async function onRename(event: FormEvent<HTMLFormElement>, id: string) {
    event.preventDefault();
    const parsed = titleSchema.safeParse(draft);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Enter a valid title.");
      return;
    }
    await run(async () => {
      const updatedAt = await updateResume(id, { title: parsed.data });
      setItems((prev) =>
        (prev ?? []).map((r) =>
          r.id === id ? { ...r, title: parsed.data, updatedAt } : r,
        ),
      );
      setRenamingId(null);
    });
  }

  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <h1 className="font-serif text-3xl tracking-tight">Your resumes</h1>
        <Button onClick={onCreate} disabled={busy || !userId}>
          New resume
        </Button>
      </div>

      {error ? (
        <p role="alert" className="text-destructive mt-4 text-sm">
          {error}
        </p>
      ) : null}

      {items === null ? (
        error ? null : (
          <p role="status" className="text-muted-foreground mt-8 text-sm">
            Loading resumes…
          </p>
        )
      ) : items.length === 0 ? (
        <p className="text-muted-foreground mt-8 text-sm">
          No resumes yet. Create your first one.
        </p>
      ) : (
        <ul className="divide-border border-border mt-8 divide-y border-y">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                {renamingId === item.id ? (
                  <form
                    onSubmit={(e) => onRename(e, item.id)}
                    className="flex items-center gap-2"
                  >
                    <Input
                      aria-label="Resume title"
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      maxLength={128}
                      autoFocus
                    />
                    <Button type="submit" size="sm" disabled={busy}>
                      Save
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => setRenamingId(null)}
                    >
                      Cancel
                    </Button>
                  </form>
                ) : (
                  <Link
                    href={`/resumes/${item.id}`}
                    className="block truncate font-medium underline-offset-4 hover:underline"
                  >
                    {item.title}
                  </Link>
                )}
                <p className="text-muted-foreground mt-1 text-xs">
                  {TEMPLATE_LABEL[item.templateId]} ·{" "}
                  {PAGE_LABEL[item.pageSize]} · Edited{" "}
                  {dateFormat.format(new Date(item.updatedAt))}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                {confirmId === item.id ? (
                  <>
                    <span className="mr-1 text-sm">Delete this resume?</span>
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={busy}
                      onClick={() => onDelete(item.id)}
                    >
                      Delete
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setConfirmId(null)}
                    >
                      Keep
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={busy}
                      onClick={() => startRename(item)}
                    >
                      Rename
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={busy}
                      onClick={() => onDuplicate(item.id)}
                    >
                      Duplicate
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={busy}
                      onClick={() => setConfirmId(item.id)}
                    >
                      Delete
                    </Button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
