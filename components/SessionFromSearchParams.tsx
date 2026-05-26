"use client";

import { useSearchParams } from "next/navigation";
import { BreathingSessionExperience } from "@/components/BreathingSessionExperience";
import {
  defaultMinutes,
  getPatternById,
  getSafeMinutes,
} from "@/components/breathingPatterns";

export function SessionFromSearchParams() {
  const searchParams = useSearchParams();
  const pattern = getPatternById(searchParams.get("pattern"));
  const minutes = getSafeMinutes(searchParams.get("minutes")) || defaultMinutes;

  return (
    <BreathingSessionExperience
      initialMinutes={minutes}
      initialPatternId={pattern.id}
      key={`${pattern.id}-${minutes}`}
    />
  );
}
