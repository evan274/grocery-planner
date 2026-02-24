"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Recipe } from "@/lib/types";
import { getSharedIngredients } from "@/lib/suggest";

interface RecipeSwapSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidates: Recipe[];
  currentRecipes: Recipe[];
  onSelect: (recipe: Recipe) => void;
}

export function RecipeSwapSheet({
  open,
  onOpenChange,
  candidates,
  currentRecipes,
  onSelect,
}: RecipeSwapSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[70vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Swap Recipe</SheetTitle>
        </SheetHeader>
        <div className="mt-4 space-y-2">
          {candidates.map((candidate) => {
            const shared = currentRecipes.flatMap((r) =>
              getSharedIngredients(candidate, r)
            );
            const uniqueShared = [...new Set(shared)];

            return (
              <button
                key={candidate.id}
                onClick={() => {
                  onSelect(candidate);
                  onOpenChange(false);
                }}
                className="w-full text-left p-3 rounded-lg border hover:bg-accent transition-colors"
              >
                <div className="font-medium text-sm">{candidate.name}</div>
                {uniqueShared.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {uniqueShared.slice(0, 4).map((ing) => (
                      <Badge key={ing} variant="secondary" className="text-xs">
                        {ing}
                      </Badge>
                    ))}
                    {uniqueShared.length > 4 && (
                      <span className="text-xs text-muted-foreground">
                        +{uniqueShared.length - 4} shared
                      </span>
                    )}
                  </div>
                )}
                {uniqueShared.length === 0 && (
                  <span className="text-xs text-muted-foreground">
                    No shared ingredients
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
}
