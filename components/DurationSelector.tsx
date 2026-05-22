type DurationSelectorProps = {
  disabled?: boolean;
  onSelect?: (minutes: number) => void;
  selectedMinutes?: number;
};

const durations = [
  { label: "1 min", minutes: 1 },
  { label: "2 min", minutes: 2 },
  { label: "3 min", minutes: 3 },
];

export function DurationSelector({
  disabled = false,
  onSelect,
  selectedMinutes = 2,
}: DurationSelectorProps) {
  return (
    <div className="grid grid-cols-3 items-center gap-3 text-center">
      {durations.map((duration) => {
        const isSelected = duration.minutes === selectedMinutes;

        return (
          <button
            className={`min-h-12 rounded-full text-lg font-semibold transition ${
              isSelected
                ? "bg-[#f4ecd9] text-[#07100d]"
                : "bg-transparent text-[#4d5a51] hover:text-[#dce8cf]"
            } ${disabled ? "cursor-not-allowed opacity-70" : ""}`}
            disabled={disabled}
            key={duration.minutes}
            onClick={() => onSelect?.(duration.minutes)}
            type="button"
          >
            {duration.label}
          </button>
        );
      })}
    </div>
  );
}
