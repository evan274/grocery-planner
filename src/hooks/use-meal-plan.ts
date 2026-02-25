"use client";

import { useState, useCallback, useMemo, useRef } from "react";
import { recipes } from "@/data/recipes";
import { MealSelection, ViewState, ConsolidatedItem } from "@/lib/types";
import { suggestMeals, rankSwapCandidates } from "@/lib/suggest";
import { consolidateWithPantry, ConsolidationResult } from "@/lib/consolidate";
import { Recipe } from "@/lib/types";
import { usePantryConfig } from "./use-pantry-config";

interface PlanSnapshot {
  selectedRecipes: Recipe[];
  selections: MealSelection[];
}

export function useMealPlan() {
  const [view, setView] = useState<ViewState>("plan");
  const [mealCount, setMealCount] = useState(5);
  const [peopleCount, setPeopleCount] = useState(4);
  const [selections, setSelections] = useState<MealSelection[]>([]);
  const [selectedRecipes, setSelectedRecipes] = useState<Recipe[]>([]);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [hasGenerated, setHasGenerated] = useState(false);

  // Undo support for waste swap
  const undoSnapshot = useRef<PlanSnapshot | null>(null);
  const [canUndo, setCanUndo] = useState(false);

  const { pantryItems, addItem: addPantryItem, removeItem: removePantryItem, isOnHand } = usePantryConfig();

  const generatePlan = useCallback(() => {
    const suggested = suggestMeals(recipes, mealCount);
    setSelectedRecipes(suggested);
    setSelections(
      suggested.map((r) => ({
        recipeId: r.id,
        servings: peopleCount,
      }))
    );
    setHasGenerated(true);
    undoSnapshot.current = null;
    setCanUndo(false);
  }, [mealCount, peopleCount]);

  const shuffle = useCallback(() => {
    const suggested = suggestMeals(recipes, mealCount);
    setSelectedRecipes(suggested);
    setSelections(
      suggested.map((r) => ({
        recipeId: r.id,
        servings: peopleCount,
      }))
    );
    undoSnapshot.current = null;
    setCanUndo(false);
  }, [mealCount, peopleCount]);

  const swapRecipe = useCallback(
    (oldRecipeId: string, newRecipe: Recipe) => {
      setSelectedRecipes((prev) =>
        prev.map((r) => (r.id === oldRecipeId ? newRecipe : r))
      );
      setSelections((prev) =>
        prev.map((s) =>
          s.recipeId === oldRecipeId
            ? { recipeId: newRecipe.id, servings: peopleCount }
            : s
        )
      );
    },
    [peopleCount]
  );

  const acceptWasteSwap = useCallback(
    (suggestedRecipeId: string) => {
      // Save snapshot for undo
      undoSnapshot.current = {
        selectedRecipes: [...selectedRecipes],
        selections: [...selections],
      };
      setCanUndo(true);

      const suggestedRecipe = recipes.find((r) => r.id === suggestedRecipeId);
      if (!suggestedRecipe) return;

      // Find the recipe with lowest overlap to the rest (the "least relevant")
      const overlapScores = selectedRecipes.map((recipe) => {
        const others = selectedRecipes.filter((r) => r.id !== recipe.id);
        // Use rankSwapCandidates logic in reverse: score each current recipe
        // by how much overlap it has with the others
        let totalOverlap = 0;
        for (const other of others) {
          const sharedKeys = new Set<string>();
          const rKeys = new Set(recipe.ingredients.map((i) => i.name.toLowerCase().trim()));
          for (const ing of other.ingredients) {
            if (rKeys.has(ing.name.toLowerCase().trim())) {
              sharedKeys.add(ing.name.toLowerCase().trim());
            }
          }
          totalOverlap += sharedKeys.size;
        }
        return { recipe, score: totalOverlap };
      });

      overlapScores.sort((a, b) => a.score - b.score);
      const leastRelevant = overlapScores[0]?.recipe;
      if (!leastRelevant) return;

      setSelectedRecipes((prev) =>
        prev.map((r) => (r.id === leastRelevant.id ? suggestedRecipe : r))
      );
      setSelections((prev) =>
        prev.map((s) =>
          s.recipeId === leastRelevant.id
            ? { recipeId: suggestedRecipe.id, servings: peopleCount }
            : s
        )
      );
    },
    [selectedRecipes, selections, peopleCount]
  );

  const undoWasteSwap = useCallback(() => {
    if (!undoSnapshot.current) return;
    setSelectedRecipes(undoSnapshot.current.selectedRecipes);
    setSelections(undoSnapshot.current.selections);
    undoSnapshot.current = null;
    setCanUndo(false);
  }, []);

  const getSwapCandidates = useCallback(
    (recipeId: string) => {
      return rankSwapCandidates(recipes, selectedRecipes, recipeId);
    },
    [selectedRecipes]
  );

  const updateServings = useCallback((recipeId: string, servings: number) => {
    setSelections((prev) =>
      prev.map((s) => (s.recipeId === recipeId ? { ...s, servings } : s))
    );
  }, []);

  const updateAllServings = useCallback(
    (count: number) => {
      setPeopleCount(count);
      setSelections((prev) => prev.map((s) => ({ ...s, servings: count })));
    },
    []
  );

  const groceryData: ConsolidationResult = useMemo(() => {
    if (selections.length === 0) return { items: [], pantryItems: [] };
    const selectedRecipeObjects = selections
      .map((s) => recipes.find((r) => r.id === s.recipeId))
      .filter((r): r is Recipe => r !== undefined);
    return consolidateWithPantry(selectedRecipeObjects, selections, pantryItems);
  }, [selections, pantryItems]);

  const groceryList = groceryData.items;
  const pantryReminders = groceryData.pantryItems;

  const [promotedPantryItems, setPromotedPantryItems] = useState<Set<string>>(new Set());

  const promotePantryItem = useCallback((normalizedName: string) => {
    setPromotedPantryItems((prev) => new Set([...prev, normalizedName]));
  }, []);

  const toggleChecked = useCallback((normalizedName: string) => {
    setCheckedItems((prev) => {
      const next = new Set(prev);
      if (next.has(normalizedName)) {
        next.delete(normalizedName);
      } else {
        next.add(normalizedName);
      }
      return next;
    });
  }, []);

  const goToList = useCallback(() => {
    setCheckedItems(new Set());
    setPromotedPantryItems(new Set());
    setView("list");
  }, []);

  const goToPlan = useCallback(() => {
    setView("plan");
  }, []);

  return {
    view,
    mealCount,
    setMealCount,
    peopleCount,
    updateAllServings,
    selections,
    selectedRecipes,
    hasGenerated,
    generatePlan,
    shuffle,
    swapRecipe,
    acceptWasteSwap,
    undoWasteSwap,
    canUndo,
    getSwapCandidates,
    updateServings,
    groceryList,
    pantryReminders,
    promotedPantryItems,
    promotePantryItem,
    checkedItems,
    toggleChecked,
    goToList,
    goToPlan,
    pantryItems,
    addPantryItem,
    removePantryItem,
    isOnHand,
  };
}
