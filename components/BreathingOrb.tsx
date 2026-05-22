type BreathingPhase = "INHALE" | "HOLD" | "HOLD IN" | "HOLD OUT" | "EXHALE";

type BreathingOrbProps = {
  phase?: BreathingPhase;
};

const phaseStyles = {
  INHALE: "scale-[1.08] duration-[3800ms]",
  HOLD: "scale-[1.08] duration-[1800ms]",
  "HOLD IN": "scale-[1.08] duration-[1800ms]",
  "HOLD OUT": "scale-[0.92] duration-[1800ms]",
  EXHALE: "scale-[0.92] duration-[5600ms]",
};

export function BreathingOrb({ phase = "INHALE" }: BreathingOrbProps) {
  return (
    <div
      className={`relative mx-auto flex h-72 w-72 items-center justify-center rounded-full bg-[radial-gradient(circle_at_38%_34%,#fff4cd_0%,#dce5bb_31%,#87a77c_55%,#496c55_75%,#1c3329_100%)] shadow-[0_0_80px_rgba(168,194,143,0.22),inset_0_-26px_55px_rgba(7,16,13,0.34)] transition-transform ease-in-out ${phaseStyles[phase]}`}
      data-testid="breathing-orb"
    >
      <div className="absolute inset-7 rounded-full bg-[radial-gradient(circle_at_36%_32%,rgba(255,250,223,0.82),rgba(202,221,171,0.44)_48%,rgba(79,111,82,0.08)_72%)] blur-[1px]" />
      <div className="absolute inset-0 rounded-full border border-white/10" />
      <div className="relative flex h-36 w-36 items-center justify-center rounded-full bg-[#f5efd7]/10 text-sm font-semibold uppercase tracking-[0.24em] text-[#f9f3df] backdrop-blur-sm">
        {phase}
      </div>
    </div>
  );
}
