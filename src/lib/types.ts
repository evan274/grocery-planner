export interface Ingredient {
  amount: string;
  unit: string;
  name: string;
  component: string;
  notes: string;
  numericAmount: number | null; // parsed from amount string, null for "to taste"
}

export interface Recipe {
  id: string;
  name: string;
  mealType: "dinner" | "lunch";
  baseServings: number;
  ingredients: Ingredient[];
}

export interface MealSelection {
  recipeId: string;
  servings: number;
}

export type StoreCategory =
  | "Produce"
  | "Meat & Seafood"
  | "Dairy & Eggs"
  | "Bakery & Bread"
  | "Pasta & Grains"
  | "Canned & Jarred"
  | "Oils & Vinegars"
  | "Spices & Seasonings"
  | "Sauces & Condiments"
  | "Frozen"
  | "Other";

export interface ConsolidatedItem {
  normalizedName: string;
  displayName: string;
  totalAmount: number | null;
  unit: string;
  category: StoreCategory;
  isToTaste: boolean;
  sources: string[]; // recipe names
}

export interface WasteWarning {
  ingredient: string;
  currentAmount: string;
  suggestion: string;
  suggestedRecipeId: string;
}

export type ViewState = "plan" | "list";
