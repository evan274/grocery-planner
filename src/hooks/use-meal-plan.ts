"use client";

import { useState, useCallback, useMemo } from "react";
import { recipes } from "@/data/recipes";
import { MealSelection, ViewState, ConsolidatedItem } from "@/lib/types";
import { suggestMeals, rankSwapCandidates } from "@/lib/suggest";
import { consolidateIngredients } from "@/lib/consolidate";
import { Recipe } from "@/lib/types";

export function useMealPlan() {
  const [view, setView] = useState<ViewState>("plan");
  const [mealCount, setMealCount] = useState(5);
  const [peopleCount, setPeopleCount] = useState(4);
  const [selections, setSelections] = useState<MealSelection[]>([]);
  const [selectedRecipes, setSelectedRecipes] = useState<Recipe[]>([]);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [hasGenerated, setHasGenerated] = useState(false);

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

  const groceryList: ConsolidatedItem[] = useMemo(() => {
    if (selections.length === 0) return [];
    const selectedRecipeObjects = selections
      .map((s) => recipes.find((r) => r.id === s.recipeId))
      .filter((r): r is Recipe => r !== undefined);
    return consolidateIngredients(selectedRecipeObjects, selections);
  }, [selections]);

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
    getSwapCandidates,
    updateServings,
    groceryList,
    checkedItems,
    toggleChecked,
    goToList,
    goToPlan,
  };
}
