type SessionTypeSelectorProps = {
  disabled?: boolean;
  onSelect: (patternId: string) => void;
  patterns: {
    description: string;
    id: string;
    name: string;
  }[];
  selectedPatternId: string;
};

export function SessionTypeSelector({
  disabled = false,
  onSelect,
  patterns,
  selectedPatternId,
}: SessionTypeSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-3 text-left">
      {patterns.map((pattern) => {
        const isSelected = pattern.id === selectedPatternId;

        return (
          <button
            className={`min-h-20 rounded-[1.5rem] border p-4 text-left transition ${
              isSelected
                ? "border-[#cfdcb6] bg-[#dbe8c6] text-[#07100d]"
                : "border-white/8 bg-[#0c1712] text-[#d5decf] hover:border-[#536357]"
            } ${disabled ? "cursor-not-allowed opacity-70" : ""}`}
            disabled={disabled}
            key={pattern.id}
            onClick={() => onSelect(pattern.id)}
            type="button"
          >
            <span className="block text-sm font-semibold">{pattern.name}</span>
            <span
              className={`mt-1 block text-xs leading-5 ${
                isSelected ? "text-[#354237]" : "text-[#77877b]"
              }`}
            >
              {pattern.description}
            </span>
          </button>
        );
      })}
    </div>
  );
}
