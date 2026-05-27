"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { BreathingOrb } from "@/components/BreathingOrb";
import {
  breathingPatterns,
  defaultMinutes,
  defaultPatternId,
  getCycleSeconds,
  getPatternById,
  type BreathingPhase,
  type PhaseStep,
} from "@/components/breathingPatterns";

const durations = [1, 2, 3];
type ActiveSheet = "breathing" | "time" | null;

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

function formatPhase(phase: BreathingPhase) {
  const labels: Record<BreathingPhase, string> = {
    EXHALE: "Exhale",
    HOLD: "Hold",
    "HOLD IN": "Hold in",
    "HOLD OUT": "Hold out",
    INHALE: "Inhale",
  };

  return labels[phase];
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

export function MainBreathingScreen() {
  const router = useRouter();
  const [selectedPatternId, setSelectedPatternId] = useState(defaultPatternId);
  const [selectedMinutes, setSelectedMinutes] = useState(defaultMinutes);
  const [secondsRemaining, setSecondsRemaining] = useState(
    defaultMinutes * 60,
  );
  const [activeSheet, setActiveSheet] = useState<ActiveSheet>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const completedRef = useRef(false);
  const previousPhaseRef = useRef<BreathingPhase>("INHALE");

  const selectedPattern = getPatternById(selectedPatternId);
  const totalSeconds = selectedMinutes * 60;
  const elapsedSeconds = totalSeconds - secondsRemaining;
  const phase = hasStarted
    ? getPhase(elapsedSeconds, selectedPattern.phases)
    : selectedPattern.phases[0].phase;

  const sessionDetail = useMemo(() => {
    const cycleSeconds = getCycleSeconds(selectedPattern.phases);
    const estimatedBreaths = Math.round(totalSeconds / cycleSeconds);

    return `${estimatedBreaths} breaths`;
  }, [selectedPattern.phases, totalSeconds]);

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
    setSelectedPatternId(patternId);
    resetSession(selectedMinutes * 60);
    setActiveSheet(null);
  }

  function handleDurationSelect(minutes: number) {
    setSelectedMinutes(minutes);
    resetSession(minutes * 60);
    setActiveSheet(null);
  }

  function handlePrimaryControl() {
    completedRef.current = false;
    setHasStarted(true);
    setIsRunning((currentValue) => !currentValue);
  }

  const controlsDisabled = hasStarted && isRunning;
  const primaryControlLabel = !hasStarted
    ? "Start"
    : isRunning
      ? "Pause"
      : "Resume";
  const orbPhase = hasStarted ? phase : "EXHALE";

  return (
    <section className="flex flex-1 flex-col gap-[clamp(0.9rem,2.1vh,1.25rem)] overflow-hidden pb-2 text-center">
      <p className="mx-auto max-w-xs text-sm leading-6 text-[#9a9a95]">
        Choose a rhythm, breathe gently, then reflect if you want.
      </p>

      <div className="flex flex-col items-center gap-[clamp(0.95rem,2.2vh,1.35rem)]">
        <BreathingOrb phase={orbPhase} />

        <div className="min-h-[3.9rem]">
          <p className="text-[1.65rem] font-semibold leading-tight tracking-[-0.02em] text-[#f4f4f2]">
            {formatPhase(phase)}
          </p>
          <p className="mt-1 text-sm text-[#8f8f8a]" data-testid="timer">
            {formatTime(secondsRemaining)} remaining / {sessionDetail}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="mx-auto grid w-full max-w-[20rem] grid-cols-2 gap-3 text-left">
          <CompactSelector
            disabled={controlsDisabled}
            onClick={() => setActiveSheet("breathing")}
            value={selectedPattern.name}
          />
          <CompactSelector
            disabled={controlsDisabled}
            onClick={() => setActiveSheet("time")}
            value={`${selectedMinutes} min`}
          />
        </div>

        <div className="flex justify-center">
          <button
            className={`min-h-[3.25rem] w-[78%] max-w-[18rem] rounded-[1.75rem] px-4 text-base font-semibold transition focus:outline-none focus:ring-2 focus:ring-[#f2f2ee] focus:ring-offset-2 focus:ring-offset-[#050505] ${
              hasStarted && isRunning
                ? "border border-white/10 bg-[#151515] text-[#f4f4f2] hover:bg-[#1d1d1d]"
                : "bg-[#f2f2ee] text-[#050505] shadow-[0_18px_45px_rgba(255,255,255,0.11)] hover:bg-white"
            }`}
            onClick={handlePrimaryControl}
            type="button"
          >
            {primaryControlLabel}
          </button>
        </div>

        <p className="text-xs leading-5 text-[#777772]">
          Breathe gently. Stop if you feel uncomfortable.
        </p>
      </div>

      <OptionSheet
        isOpen={activeSheet === "breathing"}
        onClose={() => setActiveSheet(null)}
        title="Breathing"
      >
        {breathingPatterns.map((pattern) => {
          const isSelected = pattern.id === selectedPatternId;

          return (
            <OptionButton
              description={pattern.description}
              isSelected={isSelected}
              key={pattern.id}
              label={pattern.name}
              onClick={() => handlePatternSelect(pattern.id)}
            />
          );
        })}
      </OptionSheet>

      <OptionSheet
        isOpen={activeSheet === "time"}
        onClose={() => setActiveSheet(null)}
        title="Time"
      >
        {durations.map((minutes) => (
          <OptionButton
            isSelected={minutes === selectedMinutes}
            key={minutes}
            label={`${minutes} min`}
            onClick={() => handleDurationSelect(minutes)}
          />
        ))}
      </OptionSheet>
    </section>
  );
}

type CompactSelectorProps = {
  disabled: boolean;
  onClick: () => void;
  value: string;
};

function CompactSelector({
  disabled,
  onClick,
  value,
}: CompactSelectorProps) {
  return (
    <button
      className={`inline-flex min-h-12 w-full items-center justify-center rounded-[1.35rem] border border-white/8 bg-[#111111]/92 px-4 text-center transition hover:border-[#3a3a3a] focus:outline-none focus:ring-2 focus:ring-[#f2f2ee] focus:ring-offset-2 focus:ring-offset-[#050505] ${
        disabled ? "cursor-not-allowed opacity-60" : ""
      }`}
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      <span className="block text-sm font-semibold text-[#f4f4f2]">
        {value}
      </span>
    </button>
  );
}

type OptionSheetProps = {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  title: string;
};

function OptionSheet({ children, isOpen, onClose, title }: OptionSheetProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center bg-black/45 px-4 pb-4 backdrop-blur-sm">
      <button
        aria-label={`Close ${title} options`}
        className="absolute inset-0 cursor-default"
        onClick={onClose}
        type="button"
      />
      <section className="relative w-full max-w-md rounded-[2rem] border border-white/10 bg-[#111111] p-4 shadow-[0_-24px_70px_rgba(0,0,0,0.5)]">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#f4f4f2]">{title}</h2>
          <button
            className="rounded-full px-3 py-2 text-sm font-semibold text-[#bdbdb8] transition hover:bg-white/5 hover:text-[#f4f4f2]"
            onClick={onClose}
            type="button"
          >
            Close
          </button>
        </div>
        <div className="grid gap-2">{children}</div>
      </section>
    </div>
  );
}

type OptionButtonProps = {
  description?: string;
  isSelected: boolean;
  label: string;
  onClick: () => void;
};

function OptionButton({
  description,
  isSelected,
  label,
  onClick,
}: OptionButtonProps) {
  return (
    <button
      className={`min-h-14 rounded-[1.35rem] border px-4 py-3 text-left transition ${
        isSelected
          ? "border-white/20 bg-[#f2f2ee] text-[#050505]"
          : "border-white/8 bg-[#0f0f0f] text-[#d8d8d3] hover:border-[#3a3a3a]"
      }`}
      onClick={onClick}
      type="button"
    >
      <span className="block text-sm font-semibold">{label}</span>
      {description ? (
        <span
          className={`mt-1 block text-xs ${
            isSelected ? "text-[#4f4f4a]" : "text-[#8a8a85]"
          }`}
        >
          {description}
        </span>
      ) : null}
    </button>
  );
}
