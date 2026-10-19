import "server-only";
import { z } from "zod";

const serverSchema = z.object({
  appwriteApiKey: z.string().min(1),
  aiBaseUrl: z.url(),
  aiApiKey: z.string().min(1),
  aiModel: z.string().min(1),
  aiRateLimitPerHour: z.coerce.number().int().positive().default(30),
});

export type ServerEnv = z.infer<typeof serverSchema>;

let cached: ServerEnv | undefined;

/** Secrets. Server-only: importing this from a client component fails the build. */
export function serverEnv(): ServerEnv {
  cached ??= serverSchema.parse({
    appwriteApiKey: process.env.APPWRITE_API_KEY,
    aiBaseUrl: process.env.AI_BASE_URL,
    aiApiKey: process.env.AI_API_KEY,
    aiModel: process.env.AI_MODEL,
    aiRateLimitPerHour: process.env.AI_RATE_LIMIT_PER_HOUR || undefined,
  });
  return cached;
}
