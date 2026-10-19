import { Account, Client, TablesDB } from "appwrite";
import { publicEnv } from "@/lib/env";

let client: Client | undefined;

function getClient(): Client {
  if (!client) {
    const env = publicEnv();
    client = new Client().setEndpoint(env.endpoint).setProject(env.projectId);
  }
  return client;
}

export const account = () => new Account(getClient());
export const tablesDB = () => new TablesDB(getClient());
