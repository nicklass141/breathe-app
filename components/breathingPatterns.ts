export type BreathingPhase =
  | "INHALE"
  | "HOLD"
  | "HOLD IN"
  | "HOLD OUT"
  | "EXHALE";

export type PhaseStep = {
  duration: number;
  phase: BreathingPhase;
};

export type BreathingPattern = {
  description: string;
  id: string;
  name: string;
  phases: PhaseStep[];
};

export const defaultPatternId = "balance";
export const defaultMinutes = 2;
export const validDurations = [1, 2, 3] as const;

export const breathingPatterns = [
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
] satisfies BreathingPattern[];

export function getPatternById(patternId: string | null | undefined) {
  return (
    breathingPatterns.find((pattern) => pattern.id === patternId) ??
    breathingPatterns[0]
  );
}

export function getSafeMinutes(minutes: string | number | null | undefined) {
  const parsedMinutes =
    typeof minutes === "number" ? minutes : Number.parseInt(minutes ?? "", 10);

  return validDurations.includes(parsedMinutes as (typeof validDurations)[number])
    ? parsedMinutes
    : defaultMinutes;
}

export function getCycleSeconds(phases: PhaseStep[]) {
  return phases.reduce((totalSeconds, phase) => totalSeconds + phase.duration, 0);
}
