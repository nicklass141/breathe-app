type BreathingPhase = "INHALE" | "HOLD" | "HOLD IN" | "HOLD OUT" | "EXHALE";

type BreathingOrbProps = {
  phase?: BreathingPhase;
};

const phaseStyles = {
  INHALE:
    "scale-[1.14] duration-[4000ms] ease-[cubic-bezier(0.4,0,0.2,1)]",
  HOLD:
    "scale-[1.14] duration-[1800ms] ease-[cubic-bezier(0.4,0,0.2,1)]",
  "HOLD IN":
    "scale-[1.14] duration-[1800ms] ease-[cubic-bezier(0.4,0,0.2,1)]",
  "HOLD OUT":
    "scale-[0.88] duration-[1800ms] ease-[cubic-bezier(0.4,0,0.2,1)]",
  EXHALE:
    "scale-[0.88] duration-[6000ms] ease-[cubic-bezier(0.4,0,0.2,1)]",
};

const innerLayerStyles = {
  INHALE: "opacity-95",
  HOLD: "opacity-92",
  "HOLD IN": "opacity-92",
  "HOLD OUT": "opacity-78",
  EXHALE: "opacity-78",
};

const highlightStyles = {
  INHALE: "opacity-90",
  HOLD: "opacity-82",
  "HOLD IN": "opacity-82",
  "HOLD OUT": "opacity-60",
  EXHALE: "opacity-60",
};

export function BreathingOrb({ phase = "INHALE" }: BreathingOrbProps) {
  return (
    <div
      className="relative mx-auto flex h-[clamp(13.25rem,34.5vh,17rem)] w-[clamp(13.25rem,34.5vh,17rem)] items-center justify-center"
      data-testid="breathing-orb"
    >
      <div className="absolute inset-0 rounded-full bg-[#9fbf86]/18 blur-3xl" />
      <div className="absolute inset-7 rounded-full bg-[#f3ecd1]/12 blur-2xl breathing-orb-float" />

      {/* The wrapper handles only breathing scale, so drift animations cannot fight it. */}
      <div
        className={`relative transition-transform ${phaseStyles[phase]}`}
      >
        <div className="breathing-bubble-morph relative h-[clamp(11.55rem,29.5vh,14.55rem)] w-[clamp(11.55rem,29.5vh,14.55rem)] overflow-hidden rounded-[49%_51%_47%_53%/48%_46%_54%_52%] bg-[radial-gradient(circle_at_63%_44%,rgba(255,241,191,0.9)_0%,rgba(245,222,168,0.78)_30%,rgba(211,134,96,0.66)_66%,rgba(129,66,62,0.72)_100%)] shadow-[0_0_86px_rgba(168,194,143,0.26),0_26px_74px_rgba(0,0,0,0.36),inset_0_-28px_58px_rgba(67,38,34,0.2),inset_16px_18px_42px_rgba(255,248,216,0.18)]">
          {/* Translucent rim gives the reference-like overlapping edge. */}
          <div className="breathing-orb-drift absolute inset-[6%] rounded-[48%_52%_50%_50%/50%_46%_54%_50%] bg-[linear-gradient(110deg,rgba(241,129,170,0.5)_0%,rgba(255,204,205,0.32)_30%,rgba(255,238,186,0.16)_68%,rgba(255,255,255,0.04)_100%)] blur-[0.5px]" />

          {/* Phase wrapper moves the layer; child animation only morphs shape. */}
          <div
            className={`absolute left-[14%] top-[16%] h-[68%] w-[70%] transition-[transform,opacity] duration-[1800ms] ease-[cubic-bezier(0.4,0,0.2,1)] ${innerLayerStyles[phase]}`}
          >
            <div className="breathing-orb-inner h-full w-full rounded-[47%_53%_49%_51%/48%_48%_52%_52%] bg-[radial-gradient(circle_at_63%_44%,rgba(255,246,201,0.94)_0%,rgba(255,226,207,0.88)_42%,rgba(238,169,189,0.58)_78%,rgba(238,169,189,0)_100%)]" />
          </div>

          {/* The wrapper handles phase movement; the highlight itself gently floats. */}
          <div
            className={`absolute left-[31%] top-[21%] h-[28%] w-[38%] transition-[transform,opacity] duration-[2200ms] ease-[cubic-bezier(0.4,0,0.2,1)] ${highlightStyles[phase]}`}
          >
            <div className="breathing-orb-highlight h-full w-full rounded-full bg-[#fff9d9]/48 blur-xl" />
          </div>

          <div className="absolute -left-[8%] top-[22%] h-[58%] w-[34%] rounded-full bg-[#cf5f86]/20 blur-lg" />
          <div className="absolute bottom-[5%] right-[2%] h-[48%] w-[50%] rounded-full bg-[#7f8f55]/12 blur-xl" />
          <div className="absolute inset-0 rounded-[49%_51%_47%_53%/48%_46%_54%_52%] border border-white/14" />
        </div>
      </div>
    </div>
  );
}
