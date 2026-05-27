"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSupabaseAuthStatus } from "@/lib/supabase/auth-status";
import { createClient } from "@/lib/supabase/client";

const vibrationKey = "vibrationEnabled";

function readVibrationSetting() {
  try {
    const savedValue = window.localStorage.getItem(vibrationKey);

    return savedValue === null ? true : savedValue === "true";
  } catch {
    return true;
  }
}

export function SettingsMenu() {
  const {
    error: authError,
    isConfigured,
    isLoading: isAuthLoading,
    user,
  } = useSupabaseAuthStatus();
  const [authActionError, setAuthActionError] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);

  useEffect(() => {
    // localStorage is only available after this client component mounts.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVibrationEnabled(readVibrationSetting());
  }, []);

  function handleToggleVibration() {
    setVibrationEnabled((currentValue) => {
      const nextValue = !currentValue;

      try {
        window.localStorage.setItem(vibrationKey, String(nextValue));
      } catch {
        // If localStorage is unavailable, keep the in-memory toggle responsive.
      }

      return nextValue;
    });
  }

  async function handleLogout() {
    setAuthActionError("");
    setIsLoggingOut(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signOut();

      if (error) {
        setAuthActionError(error.message);
      }
    } catch (error) {
      setAuthActionError(
        error instanceof Error ? error.message : "Supabase is not configured.",
      );
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <>
      <button
        aria-label="Open settings"
        className="flex h-10 w-10 items-center justify-center rounded-full bg-[#151515] text-lg font-semibold text-[#f4f4f2] shadow-[0_14px_35px_rgba(0,0,0,0.35)]"
        onClick={() => setIsOpen(true)}
        type="button"
      >
        ...
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-20 flex items-end justify-center bg-black/45 px-4 pb-4 backdrop-blur-sm">
          <button
            aria-label="Close settings"
            className="absolute inset-0 cursor-default"
            onClick={() => setIsOpen(false)}
            type="button"
          />
          <section className="relative w-full max-w-md rounded-[2rem] border border-white/10 bg-[#111111] p-5 shadow-[0_-24px_70px_rgba(0,0,0,0.5)]">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-[#f4f4f2]">
                Settings
              </h2>
              <button
                className="rounded-full px-3 py-2 text-sm font-semibold text-[#bdbdb8] transition hover:bg-white/5 hover:text-[#f4f4f2]"
                onClick={() => setIsOpen(false)}
                type="button"
              >
                Close
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-[1.5rem] border border-white/8 bg-[#0f0f0f] p-4">
                <div>
                  <p className="text-sm font-semibold text-[#f4f4f2]">
                    Vibration
                  </p>
                  <p className="mt-1 text-xs leading-5 text-[#9a9a95]">
                    Short cue when the breathing phase changes.
                  </p>
                </div>
                <button
                  aria-label={`Turn vibration ${
                    vibrationEnabled ? "off" : "on"
                  }`}
                  aria-pressed={vibrationEnabled}
                  className={`flex h-8 w-14 items-center rounded-full p-1 transition ${
                    vibrationEnabled ? "bg-[#f2f2ee]" : "bg-[#2a2a2a]"
                  }`}
                  onClick={handleToggleVibration}
                  type="button"
                >
                  <span
                    className={`h-6 w-6 rounded-full bg-[#050505] transition ${
                      vibrationEnabled ? "translate-x-6" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              <div className="rounded-[1.5rem] border border-white/8 bg-[#0f0f0f] p-4">
                <p className="text-sm font-semibold text-[#f4f4f2]">
                  Account
                </p>

                {isAuthLoading ? (
                  <p className="mt-2 text-sm leading-6 text-[#9a9a95]">
                    Checking account...
                  </p>
                ) : user ? (
                  <div className="mt-2 space-y-3">
                    <div>
                      <p className="text-sm leading-6 text-[#d1d1cc]">
                        Signed in as {user.email}
                      </p>
                      <p className="mt-1 text-xs leading-5 text-[#9a9a95]">
                        New entries save to your account. Local guest history
                        can be synced from History.
                      </p>
                    </div>
                    <button
                      className="rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-[#f4f4f2] transition hover:bg-white/8 disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={isLoggingOut}
                      onClick={handleLogout}
                      type="button"
                    >
                      {isLoggingOut ? "Logging out..." : "Log out"}
                    </button>
                  </div>
                ) : (
                  <div className="mt-2 space-y-3">
                    <p className="text-sm leading-6 text-[#9a9a95]">
                      Guest mode is active. Your data is saved on this device
                      only.
                    </p>
                    {isConfigured ? (
                      <Link
                        className="inline-flex rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-[#f4f4f2] transition hover:bg-white/8"
                        href="/auth"
                        onClick={() => setIsOpen(false)}
                      >
                        Log in
                      </Link>
                    ) : (
                      <p className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-xs leading-5 text-[#bdbdb8]">
                        Supabase is not configured yet. Add the public
                        Supabase environment variables to enable login.
                      </p>
                    )}
                  </div>
                )}

                {authActionError ? (
                  <p className="mt-3 rounded-2xl border border-red-400/20 bg-red-400/10 p-3 text-xs leading-5 text-red-100">
                    {authActionError}
                  </p>
                ) : null}

                {!isConfigured && authError ? (
                  <p className="mt-3 text-xs leading-5 text-[#7f7f7a]">
                    {authError}
                  </p>
                ) : null}
              </div>

              <p className="rounded-[1.5rem] bg-[#0f0f0f] p-4 text-sm leading-6 text-[#9a9a95]">
                breathe. helps you slow down, complete guided breathing
                sessions, and reflect daily.
              </p>

              <p className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4 text-sm leading-6 text-[#d1d1cc]">
                Breathe gently. Stop if you feel uncomfortable.
              </p>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
