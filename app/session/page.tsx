import { Suspense } from "react";
import { AppShell } from "@/components/AppShell";
import { SessionFromSearchParams } from "@/components/SessionFromSearchParams";

export default function BreathingSessionPage() {
  return (
    <AppShell activeTab="breathe">
      <Suspense fallback={null}>
        <SessionFromSearchParams />
      </Suspense>
    </AppShell>
  );
}
