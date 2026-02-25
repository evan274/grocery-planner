"use client";

interface RecipeFiltersProps {
  activeFilter: string | null;
  onFilterChange: (filter: string | null) => void;
}

const filters = [
  { id: "under30", label: "Under 30 min" },
  { id: "under45", label: "Under 45 min" },
  { id: "fast", label: "Quick & Easy" },
];

export function RecipeFilters({ activeFilter, onFilterChange }: RecipeFiltersProps) {
  return (
    <div className="flex gap-2 flex-wrap">
      {filters.map((f) => (
        <button
          key={f.id}
          onClick={() => onFilterChange(activeFilter === f.id ? null : f.id)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            activeFilter === f.id
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          }`}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}
