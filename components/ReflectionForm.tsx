"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { PrimaryButton } from "@/components/PrimaryButton";
import { SoftCard } from "@/components/SoftCard";

type PendingBreathingSession = {
  completedAt: string;
  duration: string;
  durationSeconds?: number;
  patternName?: string;
  sessionType: string;
};

type JournalEntry = {
  breathingSessionId?: string;
  completedAt?: string;
  date: string;
  duration?: string;
  id: string;
  linkedSession: boolean;
  moodTags?: string[];
  reflection1: string;
  reflection2: string;
  reflection3: string;
  sessionType?: string;
};

type BreathingSession = {
  completedAt: string;
  date: string;
  duration: string;
  durationSeconds?: number;
  id: string;
  sessionType: string;
};

type ReflectionFormProps = {
  mode?: "linked" | "standalone";
  subtitle?: string;
  title?: string;
};

const prompts = [
  "What am I feeling right now?",
  "What do I want to focus on today?",
  "What is one small action I can take?",
];

const moodTags = [
  "Calm",
  "Anxious",
  "Tired",
  "Focused",
  "Grateful",
  "Stressed",
  "Hopeful",
  "Low",
];

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function formatDate(value?: string) {
  if (!value) {
    return "Just now";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Recently";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function readPendingSession() {
  try {
    const savedSession = window.sessionStorage.getItem(
      "pendingBreathingSession",
    );

    return savedSession
      ? (JSON.parse(savedSession) as PendingBreathingSession)
      : null;
  } catch {
    return null;
  }
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

function createBreathingSession(
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

export function ReflectionForm({
  mode = "linked",
  subtitle = "A few quiet notes after breathing can make the next step clearer.",
  title = "Notice what is here",
}: ReflectionFormProps) {
  const router = useRouter();
  const [pendingSession, setPendingSession] =
    useState<PendingBreathingSession | null>(null);
  const [selectedMoodTags, setSelectedMoodTags] = useState<string[]>([]);
  const [answers, setAnswers] = useState(["", "", ""]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (mode === "standalone") {
      return;
    }

    // Storage is only available in the browser after this client component mounts.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPendingSession(readPendingSession());
  }, [mode]);

  function handleAnswerChange(index: number, value: string) {
    setError("");
    setAnswers((currentAnswers) =>
      currentAnswers.map((answer, answerIndex) =>
        answerIndex === index ? value : answer,
      ),
    );
  }

  function handleMoodToggle(tag: string) {
    setError("");
    setSelectedMoodTags((currentTags) =>
      currentTags.includes(tag)
        ? currentTags.filter((currentTag) => currentTag !== tag)
        : [...currentTags, tag],
    );
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const [reflection1, reflection2, reflection3] = answers.map((answer) =>
      answer.trim(),
    );
    const hasReflectionText = Boolean(
      reflection1 || reflection2 || reflection3,
    );

    if (!selectedMoodTags.length && !hasReflectionText) {
      setError("Choose a mood or write a few words before saving.");
      return;
    }

    const now = new Date().toISOString();
    const sessionToSave =
      mode === "linked" ? pendingSession ?? readPendingSession() : null;
    const hasLinkedSession = Boolean(sessionToSave);
    const breathingSessionId = sessionToSave
      ? createId("breathing")
      : undefined;
    const journalEntry: JournalEntry = {
      breathingSessionId,
      completedAt: sessionToSave?.completedAt,
      date: now,
      duration: sessionToSave?.duration,
      id: createId("journal"),
      linkedSession: hasLinkedSession,
      moodTags: selectedMoodTags,
      reflection1,
      reflection2,
      reflection3,
      sessionType: sessionToSave?.sessionType,
    };

    try {
      const journalEntries = readLocalArray<JournalEntry>("journalEntries");
      writeLocalArray("journalEntries", [journalEntry, ...journalEntries]);

      if (sessionToSave) {
        const breathingSession = createBreathingSession(
          sessionToSave,
          now,
          breathingSessionId,
        );
        const breathingSessions =
          readLocalArray<BreathingSession>("breathingSessions");

        writeLocalArray("breathingSessions", [
          breathingSession,
          ...breathingSessions,
        ]);
        window.sessionStorage.removeItem("pendingBreathingSession");
      }

      router.push("/history");
    } catch {
      setError("I could not save this reflection in this browser.");
    }
  }

  function handleSkipReflection() {
    if (mode !== "linked") {
      router.push("/history");
      return;
    }

    try {
      const sessionToSave = pendingSession ?? readPendingSession();

      if (sessionToSave) {
        const breathingSessions =
          readLocalArray<BreathingSession>("breathingSessions");
        const breathingSession = createBreathingSession(
          sessionToSave,
          new Date().toISOString(),
        );

        writeLocalArray("breathingSessions", [
          breathingSession,
          ...breathingSessions,
        ]);
      }

      window.sessionStorage.removeItem("pendingBreathingSession");
      router.push("/history");
    } catch {
      setError("I could not save this breathing session in this browser.");
    }
  }

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#bdbdb8]">
          Journal
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.02em] text-[#f4f4f2]">
          {title}
        </h1>
        <p className="mt-3 text-base leading-7 text-[#9a9a95]">{subtitle}</p>
      </div>

      {mode === "linked" ? (
        <SoftCard className="p-4">
          <div className="flex items-start justify-between gap-3">
            {pendingSession ? (
              <div>
                <p className="text-sm font-semibold text-[#f4f4f2]">
                  Linked breathing session
                </p>
                <p className="mt-2 text-sm leading-6 text-[#9a9a95]">
                  {pendingSession.sessionType} - {pendingSession.duration} -{" "}
                  {formatDate(pendingSession.completedAt)}
                </p>
              </div>
            ) : (
              <p className="text-sm leading-6 text-[#9a9a95]">
                No breathing session linked. You can still write a reflection.
              </p>
            )}
            <button
              className="shrink-0 rounded-full px-3 py-2 text-xs font-semibold text-[#bdbdb8] transition hover:bg-white/5 hover:text-[#f4f4f2]"
              onClick={handleSkipReflection}
              type="button"
            >
              Skip reflection
            </button>
          </div>
        </SoftCard>
      ) : null}

      <form className="space-y-4" onSubmit={handleSubmit}>
        <SoftCard className="p-4">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="text-sm font-semibold text-[#f4f4f2]">Mood</h2>
            <p className="text-xs text-[#8a8a85]">Select any that fit</p>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {moodTags.map((tag) => {
              const isSelected = selectedMoodTags.includes(tag);

              return (
                <button
                  className={`min-h-10 rounded-full border px-4 text-sm font-semibold transition ${
                    isSelected
                      ? "border-white/20 bg-[#f2f2ee] text-[#050505]"
                      : "border-white/8 bg-[#0f0f0f] text-[#bdbdb8] hover:border-[#3a3a3a] hover:text-[#f4f4f2]"
                  }`}
                  key={tag}
                  onClick={() => handleMoodToggle(tag)}
                  type="button"
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </SoftCard>

        <div className="px-1">
          <h2 className="text-sm font-semibold text-[#f4f4f2]">
            Optional reflection
          </h2>
          <p className="mt-1 text-sm text-[#8a8a85]">Add more if you want.</p>
        </div>

        {prompts.map((prompt, index) => (
          <SoftCard className="p-4" key={prompt}>
            <label className="block">
              <span className="text-sm font-semibold text-[#f4f4f2]">
                {prompt}
              </span>
              <textarea
                className="mt-3 min-h-20 w-full resize-none rounded-[1.5rem] border border-white/8 bg-[#0f0f0f] p-4 text-base text-[#f4f4f2] outline-none placeholder:text-[#5f5f5a] focus:border-[#d8d8d3] focus:ring-2 focus:ring-white/10"
                onChange={(event) =>
                  handleAnswerChange(index, event.target.value)
                }
                placeholder="Optional..."
                value={answers[index]}
              />
            </label>
          </SoftCard>
        ))}

        {error ? (
          <p className="rounded-[1.25rem] bg-[#2a1816] px-4 py-3 text-sm text-[#f5c7bd]">
            {error}
          </p>
        ) : null}

        <div className="space-y-3 pt-2">
          <PrimaryButton type="submit">Save reflection</PrimaryButton>
          <PrimaryButton href="/history" variant="secondary">
            View history
          </PrimaryButton>
        </div>
      </form>
    </section>
  );
}
