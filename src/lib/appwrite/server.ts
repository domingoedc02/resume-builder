import "server-only";
import { Account, Client, TablesDB } from "node-appwrite";
import { publicEnv } from "@/lib/env";
import { serverEnv } from "@/lib/env.server";

function baseClient(): Client {
  const env = publicEnv();
  return new Client().setEndpoint(env.endpoint).setProject(env.projectId);
}

/** API-key client. Bypasses row permissions: use only for server-owned tables. */
export function adminTablesDB(): TablesDB {
  return new TablesDB(baseClient().setKey(serverEnv().appwriteApiKey));
}

/** Verifies a browser JWT with Appwrite and returns the real user ID. Throws on invalid or expired. */
export async function verifyJwt(jwt: string): Promise<string> {
  const user = await new Account(baseClient().setJWT(jwt)).get();
  return user.$id;
}
