"use client";

import { Button } from "@/components/ui/button";

interface MealCountPickerProps {
  mealCount: number;
  setMealCount: (count: number) => void;
  peopleCount: number;
  updateAllServings: (count: number) => void;
  onGenerate: () => void;
  hasGenerated: boolean;
}

export function MealCountPicker({
  mealCount,
  setMealCount,
  peopleCount,
  updateAllServings,
  onGenerate,
  hasGenerated,
}: MealCountPickerProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <label className="text-sm font-medium text-muted-foreground">
          How many dinners this week?
        </label>
        <div className="flex gap-2">
          {[3, 4, 5, 6, 7].map((n) => (
            <button
              key={n}
              onClick={() => setMealCount(n)}
              className={`h-11 w-11 rounded-lg text-sm font-semibold transition-colors ${
                mealCount === n
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <label className="text-sm font-medium text-muted-foreground">
          Servings per recipe
        </label>
        <div className="flex gap-2">
          {[2, 3, 4, 5, 6].map((n) => (
            <button
              key={n}
              onClick={() => updateAllServings(n)}
              className={`h-11 w-11 rounded-lg text-sm font-semibold transition-colors ${
                peopleCount === n
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      <Button onClick={onGenerate} size="lg" className="w-full">
        {hasGenerated ? "Regenerate Plan" : "Suggest Meals"}
      </Button>
    </div>
  );
}
