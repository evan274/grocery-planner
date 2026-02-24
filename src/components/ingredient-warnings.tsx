"use client";

import { Recipe, MealSelection, WasteWarning } from "@/lib/types";
import { recipes as allRecipes } from "@/data/recipes";
import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";

// Perishable ingredients that trigger waste warnings
const perishables = new Set([
  "broccoli", "broccolini", "kale", "spinach", "zucchini",
  "cherry tomatoes", "tomatoes", "cucumber", "cucumbers", "carrots",
  "red onion", "yellow onion", "white onion", "lemon", "lime", "orange",
  "fresh ginger", "eggplant", "red pepper", "green beans",
  "fresh corn kernels", "fresh parsley", "fresh basil", "mixed fresh herbs",
  "fresh dill", "spring onion", "red chilli", "cauliflower",
  "italian sausage", "chicken sausage", "ground beef", "ground turkey",
  "ground chicken", "chicken breast", "large shrimp", "cod", "salmon",
  "salmon fillet", "firm tofu",
]);

function normalizeKey(name: string): string {
  const synonyms: Record<string, string> = {
    "extra-virgin olive oil": "olive oil",
    "tenderstem broccoli": "broccoli",
    "curly kale": "kale",
    "salmon fillet": "salmon",
    "hot italian sausage": "italian sausage",
    "spicy italian chicken sausage": "chicken sausage",
    "organic ground beef": "ground beef",
    "93% lean ground turkey": "ground turkey",
    "store-bought potato gnocchi": "potato gnocchi",
    "flat-leaf parsley": "fresh parsley",
    "boneless chicken breast": "chicken breast",
  };
  const lower = name.toLowerCase().trim();
  return synonyms[lower] ?? lower;
}

interface IngredientWarningsProps {
  selectedRecipes: Recipe[];
  selections: MealSelection[];
}

export function IngredientWarnings({
  selectedRecipes,
  selections,
}: IngredientWarningsProps) {
  const warnings = useMemo(() => {
    const selectedIds = new Set(selectedRecipes.map((r) => r.id));
    const selectionMap = new Map(selections.map((s) => [s.recipeId, s]));

    // Track how much of each perishable is used
    const usage = new Map<string, { total: number; unit: string }>();

    for (const recipe of selectedRecipes) {
      const sel = selectionMap.get(recipe.id);
      if (!sel) continue;
      const scale = sel.servings / recipe.baseServings;

      for (const ing of recipe.ingredients) {
        const key = normalizeKey(ing.name);
        if (!perishables.has(key) || ing.numericAmount === null) continue;

        const scaled = ing.numericAmount * scale;
        const existing = usage.get(key);
        if (existing) {
          existing.total += scaled;
        } else {
          usage.set(key, { total: scaled, unit: ing.unit });
        }
      }
    }

    // Check for partial amounts and find recipes that could use the rest
    const result: WasteWarning[] = [];

    for (const [key, { total, unit }] of usage) {
      // Only warn about fractional whole items (not volume measurements)
      if (["cup", "cups", "tbsp", "tsp", "oz", "g", "lb", "lbs"].includes(unit.toLowerCase())) continue;

      const remainder = total % 1;
      if (remainder < 0.1 || remainder > 0.9) continue;

      // Find a recipe not in current selections that uses this ingredient
      for (const recipe of allRecipes) {
        if (selectedIds.has(recipe.id)) continue;
        const usesIngredient = recipe.ingredients.some(
          (ing) => normalizeKey(ing.name) === key
        );
        if (usesIngredient) {
          result.push({
            ingredient: key.charAt(0).toUpperCase() + key.slice(1),
            currentAmount: `${total.toFixed(1)} ${unit}`,
            suggestion: `Add ${recipe.name} to use the rest`,
            suggestedRecipeId: recipe.id,
          });
          break;
        }
      }
    }

    return result;
  }, [selectedRecipes, selections]);

  if (warnings.length === 0) return null;

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-muted-foreground">
        Waste warnings
      </h3>
      {warnings.map((w) => (
        <div
          key={w.ingredient}
          className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm dark:border-amber-800 dark:bg-amber-950"
        >
          <Badge variant="outline" className="shrink-0 border-amber-300 text-amber-700 dark:border-amber-700 dark:text-amber-300">
            {w.ingredient}
          </Badge>
          <span className="text-amber-800 dark:text-amber-200">
            You&apos;ll use {w.currentAmount} &mdash; {w.suggestion}
          </span>
        </div>
      ))}
    </div>
  );
}
