"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

type AuthStatus = {
  error: string;
  isConfigured: boolean;
  isLoading: boolean;
  user: User | null;
};

export function useSupabaseAuthStatus(): AuthStatus {
  const [authStatus, setAuthStatus] = useState<AuthStatus>({
    error: "",
    isConfigured: true,
    isLoading: true,
    user: null,
  });

  useEffect(() => {
    let isMounted = true;

    try {
      const supabase = createClient();

      supabase.auth.getUser().then(({ data, error }) => {
        if (!isMounted) {
          return;
        }

        setAuthStatus({
          error: error?.message ?? "",
          isConfigured: true,
          isLoading: false,
          user: data.user,
        });
      });

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        if (!isMounted) {
          return;
        }

        setAuthStatus({
          error: "",
          isConfigured: true,
          isLoading: false,
          user: session?.user ?? null,
        });
      });

      return () => {
        isMounted = false;
        subscription.unsubscribe();
      };
    } catch (error) {
      if (!isMounted) {
        return;
      }

      // Supabase env is only checked after this browser-only hook mounts.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAuthStatus({
        error:
          error instanceof Error ? error.message : "Supabase is not configured.",
        isConfigured: false,
        isLoading: false,
        user: null,
      });
    }

    return () => {
      isMounted = false;
    };
  }, []);

  return authStatus;
}
