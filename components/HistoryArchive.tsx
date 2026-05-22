"use client";

import { useEffect, useState } from "react";
import { PrimaryButton } from "@/components/PrimaryButton";
import { SoftCard } from "@/components/SoftCard";

type BreathingSession = {
  completedAt?: string;
  date: string;
  duration: string;
  id: string;
  sessionType: string;
};

type JournalEntry = {
  completedAt?: string;
  date: string;
  duration?: string;
  id: string;
  linkedSession?: boolean;
  reflection1: string;
  reflection2: string;
  reflection3: string;
  sessionType?: string;
};

function formatDate(value?: string) {
  if (!value) {
    return "Unknown date";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown date";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function readLocalArray<T>(key: string) {
  try {
    const savedItems = window.localStorage.getItem(key);

    return savedItems ? (JSON.parse(savedItems) as T[]) : [];
  } catch {
    return [];
  }
}

function EmptyHistorySection({ message }: { message: string }) {
  return (
    <SoftCard>
      <div className="mb-5 h-12 w-12 rounded-full bg-[#dbe8c6]/10 shadow-[0_0_35px_rgba(219,232,198,0.1)]" />
      <p className="text-base leading-7 text-[#8a9a8d]">{message}</p>
    </SoftCard>
  );
}

export function HistoryArchive() {
  const [breathingSessions, setBreathingSessions] = useState<
    BreathingSession[]
  >([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);

  useEffect(() => {
    // Storage is browser-only, so history hydrates after this client component mounts.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setBreathingSessions(readLocalArray<BreathingSession>("breathingSessions"));
    setJournalEntries(readLocalArray<JournalEntry>("journalEntries"));
  }, []);

  function handleClearHistory() {
    if (!window.confirm("Clear all breathing and journal history?")) {
      return;
    }

    window.localStorage.removeItem("breathingSessions");
    window.localStorage.removeItem("journalEntries");
    setBreathingSessions([]);
    setJournalEntries([]);
  }

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#9daf96]">
          History
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.02em] text-[#f8f1e3]">
          Your quiet archive
        </h1>
        <p className="mt-3 text-base leading-7 text-[#8a9a8d]">
          Breathing sessions and journal entries will appear here over time.
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-[#f8f1e3]">
          Breathing History
        </h2>
        {breathingSessions.length ? (
          <div className="grid gap-3">
            {breathingSessions.map((session) => (
              <SoftCard className="p-4" key={session.id}>
                <p className="text-sm font-semibold text-[#f8f1e3]">
                  {formatDate(session.completedAt ?? session.date)}
                </p>
                <p className="mt-2 text-sm text-[#8a9a8d]">
                  {session.sessionType} - {session.duration}
                </p>
              </SoftCard>
            ))}
          </div>
        ) : (
          <EmptyHistorySection message="No breathing sessions yet." />
        )}
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-[#f8f1e3]">
          Journal History
        </h2>
        {journalEntries.length ? (
          <div className="grid gap-3">
            {journalEntries.map((entry) => {
              const reflections = [
                entry.reflection1,
                entry.reflection2,
                entry.reflection3,
              ].filter(Boolean);
              const hasLinkedSession =
                entry.linkedSession !== false &&
                Boolean(entry.sessionType && entry.duration);

              return (
                <SoftCard className="p-4" key={entry.id}>
                  <p className="text-sm font-semibold text-[#f8f1e3]">
                    {formatDate(entry.date)}
                  </p>
                  {hasLinkedSession ? (
                    <p className="mt-2 text-sm text-[#9daf96]">
                      Linked to {entry.sessionType} - {entry.duration}
                    </p>
                  ) : (
                    <p className="mt-2 text-sm text-[#9daf96]">
                      Journal only
                    </p>
                  )}
                  <div className="mt-4 space-y-3">
                    {reflections.map((reflection) => (
                      <p
                        className="rounded-[1.25rem] bg-[#0a1410] px-4 py-3 text-sm leading-6 text-[#d5decf]"
                        key={reflection}
                      >
                        {reflection}
                      </p>
                    ))}
                  </div>
                </SoftCard>
              );
            })}
          </div>
        ) : (
          <EmptyHistorySection message="No journal entries yet." />
        )}
      </div>

      <div className="space-y-3 pt-2">
        <PrimaryButton href="/breathing">Start a new session</PrimaryButton>
        <button
          className="min-h-12 w-full rounded-[1.5rem] text-sm font-semibold text-[#667467] transition hover:bg-white/5 hover:text-[#f5efe2]"
          onClick={handleClearHistory}
          type="button"
        >
          Clear history
        </button>
      </div>
    </section>
  );
}
