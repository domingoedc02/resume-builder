/**
 * Idempotent Appwrite provisioning: database, `resumes` and `rate_limits` tables,
 * columns, indexes, permissions. Safe to re-run.
 *
 *   npm run setup:appwrite
 *
 * Needs a setup-only API key (databases.write, tables.write, columns.write,
 * indexes.write). Do not reuse it as APPWRITE_API_KEY and do not commit it.
 */
import {
  AppwriteException,
  Client,
  Permission,
  Role,
  TablesDB,
  TablesDBIndexType,
} from "node-appwrite";

function need(name: string): string {
  const value = process.env[name];
  if (!value) {
    console.error(`Missing ${name}. See .env.example.`);
    process.exit(1);
  }
  return value;
}

const endpoint = need("NEXT_PUBLIC_APPWRITE_ENDPOINT");
const projectId = need("NEXT_PUBLIC_APPWRITE_PROJECT_ID");
const databaseId = need("NEXT_PUBLIC_APPWRITE_DATABASE_ID");
const resumesTableId =
  process.env.NEXT_PUBLIC_APPWRITE_RESUMES_TABLE_ID || "resumes";
const rateLimitsTableId = "rate_limits";
const apiKey = need("APPWRITE_SETUP_API_KEY");

const db = new TablesDB(
  new Client().setEndpoint(endpoint).setProject(projectId).setKey(apiKey),
);

const notFound = (e: unknown) =>
  e instanceof AppwriteException && e.code === 404;

async function ensureDatabase() {
  try {
    await db.get({ databaseId });
    console.log(`database ${databaseId}: exists`);
  } catch (e) {
    if (!notFound(e)) throw e;
    await db.create({ databaseId, name: "Folio" });
    console.log(`database ${databaseId}: created`);
  }
}

async function ensureTable(
  tableId: string,
  name: string,
  permissions: string[],
  rowSecurity: boolean,
) {
  try {
    await db.getTable({ databaseId, tableId });
    // Re-assert security settings so drift is corrected on every run.
    await db.updateTable({
      databaseId,
      tableId,
      name,
      permissions,
      rowSecurity,
    });
    console.log(`table ${tableId}: exists, permissions re-applied`);
  } catch (e) {
    if (!notFound(e)) throw e;
    await db.createTable({
      databaseId,
      tableId,
      name,
      permissions,
      rowSecurity,
    });
    console.log(`table ${tableId}: created`);
  }
}

async function ensureColumn(
  tableId: string,
  key: string,
  create: () => Promise<unknown>,
) {
  try {
    await db.getColumn({ databaseId, tableId, key });
    console.log(`  column ${key}: exists`);
  } catch (e) {
    if (!notFound(e)) throw e;
    await create();
    console.log(`  column ${key}: created`);
  }
}

/** Columns build asynchronously; indexes and rows need them `available`. */
async function waitForColumns(tableId: string) {
  for (let attempt = 0; attempt < 60; attempt++) {
    const { columns } = await db.listColumns({ databaseId, tableId });
    const pending = columns.filter((c) => c.status !== "available");
    if (pending.length === 0) return;
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error(`Columns on ${tableId} did not become available in 60s.`);
}

async function ensureIndex(tableId: string, key: string, columns: string[]) {
  const { indexes } = await db.listIndexes({ databaseId, tableId });
  if (indexes.some((i) => i.key === key)) {
    console.log(`  index ${key}: exists`);
    return;
  }
  await db.createIndex({
    databaseId,
    tableId,
    key,
    type: TablesDBIndexType.Key,
    columns,
  });
  console.log(`  index ${key}: created`);
}

async function main() {
  await ensureDatabase();

  // Users may create rows; read/update/delete are granted per row to its owner.
  await ensureTable(
    resumesTableId,
    "Resumes",
    [Permission.create(Role.users())],
    true,
  );
  const t = resumesTableId;
  const varchar = (key: string, size: number) => () =>
    db.createVarcharColumn({
      databaseId,
      tableId: t,
      key,
      size,
      required: true,
    });
  await ensureColumn(t, "userId", varchar("userId", 36));
  await ensureColumn(t, "title", varchar("title", 128));
  await ensureColumn(t, "templateId", varchar("templateId", 32));
  await ensureColumn(t, "pageSize", varchar("pageSize", 8));
  await ensureColumn(t, "layout", () =>
    db.createTextColumn({
      databaseId,
      tableId: t,
      key: "layout",
      required: true,
    }),
  );
  await ensureColumn(t, "content", () =>
    db.createMediumtextColumn({
      databaseId,
      tableId: t,
      key: "content",
      required: true,
    }),
  );
  await waitForColumns(t);
  await ensureIndex(t, "idx_userId", ["userId"]);

  // Server-only: no table permissions, no row security. Only the API key can touch it.
  await ensureTable(rateLimitsTableId, "Rate limits", [], false);
  await ensureColumn(rateLimitsTableId, "count", () =>
    db.createIntegerColumn({
      databaseId,
      tableId: rateLimitsTableId,
      key: "count",
      required: true,
      min: 0,
    }),
  );
  await waitForColumns(rateLimitsTableId);

  console.log("Appwrite setup complete.");
}

main().catch((e) => {
  console.error(
    e instanceof AppwriteException ? `Appwrite ${e.code}: ${e.message}` : e,
  );
  process.exit(1);
});
