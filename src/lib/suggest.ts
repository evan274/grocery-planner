import { Recipe } from "./types";

function normalizeKey(name: string): string {
  const synonyms: Record<string, string> = {
    "extra-virgin olive oil": "olive oil",
    "oil": "olive oil",
    "kosher salt": "salt",
    "sea salt": "salt",
    "flaky salt": "salt",
    "crushed red pepper": "red pepper flakes",
    "red chili flakes": "red pepper flakes",
    "crushed red pepper flakes": "red pepper flakes",
    "dark soy sauce": "soy sauce",
    "low-sodium soy sauce": "soy sauce",
    "toasted sesame oil": "sesame oil",
    "hot italian sausage": "italian sausage",
    "spicy italian chicken sausage": "chicken sausage",
    "tenderstem broccoli": "broccoli",
    "curly kale": "kale",
    "salmon fillet": "salmon",
    "flat-leaf parsley": "fresh parsley",
    "organic ground beef": "ground beef",
    "store-bought potato gnocchi": "potato gnocchi",
    "garbanzo beans": "chickpeas",
    "persian cucumbers": "cucumbers",
    "cornflour": "cornstarch",
  };
  const lower = name.toLowerCase().trim();
  return synonyms[lower] ?? lower;
}

// Pantry staples we don't count for overlap scoring
const pantryStaples = new Set([
  "salt",
  "black pepper",
  "olive oil",
  "red pepper flakes",
  "water",
  "cooking spray",
]);

function getIngredientKeys(recipe: Recipe): Set<string> {
  const keys = new Set<string>();
  for (const ing of recipe.ingredients) {
    const key = normalizeKey(ing.name);
    if (!pantryStaples.has(key)) {
      keys.add(key);
    }
  }
  return keys;
}

function overlapScore(keysA: Set<string>, keysB: Set<string>): number {
  let count = 0;
  for (const key of keysA) {
    if (keysB.has(key)) count++;
  }
  return count;
}

export function buildOverlapMatrix(recipes: Recipe[]): Map<string, Map<string, number>> {
  const keyCache = new Map<string, Set<string>>();
  for (const r of recipes) {
    keyCache.set(r.id, getIngredientKeys(r));
  }

  const matrix = new Map<string, Map<string, number>>();
  for (const a of recipes) {
    const row = new Map<string, number>();
    for (const b of recipes) {
      if (a.id === b.id) continue;
      row.set(b.id, overlapScore(keyCache.get(a.id)!, keyCache.get(b.id)!));
    }
    matrix.set(a.id, row);
  }
  return matrix;
}

export function suggestMeals(
  recipes: Recipe[],
  count: number,
  excludeIds: Set<string> = new Set()
): Recipe[] {
  const available = recipes.filter((r) => r.mealType === "dinner" && !excludeIds.has(r.id));
  if (available.length <= count) return [...available];

  const matrix = buildOverlapMatrix(available);
  const keyCache = new Map<string, Set<string>>();
  for (const r of available) {
    keyCache.set(r.id, getIngredientKeys(r));
  }

  // Random starting recipe
  const startIdx = Math.floor(Math.random() * available.length);
  const selected: Recipe[] = [available[startIdx]];
  const selectedIds = new Set([available[startIdx].id]);

  // Greedily add recipes with highest overlap to current set
  while (selected.length < count) {
    let bestRecipe: Recipe | null = null;
    let bestScore = -1;

    for (const candidate of available) {
      if (selectedIds.has(candidate.id)) continue;

      // Sum overlap with all already-selected recipes
      let totalOverlap = 0;
      for (const sel of selected) {
        totalOverlap += matrix.get(sel.id)?.get(candidate.id) ?? 0;
      }

      // Add small random jitter for variety
      totalOverlap += Math.random() * 0.5;

      if (totalOverlap > bestScore) {
        bestScore = totalOverlap;
        bestRecipe = candidate;
      }
    }

    if (!bestRecipe) break;
    selected.push(bestRecipe);
    selectedIds.add(bestRecipe.id);
  }

  return selected;
}

export function rankSwapCandidates(
  allRecipes: Recipe[],
  currentSelections: Recipe[],
  swappingRecipeId: string
): Recipe[] {
  const remaining = currentSelections.filter((r) => r.id !== swappingRecipeId);
  const remainingKeys = remaining.map((r) => getIngredientKeys(r));

  const candidates = allRecipes.filter(
    (r) =>
      r.mealType === "dinner" &&
      r.id !== swappingRecipeId &&
      !remaining.some((sel) => sel.id === r.id)
  );

  return candidates
    .map((candidate) => {
      const candidateKeys = getIngredientKeys(candidate);
      let totalOverlap = 0;
      for (const keys of remainingKeys) {
        totalOverlap += overlapScore(candidateKeys, keys);
      }
      return { recipe: candidate, score: totalOverlap };
    })
    .sort((a, b) => b.score - a.score)
    .map((r) => r.recipe);
}

export function getSharedIngredients(recipeA: Recipe, recipeB: Recipe): string[] {
  const keysA = getIngredientKeys(recipeA);
  const keysB = getIngredientKeys(recipeB);
  const shared: string[] = [];
  for (const key of keysA) {
    if (keysB.has(key)) {
      shared.push(key.charAt(0).toUpperCase() + key.slice(1));
    }
  }
  return shared;
}
