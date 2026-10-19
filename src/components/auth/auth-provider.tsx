"use client";

import { AppwriteException, ID, type Models } from "appwrite";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { account } from "@/lib/appwrite/client";

export type AuthUser = Models.User<Models.Preferences>;

type AuthState = {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function authErrorMessage(e: unknown): string {
  if (e instanceof AppwriteException) {
    if (e.code === 401) return "Email or password is incorrect.";
    if (e.code === 409) return "An account with this email already exists.";
    if (e.code === 429)
      return "Too many attempts. Wait a minute and try again.";
    if (e.code >= 500) return "Appwrite is unavailable. Try again shortly.";
    return e.message;
  }
  if (e instanceof Error && e.name === "ZodError") {
    return "App is not configured. Check the NEXT_PUBLIC_APPWRITE_* values in .env.local.";
  }
  return "Something went wrong. Try again.";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    account()
      .get()
      .then((u) => active && setUser(u))
      .catch(() => active && setUser(null)) // 401 = no session; expected.
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    await account().createEmailPasswordSession({ email, password });
    setUser(await account().get());
  }, []);

  const signUp = useCallback(
    async (name: string, email: string, password: string) => {
      await account().create({ userId: ID.unique(), email, password, name });
      await signIn(email, password);
    },
    [signIn],
  );

  const signOut = useCallback(async () => {
    try {
      await account().deleteSession({ sessionId: "current" });
    } finally {
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({ user, loading, signIn, signUp, signOut }),
    [user, loading, signIn, signUp, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>.");
  return ctx;
}
