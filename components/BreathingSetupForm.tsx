"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  breathingPatterns,
  defaultMinutes,
  defaultPatternId,
} from "@/components/breathingPatterns";
import { DurationSelector } from "@/components/DurationSelector";
import { PrimaryButton } from "@/components/PrimaryButton";
import { SessionTypeSelector } from "@/components/SessionTypeSelector";

export function BreathingSetupForm() {
  const router = useRouter();
  const [selectedPatternId, setSelectedPatternId] =
    useState(defaultPatternId);
  const [selectedMinutes, setSelectedMinutes] = useState(defaultMinutes);

  function handleStartSession() {
    router.push(
      `/session?pattern=${selectedPatternId}&minutes=${selectedMinutes}`,
    );
  }

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#9daf96]">
          Breathe
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.02em] text-[#f8f1e3]">
          Set up your session
        </h1>
        <p className="mt-3 text-base leading-7 text-[#8a9a8d]">
          Choose a breathing rhythm and duration, then begin when you are ready.
        </p>
      </div>

      <div className="space-y-5">
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-[#f5efe2]">
            Breathing pattern
          </h2>
          <SessionTypeSelector
            onSelect={setSelectedPatternId}
            patterns={breathingPatterns}
            selectedPatternId={selectedPatternId}
          />
        </div>

        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-[#f5efe2]">Duration</h2>
          <DurationSelector
            onSelect={setSelectedMinutes}
            selectedMinutes={selectedMinutes}
          />
        </div>

        <p className="text-xs leading-5 text-[#667467]">
          Breathe gently. Stop if you feel uncomfortable.
        </p>

        <div className="space-y-3 pt-2">
          <PrimaryButton onClick={handleStartSession}>Start session</PrimaryButton>
          <PrimaryButton href="/" variant="secondary">
            Back home
          </PrimaryButton>
        </div>
      </div>
    </section>
  );
}
