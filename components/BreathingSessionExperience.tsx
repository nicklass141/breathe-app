"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { BreathingOrb } from "@/components/BreathingOrb";
import { DurationSelector } from "@/components/DurationSelector";
import { PrimaryButton } from "@/components/PrimaryButton";
import { SessionTypeSelector } from "@/components/SessionTypeSelector";

type BreathingPhase = "INHALE" | "HOLD" | "HOLD IN" | "HOLD OUT" | "EXHALE";

type PhaseStep = {
  duration: number;
  phase: BreathingPhase;
};

const breathingPatterns = [
  {
    description: "4 in / 2 hold / 6 out",
    id: "balance",
    name: "Balance",
    phases: [
      { duration: 4, phase: "INHALE" },
      { duration: 2, phase: "HOLD" },
      { duration: 6, phase: "EXHALE" },
    ],
  },
  {
    description: "4 / 4 / 4 / 4",
    id: "box",
    name: "Box Breathing",
    phases: [
      { duration: 4, phase: "INHALE" },
      { duration: 4, phase: "HOLD IN" },
      { duration: 4, phase: "EXHALE" },
      { duration: 4, phase: "HOLD OUT" },
    ],
  },
  {
    description: "4 in / 6 out",
    id: "calm",
    name: "Calm",
    phases: [
      { duration: 4, phase: "INHALE" },
      { duration: 6, phase: "EXHALE" },
    ],
  },
  {
    description: "5 in / 2 hold / 7 out",
    id: "deep-reset",
    name: "Deep Reset",
    phases: [
      { duration: 5, phase: "INHALE" },
      { duration: 2, phase: "HOLD" },
      { duration: 7, phase: "EXHALE" },
    ],
  },
] satisfies {
  description: string;
  id: string;
  name: string;
  phases: PhaseStep[];
}[];

function isVibrationEnabled() {
  try {
    const savedValue = window.localStorage.getItem("vibrationEnabled");

    return savedValue === null ? true : savedValue === "true";
  } catch {
    return true;
  }
}

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

function getCycleSeconds(phases: PhaseStep[]) {
  return phases.reduce((totalSeconds, phase) => totalSeconds + phase.duration, 0);
}

function getPhase(elapsedSeconds: number, phases: PhaseStep[]): BreathingPhase {
  const cycleSeconds = getCycleSeconds(phases);
  const cyclePosition = elapsedSeconds % cycleSeconds;
  let secondsCounted = 0;

  for (const phase of phases) {
    secondsCounted += phase.duration;

    if (cyclePosition < secondsCounted) {
      return phase.phase;
    }
  }

  return phases[0].phase;
}

export function BreathingSessionExperience() {
  const router = useRouter();
  const [selectedPatternId, setSelectedPatternId] = useState("balance");
  const [selectedMinutes, setSelectedMinutes] = useState(2);
  const selectedPattern =
    breathingPatterns.find((pattern) => pattern.id === selectedPatternId) ??
    breathingPatterns[0];
  const cycleSeconds = getCycleSeconds(selectedPattern.phases);
  const totalSeconds = selectedMinutes * 60;
  const [secondsRemaining, setSecondsRemaining] = useState(totalSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const completedRef = useRef(false);
  const previousPhaseRef = useRef<BreathingPhase>("INHALE");

  const elapsedSeconds = totalSeconds - secondsRemaining;
  const phase = hasStarted
    ? getPhase(elapsedSeconds, selectedPattern.phases)
    : selectedPattern.phases[0].phase;

  const sessionDetail = useMemo(() => {
    const estimatedBreaths = Math.round(totalSeconds / cycleSeconds);

    return `${estimatedBreaths} breaths`;
  }, [cycleSeconds, totalSeconds]);

  useEffect(() => {
    if (!isRunning) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setSecondsRemaining((currentSeconds) => {
        if (currentSeconds <= 1) {
          return 0;
        }

        return currentSeconds - 1;
      });
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [isRunning]);

  useEffect(() => {
    if (!hasStarted || previousPhaseRef.current === phase) {
      previousPhaseRef.current = phase;
      return;
    }

    previousPhaseRef.current = phase;

    try {
      if (
        isVibrationEnabled() &&
        "vibrate" in navigator &&
        typeof navigator.vibrate === "function"
      ) {
        navigator.vibrate(30);
      }
    } catch {
      // Vibration is optional and should never interrupt the session.
    }
  }, [hasStarted, phase]);

  useEffect(() => {
    if (!hasStarted || secondsRemaining > 0 || completedRef.current) {
      return;
    }

    completedRef.current = true;
    setIsRunning(false);

    try {
      window.sessionStorage.setItem(
        "pendingBreathingSession",
        JSON.stringify({
          completedAt: new Date().toISOString(),
          duration: `${selectedMinutes} min`,
          durationSeconds: totalSeconds,
          patternName: selectedPattern.name,
          sessionType: selectedPattern.name,
        }),
      );
    } catch {
      // Temporary storage is helpful, but reflection should still open if unavailable.
    }

    router.push("/reflection");
  }, [
    hasStarted,
    router,
    secondsRemaining,
    selectedMinutes,
    selectedPattern.name,
    totalSeconds,
  ]);

  function resetSession(nextTotalSeconds = totalSeconds) {
    completedRef.current = false;
    previousPhaseRef.current = "INHALE";
    setIsRunning(false);
    setHasStarted(false);
    setSecondsRemaining(nextTotalSeconds);
  }

  function handlePatternSelect(patternId: string) {
    if (isRunning) {
      return;
    }

    setSelectedPatternId(patternId);
    resetSession();
  }

  function handleDurationSelect(minutes: number) {
    if (isRunning) {
      return;
    }

    setSelectedMinutes(minutes);
    resetSession(minutes * 60);
  }

  function handlePrimaryControl() {
    completedRef.current = false;
    setHasStarted(true);
    setIsRunning((currentValue) => !currentValue);
  }

  function handleReset() {
    resetSession();
  }

  const primaryControlLabel = !hasStarted
    ? "Start session"
    : isRunning
      ? "Pause"
      : "Resume";

  return (
    <section className="flex flex-1 flex-col justify-between gap-8 text-center">
      <div className="pt-8">
        <p className="text-sm font-semibold text-[#f5efe2]">
          {selectedPattern.name}
        </p>
        <p className="mt-2 text-xl font-semibold text-[#77877b]">
          {sessionDetail}
        </p>
      </div>

      <BreathingOrb phase={phase} />

      <div className="space-y-5">
        <div>
          <p className="text-2xl font-semibold text-[#f8f1e3]">
            {phase.charAt(0) + phase.slice(1).toLowerCase()}
          </p>
          <p className="mt-2 text-sm text-[#849486]" data-testid="timer">
            {formatTime(secondsRemaining)} remaining
          </p>
        </div>

        <DurationSelector
          disabled={isRunning}
          onSelect={handleDurationSelect}
          selectedMinutes={selectedMinutes}
        />

        <SessionTypeSelector
          disabled={isRunning}
          onSelect={handlePatternSelect}
          patterns={breathingPatterns}
          selectedPatternId={selectedPatternId}
        />

        <p className="text-xs leading-5 text-[#667467]">
          Breathe gently. Stop if you feel uncomfortable.
        </p>

        <div className="grid grid-cols-2 gap-3">
          <PrimaryButton
            variant={hasStarted && isRunning ? "secondary" : "primary"}
            onClick={handlePrimaryControl}
          >
            {primaryControlLabel}
          </PrimaryButton>
          <PrimaryButton onClick={handleReset} variant="secondary">
            Reset
          </PrimaryButton>
        </div>

        <PrimaryButton href="/reflection" variant="ghost">
          Continue to journal
        </PrimaryButton>
      </div>
    </section>
  );
}
