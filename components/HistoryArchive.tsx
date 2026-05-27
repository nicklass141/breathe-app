"use client";

import { useEffect, useState } from "react";
import { PrimaryButton } from "@/components/PrimaryButton";
import { SoftCard } from "@/components/SoftCard";
import { useSupabaseAuthStatus } from "@/lib/supabase/auth-status";
import {
  clearLocalHistory,
  clearSupabaseHistory,
  fetchSupabaseHistory,
  getLocalHistorySyncStatus,
  readLocalHistory,
  syncLocalHistoryToSupabase,
  type BreathingSession,
  type JournalEntry,
} from "@/lib/storage/history";

const nearbyEntryWindowMs = 10 * 60 * 1000;

type HistoryGroup = {
  breathingSession?: BreathingSession;
  id: string;
  journalEntry?: JournalEntry;
  sortTime: number;
  type: "breath-journal" | "breath-only" | "journal-only";
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

function getTime(value?: string) {
  if (!value) {
    return null;
  }

  const time = new Date(value).getTime();

  return Number.isNaN(time) ? null : time;
}

function getBreathingTime(session: BreathingSession) {
  return getTime(session.completedAt) ?? getTime(session.date) ?? 0;
}

function getJournalTime(entry: JournalEntry) {
  return getTime(entry.date) ?? getTime(entry.completedAt) ?? 0;
}

function getGroupDate(group: HistoryGroup) {
  return (
    group.journalEntry?.date ??
    group.breathingSession?.completedAt ??
    group.breathingSession?.date
  );
}

function getReflectionPreview(entry?: JournalEntry) {
  const reflection = [
    entry?.reflection1,
    entry?.reflection2,
    entry?.reflection3,
  ]
    .map((value) => value?.trim())
    .find(Boolean);

  if (!reflection) {
    return "";
  }

  return reflection.length > 120 ? `${reflection.slice(0, 117)}...` : reflection;
}

function getMoodTags(entry?: JournalEntry) {
  return Array.isArray(entry?.moodTags) ? entry.moodTags.filter(Boolean) : [];
}

function hasLinkedBreathingData(entry: JournalEntry) {
  return (
    entry.linkedSession !== false &&
    Boolean(entry.sessionType && entry.duration)
  );
}

function findExplicitBreathingSession(
  entry: JournalEntry,
  breathingSessions: BreathingSession[],
  usedBreathingIds: Set<string>,
) {
  if (entry.breathingSessionId) {
    const sessionById = breathingSessions.find(
      (session) =>
        session.id === entry.breathingSessionId &&
        !usedBreathingIds.has(session.id),
    );

    if (sessionById) {
      return sessionById;
    }
  }

  if (!hasLinkedBreathingData(entry)) {
    return null;
  }

  return (
    breathingSessions.find((session) => {
      if (usedBreathingIds.has(session.id)) {
        return false;
      }

      return (
        session.sessionType === entry.sessionType &&
        session.duration === entry.duration &&
        session.completedAt === entry.completedAt
      );
    }) ?? null
  );
}

function findNearbyBreathingSession(
  entry: JournalEntry,
  breathingSessions: BreathingSession[],
  usedBreathingIds: Set<string>,
) {
  const journalTime = getJournalTime(entry);
  let closestSession: BreathingSession | null = null;
  let closestDistance = nearbyEntryWindowMs + 1;

  for (const session of breathingSessions) {
    if (usedBreathingIds.has(session.id)) {
      continue;
    }

    const distance = Math.abs(getBreathingTime(session) - journalTime);

    if (distance <= nearbyEntryWindowMs && distance < closestDistance) {
      closestDistance = distance;
      closestSession = session;
    }
  }

  return closestSession;
}

function buildHistoryGroups(
  breathingSessions: BreathingSession[],
  journalEntries: JournalEntry[],
) {
  const groups: HistoryGroup[] = [];
  const usedBreathingIds = new Set<string>();
  const usedJournalIds = new Set<string>();

  for (const entry of journalEntries) {
    const session = findExplicitBreathingSession(
      entry,
      breathingSessions,
      usedBreathingIds,
    );

    if (!session) {
      continue;
    }

    usedBreathingIds.add(session.id);
    usedJournalIds.add(entry.id);
    groups.push({
      breathingSession: session,
      id: `combined-${session.id}-${entry.id}`,
      journalEntry: entry,
      sortTime: Math.max(getBreathingTime(session), getJournalTime(entry)),
      type: "breath-journal",
    });
  }

  for (const entry of journalEntries) {
    if (usedJournalIds.has(entry.id)) {
      continue;
    }

    const session = findNearbyBreathingSession(
      entry,
      breathingSessions,
      usedBreathingIds,
    );

    if (!session) {
      continue;
    }

    usedBreathingIds.add(session.id);
    usedJournalIds.add(entry.id);
    groups.push({
      breathingSession: session,
      id: `nearby-${session.id}-${entry.id}`,
      journalEntry: entry,
      sortTime: Math.max(getBreathingTime(session), getJournalTime(entry)),
      type: "breath-journal",
    });
  }

  for (const session of breathingSessions) {
    if (usedBreathingIds.has(session.id)) {
      continue;
    }

    groups.push({
      breathingSession: session,
      id: `breath-${session.id}`,
      sortTime: getBreathingTime(session),
      type: "breath-only",
    });
  }

  for (const entry of journalEntries) {
    if (usedJournalIds.has(entry.id)) {
      continue;
    }

    groups.push({
      id: `journal-${entry.id}`,
      journalEntry: entry,
      sortTime: getJournalTime(entry),
      type: "journal-only",
    });
  }

  return groups.sort((firstGroup, secondGroup) => {
    return secondGroup.sortTime - firstGroup.sortTime;
  });
}

function EmptyHistorySection({ message }: { message: string }) {
  return (
    <SoftCard>
      <div className="mb-5 h-12 w-12 rounded-full bg-white/8 shadow-[0_0_35px_rgba(255,255,255,0.08)]" />
      <p className="text-base leading-7 text-[#9a9a95]">{message}</p>
    </SoftCard>
  );
}

function HistoryLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="shrink-0 whitespace-nowrap rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-[0.7rem] font-semibold uppercase text-[#d1d1cc]">
      {children}
    </span>
  );
}

function MoodTagList({ tags }: { tags: string[] }) {
  if (!tags.length) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.map((tag) => (
        <span
          className="rounded-full bg-[#0f0f0f] px-2.5 py-1 text-xs font-semibold text-[#c7c7c2]"
          key={tag}
        >
          {tag}
        </span>
      ))}
    </div>
  );
}

function HistoryCard({ group }: { group: HistoryGroup }) {
  const moodTags = getMoodTags(group.journalEntry);
  const reflectionPreview = getReflectionPreview(group.journalEntry);

  return (
    <SoftCard className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[#f4f4f2]">
            {formatDate(getGroupDate(group))}
          </p>
          {group.breathingSession ? (
            <p className="mt-1 text-sm text-[#9a9a95]">
              {group.breathingSession.sessionType} -{" "}
              {group.breathingSession.duration}
            </p>
          ) : null}
        </div>
        <HistoryLabel>
          {group.type === "breath-journal"
            ? "Breath + Journal"
            : group.type === "breath-only"
              ? "Breath only"
              : "Journal only"}
        </HistoryLabel>
      </div>

      {moodTags.length || reflectionPreview ? (
        <div className="mt-4 space-y-3">
          <MoodTagList tags={moodTags} />
          {reflectionPreview ? (
            <p className="rounded-[1.25rem] bg-[#0f0f0f] px-4 py-3 text-sm leading-6 text-[#d8d8d3]">
              {reflectionPreview}
            </p>
          ) : null}
        </div>
      ) : null}
    </SoftCard>
  );
}

export function HistoryArchive() {
  const { isLoading: isAuthLoading, user } = useSupabaseAuthStatus();
  const [breathingSessions, setBreathingSessions] = useState<
    BreathingSession[]
  >([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [hasUnsyncedLocalHistory, setHasUnsyncedLocalHistory] =
    useState(false);
  const [isClearingAccountHistory, setIsClearingAccountHistory] =
    useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [isSyncingLocalHistory, setIsSyncingLocalHistory] = useState(false);
  const [clearError, setClearError] = useState("");
  const [loadError, setLoadError] = useState("");
  const [syncError, setSyncError] = useState("");
  const [syncMessage, setSyncMessage] = useState("");

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    let isMounted = true;

    async function loadHistory() {
      setIsLoadingHistory(true);
      setLoadError("");

      try {
        const history = user
          ? await fetchSupabaseHistory(user.id)
          : readLocalHistory();

        if (!isMounted) {
          return;
        }

        setBreathingSessions(history.breathingSessions);
        setJournalEntries(history.journalEntries);

        if (user) {
          const syncStatus = getLocalHistorySyncStatus(user.id);
          setHasUnsyncedLocalHistory(
            syncStatus.hasLocalHistory && !syncStatus.isAlreadySynced,
          );
        } else {
          setHasUnsyncedLocalHistory(false);
        }
      } catch {
        if (!isMounted) {
          return;
        }

        setLoadError(
          user
            ? "I could not load your account history. Please try refreshing."
            : "I could not load the history saved on this device.",
        );
        setBreathingSessions([]);
        setJournalEntries([]);
      } finally {
        if (isMounted) {
          setIsLoadingHistory(false);
        }
      }
    }

    void loadHistory();

    return () => {
      isMounted = false;
    };
  }, [isAuthLoading, user]);

  function handleClearHistory() {
    if (user) {
      return;
    }

    if (!window.confirm("Clear all breathing and journal history?")) {
      return;
    }

    setClearError("");
    clearLocalHistory();
    setBreathingSessions([]);
    setJournalEntries([]);
  }

  function handleDismissSyncPrompt() {
    setHasUnsyncedLocalHistory(false);
    setSyncError("");
  }

  async function handleSyncLocalHistory() {
    if (!user) {
      return;
    }

    setIsSyncingLocalHistory(true);
    setSyncError("");
    setSyncMessage("");

    try {
      await syncLocalHistoryToSupabase(user.id);
      const history = await fetchSupabaseHistory(user.id);

      setBreathingSessions(history.breathingSessions);
      setJournalEntries(history.journalEntries);
      setHasUnsyncedLocalHistory(false);
      setSyncMessage(
        "Local history synced to your account. Your local copy is still on this device.",
      );
    } catch {
      setSyncError(
        "I could not sync the history saved on this device. Please try again.",
      );
    } finally {
      setIsSyncingLocalHistory(false);
    }
  }

  async function handleClearAccountHistory() {
    if (!user) {
      return;
    }

    const confirmed = window.confirm(
      "Clear account history? This deletes your breathing and journal history from Supabase for this account.",
    );

    if (!confirmed) {
      return;
    }

    setClearError("");
    setIsClearingAccountHistory(true);

    try {
      await clearSupabaseHistory(user.id);
      const history = await fetchSupabaseHistory(user.id);

      setBreathingSessions(history.breathingSessions);
      setJournalEntries(history.journalEntries);
    } catch {
      setClearError(
        "I could not clear your account history. Please try again.",
      );
    } finally {
      setIsClearingAccountHistory(false);
    }
  }

  const historyGroups = buildHistoryGroups(breathingSessions, journalEntries);

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#bdbdb8]">
          History
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.02em] text-[#f4f4f2]">
          Your quiet archive
        </h1>
        <p className="mt-3 text-base leading-7 text-[#9a9a95]">
          {user
            ? "Your account history is loaded from Supabase."
            : "Breathing and journal moments are grouped when they belong together."}
        </p>
      </div>

      {loadError ? (
        <p className="rounded-[1.25rem] bg-[#2a1816] px-4 py-3 text-sm text-[#f5c7bd]">
          {loadError}
        </p>
      ) : null}

      {clearError ? (
        <p className="rounded-[1.25rem] bg-[#2a1816] px-4 py-3 text-sm text-[#f5c7bd]">
          {clearError}
        </p>
      ) : null}

      {user && (hasUnsyncedLocalHistory || syncMessage || syncError) ? (
        <SoftCard className="p-4">
          <div className="space-y-3">
            {hasUnsyncedLocalHistory ? (
              <>
                <div>
                  <p className="text-sm font-semibold text-[#f4f4f2]">
                    You have history saved on this device.
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[#9a9a95]">
                    Sync it to your account?
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    className="min-h-11 rounded-full bg-[#f2f2ee] px-4 text-sm font-semibold text-[#050505] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={isSyncingLocalHistory}
                    onClick={handleSyncLocalHistory}
                    type="button"
                  >
                    {isSyncingLocalHistory ? "Syncing..." : "Sync to account"}
                  </button>
                  <button
                    className="min-h-11 rounded-full border border-white/10 px-4 text-sm font-semibold text-[#bdbdb8] transition hover:bg-white/5 hover:text-[#f4f4f2]"
                    disabled={isSyncingLocalHistory}
                    onClick={handleDismissSyncPrompt}
                    type="button"
                  >
                    Not now
                  </button>
                </div>
              </>
            ) : null}

            {syncMessage ? (
              <p className="text-sm leading-6 text-[#d1d1cc]">{syncMessage}</p>
            ) : null}

            {syncError ? (
              <p className="rounded-[1.25rem] bg-[#2a1816] px-4 py-3 text-sm text-[#f5c7bd]">
                {syncError}
              </p>
            ) : null}
          </div>
        </SoftCard>
      ) : null}

      {isLoadingHistory || isAuthLoading ? (
        <EmptyHistorySection message="Loading history..." />
      ) : historyGroups.length ? (
        <div className="grid gap-3">
          {historyGroups.map((group) => (
            <HistoryCard group={group} key={group.id} />
          ))}
        </div>
      ) : (
        <EmptyHistorySection message="No breathing or journal history yet." />
      )}

      <div className="space-y-3 pt-2">
        <PrimaryButton href="/">Start a new session</PrimaryButton>
        {!user ? (
          <button
            className="min-h-12 w-full rounded-[1.5rem] text-sm font-semibold text-[#777772] transition hover:bg-white/5 hover:text-[#f4f4f2]"
            onClick={handleClearHistory}
            type="button"
          >
            Clear history
          </button>
        ) : (
          <button
            className="min-h-12 w-full rounded-[1.5rem] text-sm font-semibold text-[#777772] transition hover:bg-white/5 hover:text-[#f4f4f2] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isClearingAccountHistory}
            onClick={handleClearAccountHistory}
            type="button"
          >
            {isClearingAccountHistory
              ? "Clearing account history..."
              : "Clear account history"}
          </button>
        )}
      </div>
    </section>
  );
}
