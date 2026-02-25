"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { RecipeCard } from "./recipe-card";
import { RecipeSwapSheet } from "./recipe-swap-sheet";
import { IngredientWarnings } from "./ingredient-warnings";
import { Recipe, MealSelection } from "@/lib/types";
import { getSharedIngredients } from "@/lib/suggest";
import { Shuffle } from "lucide-react";

interface SuggestedPlanProps {
  selectedRecipes: Recipe[];
  selections: MealSelection[];
  onShuffle: () => void;
  onSwap: (oldId: string, newRecipe: Recipe) => void;
  onUpdateServings: (recipeId: string, servings: number) => void;
  getSwapCandidates: (recipeId: string) => Recipe[];
  onGenerateList: () => void;
  onAcceptWasteSwap?: (suggestedRecipeId: string) => void;
  onUndo?: () => void;
  canUndo?: boolean;
}

export function SuggestedPlan({
  selectedRecipes,
  selections,
  onShuffle,
  onSwap,
  onUpdateServings,
  getSwapCandidates,
  onGenerateList,
  onAcceptWasteSwap,
  onUndo,
  canUndo,
}: SuggestedPlanProps) {
  const [swapSheetOpen, setSwapSheetOpen] = useState(false);
  const [swappingRecipeId, setSwappingRecipeId] = useState<string | null>(null);
  const [swapCandidates, setSwapCandidates] = useState<Recipe[]>([]);

  const handleSwap = (recipeId: string) => {
    setSwappingRecipeId(recipeId);
    setSwapCandidates(getSwapCandidates(recipeId));
    setSwapSheetOpen(true);
  };

  const handleSelectSwap = (recipe: Recipe) => {
    if (swappingRecipeId) {
      onSwap(swappingRecipeId, recipe);
    }
  };

  // Compute shared ingredients for each recipe with others in the plan
  const sharedMap = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const recipe of selectedRecipes) {
      const others = selectedRecipes.filter((r) => r.id !== recipe.id);
      const allShared = others.flatMap((other) =>
        getSharedIngredients(recipe, other)
      );
      map.set(recipe.id, [...new Set(allShared)]);
    }
    return map;
  }, [selectedRecipes]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Your Meal Plan</h2>
        <Button variant="outline" size="sm" onClick={onShuffle}>
          <Shuffle className="h-4 w-4 mr-1.5" />
          Shuffle
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {selectedRecipes.map((recipe) => {
          const selection = selections.find((s) => s.recipeId === recipe.id);
          if (!selection) return null;

          return (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              selection={selection}
              onUpdateServings={(s) => onUpdateServings(recipe.id, s)}
              onSwap={() => handleSwap(recipe.id)}
              sharedIngredients={sharedMap.get(recipe.id)}
            />
          );
        })}
      </div>

      <IngredientWarnings
        selectedRecipes={selectedRecipes}
        selections={selections}
        onAcceptWasteSwap={onAcceptWasteSwap}
        onUndo={onUndo}
        canUndo={canUndo}
      />

      <Button onClick={onGenerateList} size="lg" className="w-full">
        Generate Grocery List
      </Button>

      <RecipeSwapSheet
        open={swapSheetOpen}
        onOpenChange={setSwapSheetOpen}
        candidates={swapCandidates}
        currentRecipes={selectedRecipes.filter(
          (r) => r.id !== swappingRecipeId
        )}
        onSelect={handleSelectSwap}
      />
    </div>
  );
}
