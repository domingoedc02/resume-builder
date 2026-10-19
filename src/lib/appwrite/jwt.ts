import { account } from "./client";

/** Short-lived (15 min) token for server routes. Never cache it. */
export async function createJwt(): Promise<string> {
  const { jwt } = await account().createJWT();
  return jwt;
}
