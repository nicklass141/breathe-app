"use client";

import { createClient } from "@/lib/supabase/client";

export type PendingBreathingSession = {
  completedAt: string;
  duration: string;
  durationSeconds?: number;
  patternName?: string;
  sessionType: string;
};

export type BreathingSession = {
  completedAt?: string;
  date: string;
  duration: string;
  durationSeconds?: number;
  id: string;
  sessionType: string;
};

export type JournalEntry = {
  breathingSessionId?: string;
  completedAt?: string;
  date: string;
  duration?: string;
  entryType?: "post_breathing" | "standalone";
  id: string;
  linkedSession?: boolean;
  moodTags?: string[];
  reflection1: string;
  reflection2: string;
  reflection3: string;
  sessionType?: string;
};

export type HistoryData = {
  breathingSessions: BreathingSession[];
  journalEntries: JournalEntry[];
};

export type LocalHistorySyncStatus = {
  hasLocalHistory: boolean;
  isAlreadySynced: boolean;
};

type SupabaseBreathingSessionRow = Record<string, unknown> & {
  completed?: boolean | null;
  completed_at?: string | null;
  created_at?: string | null;
  duration_minutes?: number | null;
  duration_seconds?: number | null;
  id?: string | null;
  pattern?: string | null;
  pattern_label?: string | null;
  user_id?: string | null;
};

type SupabaseJournalEntryRow = Record<string, unknown> & {
  breathing_session_id?: string | null;
  created_at?: string | null;
  entry_type?: "post_breathing" | "standalone" | null;
  id?: string | null;
  mood_tags?: unknown;
  reflection1?: string | null;
  reflection2?: string | null;
  reflection3?: string | null;
  user_id?: string | null;
};

const breathingSessionColumns =
  "id,user_id,created_at,completed_at,pattern,pattern_label,duration_minutes,duration_seconds,completed";

const journalEntryColumns =
  "id,user_id,created_at,breathing_session_id,mood_tags,reflection1,reflection2,reflection3,entry_type";

const localHistorySyncedAtKey = "localHistorySyncedAt";

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function readLocalArray<T>(key: string) {
  try {
    const savedItems = window.localStorage.getItem(key);

    return savedItems ? (JSON.parse(savedItems) as T[]) : [];
  } catch {
    return [];
  }
}

function writeLocalArray<T>(key: string, items: T[]) {
  window.localStorage.setItem(key, JSON.stringify(items));
}

export function readLocalHistory(): HistoryData {
  return {
    breathingSessions: readLocalArray<BreathingSession>("breathingSessions"),
    journalEntries: readLocalArray<JournalEntry>("journalEntries"),
  };
}

export function clearLocalHistory() {
  window.localStorage.removeItem("breathingSessions");
  window.localStorage.removeItem("journalEntries");
}

export function createBreathingSession(
  pendingSession: PendingBreathingSession,
  date: string,
  id = createId("breathing"),
): BreathingSession {
  return {
    completedAt: pendingSession.completedAt,
    date,
    duration: pendingSession.duration,
    durationSeconds: pendingSession.durationSeconds,
    id,
    sessionType: pendingSession.sessionType,
  };
}

export function saveLocalBreathingSession(
  pendingSession: PendingBreathingSession,
  date = new Date().toISOString(),
) {
  const breathingSessions =
    readLocalArray<BreathingSession>("breathingSessions");
  const breathingSession = createBreathingSession(pendingSession, date);

  writeLocalArray("breathingSessions", [
    breathingSession,
    ...breathingSessions,
  ]);

  return breathingSession;
}

export function saveLocalJournalEntry(
  entry: JournalEntry,
  pendingSession?: PendingBreathingSession | null,
) {
  const journalEntries = readLocalArray<JournalEntry>("journalEntries");

  writeLocalArray("journalEntries", [entry, ...journalEntries]);

  if (pendingSession && entry.breathingSessionId) {
    const breathingSessions =
      readLocalArray<BreathingSession>("breathingSessions");
    const breathingSession = createBreathingSession(
      pendingSession,
      entry.date,
      entry.breathingSessionId,
    );

    writeLocalArray("breathingSessions", [
      breathingSession,
      ...breathingSessions,
    ]);
  }
}

function toString(value: unknown, fallback = "") {
  return typeof value === "string" && value ? value : fallback;
}

function toNumber(value: unknown) {
  return typeof value === "number" ? value : undefined;
}

function toMoodTags(value: unknown) {
  return Array.isArray(value)
    ? value.filter(
        (tag): tag is string => typeof tag === "string" && Boolean(tag),
      )
    : [];
}

function getDurationMinutesFromValues(
  duration?: string,
  durationSeconds?: number,
) {
  const durationFromText = Number.parseInt(duration ?? "", 10);

  if (Number.isFinite(durationFromText)) {
    return durationFromText;
  }

  if (durationSeconds) {
    return Math.round(durationSeconds / 60);
  }

  return null;
}

function getPatternValueFromLabel(label?: string) {
  const patternLabel = label?.trim() || "breathing";

  return patternLabel
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function logSupabaseError(action: string, error: unknown) {
  if (process.env.NODE_ENV !== "production") {
    console.error(`Supabase ${action} failed`, error);
  }
}

function mapBreathingSession(row: SupabaseBreathingSessionRow): BreathingSession {
  const completedAt = toString(row.completed_at);
  const createdAt = toString(row.created_at);
  const durationMinutes = toNumber(row.duration_minutes);

  return {
    completedAt,
    date: completedAt || createdAt || new Date().toISOString(),
    duration: durationMinutes ? `${durationMinutes} min` : "Session",
    durationSeconds: toNumber(row.duration_seconds),
    id: toString(row.id, createId("breathing")),
    sessionType: toString(row.pattern_label, toString(row.pattern, "Breathing")),
  };
}

function mapJournalEntry(row: SupabaseJournalEntryRow): JournalEntry {
  const createdAt = toString(row.created_at, new Date().toISOString());

  return {
    breathingSessionId: toString(row.breathing_session_id) || undefined,
    completedAt: createdAt,
    date: createdAt,
    entryType: row.entry_type ?? undefined,
    id: toString(row.id, createId("journal")),
    linkedSession: Boolean(row.breathing_session_id),
    moodTags: toMoodTags(row.mood_tags),
    reflection1: toString(row.reflection1),
    reflection2: toString(row.reflection2),
    reflection3: toString(row.reflection3),
  };
}

function getLocalHistorySignature(history: HistoryData) {
  return JSON.stringify({
    breathingSessions: history.breathingSessions.map((session) => ({
      completedAt: session.completedAt,
      date: session.date,
      duration: session.duration,
      durationSeconds: session.durationSeconds,
      id: session.id,
      sessionType: session.sessionType,
    })),
    journalEntries: history.journalEntries.map((entry) => ({
      breathingSessionId: entry.breathingSessionId,
      date: entry.date,
      entryType: entry.entryType,
      id: entry.id,
      moodTags: entry.moodTags ?? [],
      reflection1: entry.reflection1,
      reflection2: entry.reflection2,
      reflection3: entry.reflection3,
    })),
  });
}

function getUserSyncSignatureKey(userId: string) {
  return `${localHistorySyncedAtKey}:${userId}:signature`;
}

function getJournalEntryType(entry: JournalEntry) {
  if (entry.entryType) {
    return entry.entryType;
  }

  return entry.breathingSessionId || entry.linkedSession
    ? "post_breathing"
    : "standalone";
}

export function getLocalHistorySyncStatus(
  userId: string,
): LocalHistorySyncStatus {
  const history = readLocalHistory();
  const hasLocalHistory = Boolean(
    history.breathingSessions.length || history.journalEntries.length,
  );

  if (!hasLocalHistory) {
    return {
      hasLocalHistory: false,
      isAlreadySynced: false,
    };
  }

  const currentSignature = getLocalHistorySignature(history);
  const syncedSignature = window.localStorage.getItem(
    getUserSyncSignatureKey(userId),
  );

  return {
    hasLocalHistory,
    isAlreadySynced: syncedSignature === currentSignature,
  };
}

function markLocalHistorySynced(userId: string, history: HistoryData) {
  window.localStorage.setItem(localHistorySyncedAtKey, new Date().toISOString());
  window.localStorage.setItem(
    getUserSyncSignatureKey(userId),
    getLocalHistorySignature(history),
  );
}

export async function fetchSupabaseHistory(userId: string): Promise<HistoryData> {
  const supabase = createClient();
  const [breathingResult, journalResult] = await Promise.all([
    supabase
      .from("breathing_sessions")
      .select(breathingSessionColumns)
      .eq("user_id", userId)
      .order("completed_at", { ascending: false }),
    supabase
      .from("journal_entries")
      .select(journalEntryColumns)
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),
  ]);

  if (breathingResult.error) {
    logSupabaseError("breathing history load", breathingResult.error);
    throw new Error(breathingResult.error.message);
  }

  if (journalResult.error) {
    logSupabaseError("journal history load", journalResult.error);
    throw new Error(journalResult.error.message);
  }

  const breathingRows =
    (breathingResult.data ?? []) as unknown as SupabaseBreathingSessionRow[];
  const journalRows =
    (journalResult.data ?? []) as unknown as SupabaseJournalEntryRow[];

  return {
    breathingSessions: breathingRows.map(mapBreathingSession),
    journalEntries: journalRows.map(mapJournalEntry),
  };
}

export async function saveSupabaseBreathingSession(
  userId: string,
  pendingSession: PendingBreathingSession,
) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("breathing_sessions")
    .insert({
      completed_at: pendingSession.completedAt,
      completed: true,
      duration_minutes: getDurationMinutesFromValues(
        pendingSession.duration,
        pendingSession.durationSeconds,
      ),
      duration_seconds: pendingSession.durationSeconds ?? null,
      pattern: getPatternValueFromLabel(
        pendingSession.patternName ?? pendingSession.sessionType,
      ),
      pattern_label: pendingSession.sessionType,
      user_id: userId,
    })
    .select(breathingSessionColumns)
    .single();

  if (error) {
    logSupabaseError("breathing session insert", error);
    throw new Error(error.message);
  }

  return mapBreathingSession(data as SupabaseBreathingSessionRow);
}

export async function saveSupabaseJournalEntry({
  breathingSession,
  entryType,
  moodTags,
  reflection1,
  reflection2,
  reflection3,
  userId,
}: {
  breathingSession?: BreathingSession | null;
  entryType: "post_breathing" | "standalone";
  moodTags: string[];
  reflection1: string;
  reflection2: string;
  reflection3: string;
  userId: string;
}) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("journal_entries")
    .insert({
      breathing_session_id: breathingSession?.id ?? null,
      entry_type: entryType,
      mood_tags: moodTags,
      reflection1,
      reflection2,
      reflection3,
      user_id: userId,
    })
    .select(journalEntryColumns)
    .single();

  if (error) {
    logSupabaseError("journal entry insert", error);
    throw new Error(error.message);
  }

  return mapJournalEntry(data as SupabaseJournalEntryRow);
}

export async function syncLocalHistoryToSupabase(userId: string) {
  const history = readLocalHistory();
  const breathingSessionIdMap = new Map<string, string>();
  const supabase = createClient();

  for (const session of history.breathingSessions) {
    const { data, error } = await supabase
      .from("breathing_sessions")
      .insert({
        completed_at: session.completedAt ?? session.date,
        completed: true,
        duration_minutes: getDurationMinutesFromValues(
          session.duration,
          session.durationSeconds,
        ),
        duration_seconds: session.durationSeconds ?? null,
        pattern: getPatternValueFromLabel(session.sessionType),
        pattern_label: session.sessionType,
        user_id: userId,
      })
      .select(breathingSessionColumns)
      .single();

    if (error) {
      logSupabaseError("local breathing history sync", error);
      throw new Error(error.message);
    }

    const syncedSession = mapBreathingSession(
      data as SupabaseBreathingSessionRow,
    );

    breathingSessionIdMap.set(session.id, syncedSession.id);
  }

  for (const entry of history.journalEntries) {
    const linkedBreathingSessionId = entry.breathingSessionId
      ? breathingSessionIdMap.get(entry.breathingSessionId)
      : null;
    const { error } = await supabase.from("journal_entries").insert({
      breathing_session_id: linkedBreathingSessionId ?? null,
      entry_type: getJournalEntryType(entry),
      mood_tags: toMoodTags(entry.moodTags),
      reflection1: entry.reflection1,
      reflection2: entry.reflection2,
      reflection3: entry.reflection3,
      user_id: userId,
    });

    if (error) {
      logSupabaseError("local journal history sync", error);
      throw new Error(error.message);
    }
  }

  markLocalHistorySynced(userId, history);

  return {
    breathingCount: history.breathingSessions.length,
    journalCount: history.journalEntries.length,
  };
}

export { createId };
