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
  completedAt?: string;
  date: string;
  duration?: string;
  id: string;
  linkedSession: boolean;
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

export function ReflectionForm({
  mode = "linked",
  subtitle = "A few quiet notes after breathing can make the next step clearer.",
  title = "Notice what is here",
}: ReflectionFormProps) {
  const router = useRouter();
  const [pendingSession, setPendingSession] =
    useState<PendingBreathingSession | null>(null);
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

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const [reflection1, reflection2, reflection3] = answers.map((answer) =>
      answer.trim(),
    );

    if (!reflection1 && !reflection2 && !reflection3) {
      setError("Write a little in at least one box before saving.");
      return;
    }

    const now = new Date().toISOString();
    const hasLinkedSession = mode === "linked" && Boolean(pendingSession);
    const journalEntry: JournalEntry = {
      completedAt: pendingSession?.completedAt,
      date: now,
      duration: pendingSession?.duration,
      id: createId("journal"),
      linkedSession: hasLinkedSession,
      reflection1,
      reflection2,
      reflection3,
      sessionType: pendingSession?.sessionType,
    };

    try {
      const journalEntries = readLocalArray<JournalEntry>("journalEntries");
      writeLocalArray("journalEntries", [journalEntry, ...journalEntries]);

      if (hasLinkedSession && pendingSession) {
        const breathingSession: BreathingSession = {
          completedAt: pendingSession.completedAt,
          date: now,
          duration: pendingSession.duration,
          durationSeconds: pendingSession.durationSeconds,
          id: createId("breathing"),
          sessionType: pendingSession.sessionType,
        };
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

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#9daf96]">
          Journal
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.02em] text-[#f8f1e3]">
          {title}
        </h1>
        <p className="mt-3 text-base leading-7 text-[#8a9a8d]">{subtitle}</p>
      </div>

      {mode === "linked" ? (
        <SoftCard className="p-4">
          {pendingSession ? (
            <div>
              <p className="text-sm font-semibold text-[#f8f1e3]">
                Linked breathing session
              </p>
              <p className="mt-2 text-sm leading-6 text-[#8a9a8d]">
                {pendingSession.sessionType} - {pendingSession.duration} -{" "}
                {formatDate(pendingSession.completedAt)}
              </p>
            </div>
          ) : (
            <p className="text-sm leading-6 text-[#8a9a8d]">
              No breathing session linked. You can still write a reflection.
            </p>
          )}
        </SoftCard>
      ) : null}

      <form className="space-y-4" onSubmit={handleSubmit}>
        {prompts.map((prompt, index) => (
          <SoftCard className="p-4" key={prompt}>
            <label className="block">
              <span className="text-sm font-semibold text-[#f5efe2]">
                {prompt}
              </span>
              <textarea
                className="mt-3 min-h-28 w-full resize-none rounded-[1.5rem] border border-white/8 bg-[#0a1410] p-4 text-base text-[#f8f1e3] outline-none placeholder:text-[#536357] focus:border-[#cfdcb6] focus:ring-2 focus:ring-[#cfdcb6]/20"
                onChange={(event) =>
                  handleAnswerChange(index, event.target.value)
                }
                placeholder="Write a few words..."
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
