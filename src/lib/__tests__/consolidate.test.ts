import { describe, it, expect } from "vitest";
import { consolidateIngredients } from "../consolidate";
import { Recipe, MealSelection } from "../types";

function makeRecipe(overrides: Partial<Recipe> & { id: string; name: string }): Recipe {
  return {
    mealType: "dinner",
    baseServings: 4,
    ingredients: [],
    ...overrides,
  };
}

describe("consolidateIngredients", () => {
  it("merges same ingredient from multiple recipes", () => {
    const recipes: Recipe[] = [
      makeRecipe({
        id: "a",
        name: "Recipe A",
        ingredients: [
          { amount: "2", unit: "cloves", name: "Garlic", component: "", notes: "", numericAmount: 2 },
        ],
      }),
      makeRecipe({
        id: "b",
        name: "Recipe B",
        ingredients: [
          { amount: "3", unit: "cloves", name: "Garlic", component: "", notes: "", numericAmount: 3 },
        ],
      }),
    ];
    const selections: MealSelection[] = [
      { recipeId: "a", servings: 4 },
      { recipeId: "b", servings: 4 },
    ];

    const result = consolidateIngredients(recipes, selections);
    const garlic = result.find((i) => i.normalizedName === "garlic");
    expect(garlic).toBeDefined();
    // 2 + 3 = 5 cloves → rounded to 1 head (garlic rounding: ceil(5/10) = 1)
    expect(garlic!.totalAmount).toBe(1);
    expect(garlic!.unit).toBe("head");
    expect(garlic!.sources).toContain("Recipe A");
    expect(garlic!.sources).toContain("Recipe B");
  });

  it("handles same ingredient with different units as separate items", () => {
    const recipes: Recipe[] = [
      makeRecipe({
        id: "a",
        name: "Recipe A",
        ingredients: [
          { amount: "1", unit: "tbsp", name: "Garlic", component: "", notes: "", numericAmount: 1 },
        ],
      }),
      makeRecipe({
        id: "b",
        name: "Recipe B",
        ingredients: [
          { amount: "2", unit: "cloves", name: "Garlic", component: "", notes: "", numericAmount: 2 },
        ],
      }),
    ];
    const selections: MealSelection[] = [
      { recipeId: "a", servings: 4 },
      { recipeId: "b", servings: 4 },
    ];

    const result = consolidateIngredients(recipes, selections);
    const garlicItems = result.filter((i) => i.normalizedName === "garlic");
    // Should have both a volume entry and a cloves entry
    expect(garlicItems.length).toBe(2);
  });

  it("merges volume units correctly (tsp + tbsp + cup)", () => {
    const recipes: Recipe[] = [
      makeRecipe({
        id: "a",
        name: "Recipe A",
        ingredients: [
          { amount: "2", unit: "tbsp", name: "Olive oil", component: "", notes: "", numericAmount: 2 },
        ],
      }),
      makeRecipe({
        id: "b",
        name: "Recipe B",
        ingredients: [
          { amount: "0.25", unit: "cup", name: "Extra-virgin olive oil", component: "", notes: "", numericAmount: 0.25 },
        ],
      }),
    ];
    const selections: MealSelection[] = [
      { recipeId: "a", servings: 4 },
      { recipeId: "b", servings: 4 },
    ];

    const result = consolidateIngredients(recipes, selections);
    const oil = result.find((i) => i.normalizedName === "olive oil");
    expect(oil).toBeDefined();
    // 2 tbsp = 6 tsp, 0.25 cup = 12 tsp → total 18 tsp = 6 tbsp → about 0.38 cup
    // fromTsp(18) → 18/3 = 6 tbsp
    expect(oil!.unit).toBe("tbsp");
    expect(oil!.totalAmount).toBe(6);
  });

  it("collapses synonyms correctly", () => {
    const recipes: Recipe[] = [
      makeRecipe({
        id: "a",
        name: "Recipe A",
        ingredients: [
          { amount: "1", unit: "tsp", name: "Kosher salt", component: "", notes: "", numericAmount: 1 },
        ],
      }),
      makeRecipe({
        id: "b",
        name: "Recipe B",
        ingredients: [
          { amount: "0.5", unit: "tsp", name: "Sea salt", component: "", notes: "", numericAmount: 0.5 },
        ],
      }),
    ];
    const selections: MealSelection[] = [
      { recipeId: "a", servings: 4 },
      { recipeId: "b", servings: 4 },
    ];

    const result = consolidateIngredients(recipes, selections);
    const salt = result.find((i) => i.normalizedName === "salt");
    expect(salt).toBeDefined();
    expect(salt!.totalAmount).toBe(1.5);
    expect(salt!.unit).toBe("tsp");
  });

  it("handles to-taste items without amounts", () => {
    const recipes: Recipe[] = [
      makeRecipe({
        id: "a",
        name: "Recipe A",
        ingredients: [
          { amount: "To taste", unit: "", name: "Salt", component: "", notes: "", numericAmount: null },
        ],
      }),
    ];
    const selections: MealSelection[] = [{ recipeId: "a", servings: 4 }];

    const result = consolidateIngredients(recipes, selections);
    const salt = result.find((i) => i.normalizedName === "salt");
    expect(salt).toBeDefined();
    expect(salt!.isToTaste).toBe(true);
    expect(salt!.totalAmount).toBeNull();
  });

  it("scales quantities based on servings / 4", () => {
    const recipes: Recipe[] = [
      makeRecipe({
        id: "a",
        name: "Recipe A",
        baseServings: 4,
        ingredients: [
          { amount: "1", unit: "lb", name: "Ground beef", component: "", notes: "", numericAmount: 1 },
        ],
      }),
    ];
    // Request 8 servings → scale = 8/4 = 2x
    const selections: MealSelection[] = [{ recipeId: "a", servings: 8 }];

    const result = consolidateIngredients(recipes, selections);
    const beef = result.find((i) => i.normalizedName === "ground beef");
    expect(beef).toBeDefined();
    expect(beef!.totalAmount).toBe(2);
  });

  it("rounds discrete items up to whole numbers", () => {
    const recipes: Recipe[] = [
      makeRecipe({
        id: "a",
        name: "Recipe A",
        ingredients: [
          { amount: "0.5", unit: "whole", name: "Lemon", component: "", notes: "", numericAmount: 0.5 },
        ],
      }),
    ];
    const selections: MealSelection[] = [{ recipeId: "a", servings: 4 }];

    const result = consolidateIngredients(recipes, selections);
    const lemon = result.find((i) => i.normalizedName === "lemon");
    expect(lemon).toBeDefined();
    expect(lemon!.totalAmount).toBe(1); // 0.5 rounded up to 1
  });

  it("rounds weight items to nearest 0.25 lb", () => {
    const recipes: Recipe[] = [
      makeRecipe({
        id: "a",
        name: "Recipe A",
        ingredients: [
          { amount: "1.3", unit: "lbs", name: "Chicken breast", component: "", notes: "", numericAmount: 1.3 },
        ],
      }),
    ];
    const selections: MealSelection[] = [{ recipeId: "a", servings: 4 }];

    const result = consolidateIngredients(recipes, selections);
    const chicken = result.find((i) => i.normalizedName === "chicken breast");
    expect(chicken).toBeDefined();
    expect(chicken!.totalAmount).toBe(1.5); // 1.3 rounded up to nearest 0.25
  });
});
