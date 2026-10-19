"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useState, type FormEvent } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authErrorMessage, useAuth } from "./auth-provider";

const loginSchema = z.object({
  email: z.email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
});

const signupSchema = z.object({
  name: z.string().trim().min(1, "Enter your name.").max(128),
  email: z.email("Enter a valid email address."),
  password: z
    .string()
    .min(8, "Use at least 8 characters.")
    .max(256, "Use at most 256 characters."),
});

type Mode = "login" | "signup";
type Errors = Partial<Record<"name" | "email" | "password", string>>;

function Field({
  label,
  name,
  type,
  autoComplete,
  error,
}: {
  label: string;
  name: string;
  type: string;
  autoComplete: string;
  error?: string;
}) {
  const id = useId();
  const errorId = `${id}-error`;
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <Input
        id={id}
        name={name}
        type={type}
        autoComplete={autoComplete}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
      />
      {error ? (
        <p id={errorId} className="text-destructive text-sm">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const { signIn, signUp } = useAuth();
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const isSignup = mode === "signup";

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    const raw = Object.fromEntries(new FormData(event.currentTarget));
    const parsed = (isSignup ? signupSchema : loginSchema).safeParse(raw);
    if (!parsed.success) {
      const fieldErrors = z.flattenError(parsed.error).fieldErrors as Record<
        string,
        string[] | undefined
      >;
      setErrors({
        name: fieldErrors.name?.[0],
        email: fieldErrors.email?.[0],
        password: fieldErrors.password?.[0],
      });
      return;
    }
    setErrors({});
    setPending(true);
    try {
      const data = parsed.data;
      if ("name" in data && typeof data.name === "string") {
        await signUp(data.name, data.email, data.password);
      } else {
        await signIn(data.email, data.password);
      }
      router.replace("/dashboard");
    } catch (e) {
      setFormError(authErrorMessage(e));
      setPending(false);
    }
  }

  return (
    <div className="w-full max-w-sm">
      <h1 className="font-serif text-3xl tracking-tight">
        {isSignup ? "Create your account" : "Welcome back"}
      </h1>
      <p className="text-muted-foreground mt-2 text-sm">
        {isSignup
          ? "Start a resume in a minute."
          : "Log in to open your resumes."}
      </p>
      <form onSubmit={onSubmit} noValidate className="mt-8 space-y-4">
        {isSignup ? (
          <Field
            label="Name"
            name="name"
            type="text"
            autoComplete="name"
            error={errors.name}
          />
        ) : null}
        <Field
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          error={errors.email}
        />
        <Field
          label="Password"
          name="password"
          type="password"
          autoComplete={isSignup ? "new-password" : "current-password"}
          error={errors.password}
        />
        {formError ? (
          <p role="alert" className="text-destructive text-sm">
            {formError}
          </p>
        ) : null}
        <Button type="submit" className="h-10 w-full" disabled={pending}>
          {pending ? "Please wait…" : isSignup ? "Create account" : "Log in"}
        </Button>
      </form>
      <p className="text-muted-foreground mt-6 text-sm">
        {isSignup ? "Already have an account? " : "New here? "}
        <Link
          href={isSignup ? "/login" : "/signup"}
          className="text-foreground font-medium underline underline-offset-4"
        >
          {isSignup ? "Log in" : "Create an account"}
        </Link>
      </p>
    </div>
  );
}
