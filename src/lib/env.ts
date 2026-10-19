import { z } from "zod";

const publicSchema = z.object({
  endpoint: z.url(),
  projectId: z.string().min(1),
  databaseId: z.string().min(1),
  resumesTableId: z.string().min(1),
});

export type PublicEnv = z.infer<typeof publicSchema>;

let cached: PublicEnv | undefined;

/** Browser-safe config. Literal `process.env.NEXT_PUBLIC_*` reads are required for Next.js inlining. */
export function publicEnv(): PublicEnv {
  cached ??= publicSchema.parse({
    endpoint: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT,
    projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID,
    databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
    resumesTableId: process.env.NEXT_PUBLIC_APPWRITE_RESUMES_TABLE_ID,
  });
  return cached;
}
