"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { useSupabaseAuthStatus } from "@/lib/supabase/auth-status";
import { createClient } from "@/lib/supabase/client";

type AuthMode = "login" | "signup";

export function AuthForm() {
  const router = useRouter();
  const {
    error: configurationError,
    isConfigured,
    isLoading: isAuthLoading,
    user,
  } = useSupabaseAuthStatus();
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthLoading || !isConfigured) {
      return;
    }

    if (user) {
      router.push("/");
      return;
    }

    const authSearch = window.location.search;
    const authHash = window.location.hash;
    const cameFromEmailLink =
      authSearch.includes("code=") ||
      authSearch.includes("token_hash=") ||
      authHash.includes("access_token=");

    if (cameFromEmailLink) {
      // The confirmation link can only be inspected after the browser page mounts.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMessage("Email confirmed. Log in to continue.");
    }
  }, [isAuthLoading, isConfigured, router, user]);

  function handleModeChange(nextMode: AuthMode) {
    setMode(nextMode);
    setError("");
    setMessage("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setError("Enter your email address.");
      return;
    }

    if (!password) {
      setError("Enter your password.");
      return;
    }

    if (mode === "signup" && password.length < 6) {
      setError("Use at least 6 characters for your password.");
      return;
    }

    setIsSubmitting(true);

    try {
      const supabase = createClient();
      const response =
        mode === "login"
          ? await supabase.auth.signInWithPassword({
              email: trimmedEmail,
              password,
            })
          : await supabase.auth.signUp({
              email: trimmedEmail,
              options: {
                emailRedirectTo: `${window.location.origin}/auth`,
              },
              password,
            });

      if (response.error) {
        setError(response.error.message);
        return;
      }

      if (mode === "login" || response.data.session) {
        router.push("/");
        return;
      }

      setMessage("Check your email to confirm your account, then log in.");
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Supabase is not configured.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isConfigured) {
    return (
      <section className="flex flex-1 flex-col justify-center gap-6 pb-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#bdbdb8]">
            Account
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.02em] text-[#f4f4f2]">
            Supabase needs setup
          </h1>
          <p className="mt-3 text-base leading-7 text-[#9a9a95]">
            Guest mode still works. Add the public Supabase environment
            variables to enable login and sign up.
          </p>
        </div>

        <div className="rounded-[1.5rem] border border-white/10 bg-[#111111] p-4 text-sm leading-6 text-[#d1d1cc]">
          <p className="font-semibold text-[#f4f4f2]">
            Missing Supabase configuration
          </p>
          <p className="mt-2 text-[#9a9a95]">
            Set NEXT_PUBLIC_SUPABASE_URL and
            NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in .env.local, then restart the
            dev server.
          </p>
          {configurationError ? (
            <p className="mt-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-xs text-[#bdbdb8]">
              {configurationError}
            </p>
          ) : null}
        </div>

        <Link
          className="text-center text-sm font-semibold text-[#9a9a95] transition hover:text-[#f4f4f2]"
          href="/"
        >
          Continue as guest
        </Link>
      </section>
    );
  }

  return (
    <section className="flex flex-1 flex-col justify-center gap-6 pb-4">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#bdbdb8]">
          Account
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.02em] text-[#f4f4f2]">
          {mode === "login" ? "Log in" : "Sign up"}
        </h1>
        <p className="mt-3 text-base leading-7 text-[#9a9a95]">
          Guest mode still saves on this device. Syncing will be added later.
        </p>
      </div>

      <div className="grid grid-cols-2 rounded-full border border-white/8 bg-[#111111] p-1">
        <button
          className={`min-h-11 rounded-full text-sm font-semibold transition ${
            mode === "login"
              ? "bg-[#f2f2ee] text-[#050505]"
              : "text-[#9a9a95] hover:text-[#f4f4f2]"
          }`}
          onClick={() => handleModeChange("login")}
          type="button"
        >
          Log in
        </button>
        <button
          className={`min-h-11 rounded-full text-sm font-semibold transition ${
            mode === "signup"
              ? "bg-[#f2f2ee] text-[#050505]"
              : "text-[#9a9a95] hover:text-[#f4f4f2]"
          }`}
          onClick={() => handleModeChange("signup")}
          type="button"
        >
          Sign up
        </button>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <label className="block">
          <span className="text-sm font-semibold text-[#f4f4f2]">Email</span>
          <input
            autoComplete="email"
            className="mt-3 min-h-12 w-full rounded-[1.5rem] border border-white/8 bg-[#0f0f0f] px-4 text-base text-[#f4f4f2] outline-none placeholder:text-[#5f5f5a] focus:border-[#d8d8d3] focus:ring-2 focus:ring-white/10"
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            type="email"
            value={email}
          />
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-[#f4f4f2]">
            Password
          </span>
          <input
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            className="mt-3 min-h-12 w-full rounded-[1.5rem] border border-white/8 bg-[#0f0f0f] px-4 text-base text-[#f4f4f2] outline-none placeholder:text-[#5f5f5a] focus:border-[#d8d8d3] focus:ring-2 focus:ring-white/10"
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Password"
            type="password"
            value={password}
          />
        </label>

        {error ? (
          <p className="rounded-[1.25rem] bg-[#2a1816] px-4 py-3 text-sm leading-6 text-[#f5c7bd]">
            {error}
          </p>
        ) : null}

        {message ? (
          <p className="rounded-[1.25rem] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm leading-6 text-[#d1d1cc]">
            {message}
          </p>
        ) : null}

        <button
          className="min-h-14 w-full rounded-[1.75rem] bg-[#f2f2ee] px-6 text-base font-semibold text-[#050505] transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#f2f2ee] focus:ring-offset-2 focus:ring-offset-[#050505] disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting
            ? "Please wait..."
            : mode === "login"
              ? "Log in"
              : "Create account"}
        </button>
      </form>

      <Link
        className="text-center text-sm font-semibold text-[#9a9a95] transition hover:text-[#f4f4f2]"
        href="/"
      >
        Continue as guest
      </Link>
    </section>
  );
}
