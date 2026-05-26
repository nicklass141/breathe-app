import { AppShell } from "@/components/AppShell";
import { PrimaryButton } from "@/components/PrimaryButton";
import { SoftCard } from "@/components/SoftCard";

export default function Home() {
  return (
    <AppShell activeTab="breathe">
      <section className="flex flex-1 flex-col justify-between gap-8">
        <div className="space-y-6 pt-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#9daf96]">
              Daily breathing and reflection
            </p>
            <h1 className="mt-4 text-5xl font-semibold tracking-[-0.04em] text-[#f8f1e3]">
              breathe.
            </h1>
            <p className="mt-5 text-base leading-7 text-[#8a9a8d]">
              Slow down with guided breathing sessions, then capture a few
              thoughts in a simple daily journal.
            </p>
          </div>

          <SoftCard className="p-4">
            <p className="text-sm font-semibold text-[#f8f1e3]">
              Your quiet reset
            </p>
            <p className="mt-2 text-sm leading-6 text-[#8a9a8d]">
              Choose a breathing rhythm, follow the orb, and reflect when you
              are done.
            </p>
          </SoftCard>
        </div>

        <div className="space-y-3">
          <PrimaryButton href="/breathing">Start breathing</PrimaryButton>
          <PrimaryButton href="/journal" variant="secondary">
            Journal
          </PrimaryButton>
          <PrimaryButton href="/history" variant="ghost">
            View history
          </PrimaryButton>
        </div>
      </section>
    </AppShell>
  );
}
