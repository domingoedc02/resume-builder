import { ID, Permission, Query, Role, type Models } from "appwrite";
import { tablesDB } from "@/lib/appwrite/client";
import { publicEnv } from "@/lib/env";
import {
  defaultLayout,
  emptyContent,
  pageSizeSchema,
  parseContent,
  parseLayout,
  serializeContent,
  serializeLayout,
  templateIdSchema,
  type PageSize,
  type ResumeContent,
  type ResumeLayout,
  type TemplateId,
} from "./schema";

type ResumeRow = Models.Row & {
  userId: string;
  title: string;
  templateId: string;
  pageSize: string;
  layout: string;
  content: string;
};
type SummaryRow = Models.Row &
  Pick<ResumeRow, "title" | "templateId" | "pageSize">;

export type ResumeSummary = {
  id: string;
  title: string;
  templateId: TemplateId;
  pageSize: PageSize;
  updatedAt: string;
};

export type Resume = ResumeSummary & {
  userId: string;
  createdAt: string;
  layout: ResumeLayout;
  content: ResumeContent;
};

export type ResumePatch = Partial<{
  title: string;
  templateId: TemplateId;
  pageSize: PageSize;
  layout: ResumeLayout;
  content: ResumeContent;
}>;

const target = () => {
  const env = publicEnv();
  return { databaseId: env.databaseId, tableId: env.resumesTableId };
};

/** Owner-only. No Role.any(): a resume is private to its author. */
const ownerPermissions = (userId: string) => [
  Permission.read(Role.user(userId)),
  Permission.update(Role.user(userId)),
  Permission.delete(Role.user(userId)),
];

const toSummary = (row: SummaryRow): ResumeSummary => ({
  id: row.$id,
  title: row.title,
  templateId: templateIdSchema.parse(row.templateId),
  pageSize: pageSizeSchema.parse(row.pageSize),
  updatedAt: row.$updatedAt,
});

const toResume = (row: ResumeRow): Resume => ({
  ...toSummary(row),
  userId: row.userId,
  createdAt: row.$createdAt,
  layout: parseLayout(row.layout),
  content: parseContent(row.content),
});

/** Lists metadata only. `content` is the large column and is not fetched here. */
export async function listResumes(userId: string): Promise<ResumeSummary[]> {
  const { rows } = await tablesDB().listRows<SummaryRow>({
    ...target(),
    queries: [
      Query.equal("userId", [userId]),
      Query.orderDesc("$updatedAt"),
      Query.limit(100),
      Query.select(["title", "templateId", "pageSize"]),
    ],
    total: false,
  });
  return rows.map(toSummary);
}

export async function getResume(id: string): Promise<Resume> {
  const row = await tablesDB().getRow<ResumeRow>({ ...target(), rowId: id });
  return toResume(row);
}

export async function createResume(
  userId: string,
  input: {
    title: string;
    templateId?: TemplateId;
    pageSize?: PageSize;
    layout?: ResumeLayout;
    content?: ResumeContent;
  },
): Promise<ResumeSummary> {
  const row = await tablesDB().createRow<ResumeRow>({
    ...target(),
    rowId: ID.unique(),
    data: {
      userId,
      title: input.title,
      templateId: input.templateId ?? "classic",
      pageSize: input.pageSize ?? "a4",
      layout: serializeLayout(input.layout ?? defaultLayout()),
      content: serializeContent(input.content ?? emptyContent()),
    },
    permissions: ownerPermissions(userId),
  });
  return toSummary(row);
}

/** Returns the new `$updatedAt`. Only provided fields are written. */
export async function updateResume(
  id: string,
  patch: ResumePatch,
): Promise<string> {
  const data: Partial<
    Pick<ResumeRow, "title" | "templateId" | "pageSize" | "layout" | "content">
  > = {};
  if (patch.title !== undefined) data.title = patch.title;
  if (patch.templateId !== undefined) data.templateId = patch.templateId;
  if (patch.pageSize !== undefined) data.pageSize = patch.pageSize;
  if (patch.layout !== undefined) data.layout = serializeLayout(patch.layout);
  if (patch.content !== undefined)
    data.content = serializeContent(patch.content);
  const row = await tablesDB().updateRow<ResumeRow>({
    ...target(),
    rowId: id,
    data,
  });
  return row.$updatedAt;
}

export async function duplicateResume(
  userId: string,
  id: string,
): Promise<ResumeSummary> {
  const source = await getResume(id);
  return createResume(userId, {
    title: `${source.title} (copy)`.slice(0, 128),
    templateId: source.templateId,
    pageSize: source.pageSize,
    layout: source.layout,
    content: source.content,
  });
}

export async function deleteResume(id: string): Promise<void> {
  await tablesDB().deleteRow({ ...target(), rowId: id });
}
