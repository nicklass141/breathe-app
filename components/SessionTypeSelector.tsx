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
                ? "border-white/20 bg-[#f2f2ee] text-[#050505]"
                : "border-white/8 bg-[#0f0f0f] text-[#d8d8d3] hover:border-[#3a3a3a]"
            } ${disabled ? "cursor-not-allowed opacity-70" : ""}`}
            disabled={disabled}
            key={pattern.id}
            onClick={() => onSelect(pattern.id)}
            type="button"
          >
            <span className="block text-sm font-semibold">{pattern.name}</span>
            <span
              className={`mt-1 block text-xs leading-5 ${
                isSelected ? "text-[#4f4f4a]" : "text-[#8a8a85]"
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
