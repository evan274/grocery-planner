import { Recipe, MealSelection, ConsolidatedItem, StoreCategory } from "./types";
import { applyRounding } from "./rounding";

const synonymMap: Record<string, string> = {
  "extra-virgin olive oil": "olive oil",
  "evoo": "olive oil",
  "oil": "olive oil",
  "oil spray": "cooking spray",
  "kosher salt": "salt",
  "sea salt": "salt",
  "flaky salt": "salt",
  "crushed red pepper": "red pepper flakes",
  "red chili flakes": "red pepper flakes",
  "crushed red pepper flakes": "red pepper flakes",
  "cornflour": "cornstarch",
  "dark soy sauce": "soy sauce",
  "low-sodium soy sauce": "soy sauce",
  "toasted sesame oil": "sesame oil",
  "flat-leaf parsley": "fresh parsley",
  "dried parsley": "dried parsley",
  "organic ground beef": "ground beef",
  "hot italian sausage": "italian sausage",
  "spicy italian chicken sausage": "chicken sausage",
  "93% lean ground turkey": "ground turkey",
  "store-bought potato gnocchi": "potato gnocchi",
  "tenderstem broccoli": "broccoli",
  "curly kale": "kale",
  "salmon fillet": "salmon",
  "boneless chicken breast": "chicken breast",
  "garbanzo beans": "chickpeas",
  "persian cucumbers": "cucumbers",
  "lemon juice": "lemon",
  "panko bread crumbs": "breadcrumbs",
  "seasoned breadcrumbs": "breadcrumbs",
};

const categoryMap: Record<string, StoreCategory> = {
  // Produce
  "broccoli": "Produce",
  "broccolini": "Produce",
  "kale": "Produce",
  "spinach": "Produce",
  "zucchini": "Produce",
  "cherry tomatoes": "Produce",
  "tomatoes": "Produce",
  "cucumber": "Produce",
  "cucumbers": "Produce",
  "carrots": "Produce",
  "red onion": "Produce",
  "yellow onion": "Produce",
  "white onion": "Produce",
  "garlic": "Produce",
  "lemon": "Produce",
  "lime": "Produce",
  "orange": "Produce",
  "fresh ginger": "Produce",
  "eggplant": "Produce",
  "red pepper": "Produce",
  "green beans": "Produce",
  "fresh corn kernels": "Produce",
  "fresh parsley": "Produce",
  "fresh basil": "Produce",
  "mixed fresh herbs": "Produce",
  "fresh dill": "Produce",
  "fresh thyme leaves": "Produce",
  "spring onion": "Produce",
  "red chilli": "Produce",
  "cauliflower": "Produce",
  "sun-dried tomatoes": "Produce",
  "flat-leaf parsley": "Produce",

  // Meat & Seafood
  "italian sausage": "Meat & Seafood",
  "chicken sausage": "Meat & Seafood",
  "ground beef": "Meat & Seafood",
  "ground turkey": "Meat & Seafood",
  "ground chicken": "Meat & Seafood",
  "chicken breast": "Meat & Seafood",
  "large shrimp": "Meat & Seafood",
  "cod": "Meat & Seafood",
  "salmon": "Meat & Seafood",
  "anchovy": "Meat & Seafood",
  "firm tofu": "Meat & Seafood",

  // Dairy & Eggs
  "parmesan cheese": "Dairy & Eggs",
  "pecorino cheese": "Dairy & Eggs",
  "feta cheese": "Dairy & Eggs",
  "shredded mozzarella": "Dairy & Eggs",
  "dairy-free ricotta": "Dairy & Eggs",
  "burrata": "Dairy & Eggs",
  "greek yogurt": "Dairy & Eggs",
  "unsalted butter": "Dairy & Eggs",
  "egg": "Dairy & Eggs",
  "eggs": "Dairy & Eggs",
  "unsweetened coconut cream": "Dairy & Eggs",

  // Bakery & Bread
  "bread": "Bakery & Bread",
  "breadcrumbs": "Bakery & Bread",

  // Pasta & Grains
  "potato gnocchi": "Pasta & Grains",
  "fusilli pasta": "Pasta & Grains",
  "orzo": "Pasta & Grains",
  "orecchiette": "Pasta & Grains",
  "lasagna noodles": "Pasta & Grains",
  "couscous": "Pasta & Grains",
  "dried soba noodles": "Pasta & Grains",
  "sticky rice": "Pasta & Grains",
  "jasmine rice": "Pasta & Grains",
  "farro": "Pasta & Grains",

  // Canned & Jarred
  "cannellini beans": "Canned & Jarred",
  "chickpeas": "Canned & Jarred",
  "marinara sauce": "Canned & Jarred",
  "vodka sauce": "Canned & Jarred",
  "tomato paste": "Canned & Jarred",
  "chicken broth": "Canned & Jarred",
  "pesto": "Canned & Jarred",
  "capers": "Canned & Jarred",

  // Oils & Vinegars
  "olive oil": "Oils & Vinegars",
  "sesame oil": "Oils & Vinegars",
  "cooking spray": "Oils & Vinegars",
  "rice vinegar": "Oils & Vinegars",
  "white wine vinegar": "Oils & Vinegars",
  "sherry vinegar": "Oils & Vinegars",
  "dry white wine": "Oils & Vinegars",

  // Spices & Seasonings
  "salt": "Spices & Seasonings",
  "black pepper": "Spices & Seasonings",
  "red pepper flakes": "Spices & Seasonings",
  "italian seasoning": "Spices & Seasonings",
  "cumin": "Spices & Seasonings",
  "paprika": "Spices & Seasonings",
  "ground cloves": "Spices & Seasonings",
  "turmeric": "Spices & Seasonings",
  "ground cinnamon": "Spices & Seasonings",
  "za'atar": "Spices & Seasonings",

  // Sauces & Condiments
  "soy sauce": "Sauces & Condiments",
  "tahini paste": "Sauces & Condiments",
  "tahini": "Sauces & Condiments",
  "honey": "Sauces & Condiments",
  "maple syrup": "Sauces & Condiments",
  "dijon mustard": "Sauces & Condiments",
  "dark brown sugar": "Sauces & Condiments",
  "nutritional yeast": "Sauces & Condiments",
  "sesame seeds": "Sauces & Condiments",
  "unsweetened coconut flakes": "Sauces & Condiments",
  "sol food dressing": "Sauces & Condiments",
  "cornstarch": "Sauces & Condiments",
  "dried parsley": "Spices & Seasonings",
};

// Volume conversions to teaspoons
const volumeToTsp: Record<string, number> = {
  tsp: 1,
  tbsp: 3,
  cup: 48,
  cups: 48,
  quart: 192,
  quarts: 192,
};

function normalizeIngredientName(name: string): string {
  const lower = name.toLowerCase().trim();
  return synonymMap[lower] ?? lower;
}

function getCategory(normalizedName: string): StoreCategory {
  return categoryMap[normalizedName] ?? "Other";
}

function isVolumeUnit(unit: string): boolean {
  return unit.toLowerCase() in volumeToTsp;
}

function toTsp(amount: number, unit: string): number {
  const factor = volumeToTsp[unit.toLowerCase()];
  return factor ? amount * factor : amount;
}

function fromTsp(tsp: number): { amount: number; unit: string } {
  if (tsp >= 48) {
    return { amount: Math.round((tsp / 48) * 100) / 100, unit: "cup" };
  }
  if (tsp >= 3) {
    return { amount: Math.round((tsp / 3) * 100) / 100, unit: "tbsp" };
  }
  return { amount: Math.round(tsp * 100) / 100, unit: "tsp" };
}

function isToTaste(amount: string): boolean {
  const lower = amount.toLowerCase().trim();
  return lower === "to taste" || lower === "as needed";
}

export interface ConsolidationResult {
  items: ConsolidatedItem[];
  pantryItems: ConsolidatedItem[];
}

export function consolidateIngredients(
  recipes: Recipe[],
  selections: MealSelection[],
  pantrySet?: Set<string>
): ConsolidatedItem[] {
  const result = consolidateWithPantry(recipes, selections, pantrySet);
  return result.items;
}

export function consolidateWithPantry(
  recipes: Recipe[],
  selections: MealSelection[],
  pantrySet?: Set<string>
): ConsolidationResult {
  const selectionMap = new Map(selections.map((s) => [s.recipeId, s]));
  const groups = new Map<
    string,
    {
      displayName: string;
      totalTsp: number | null;
      unit: string;
      category: StoreCategory;
      isToTaste: boolean;
      sources: Set<string>;
      hasVolume: boolean;
      rawAmounts: { amount: number; unit: string }[];
    }
  >();

  for (const recipe of recipes) {
    const selection = selectionMap.get(recipe.id);
    if (!selection) continue;

    const scale = selection.servings / 4;

    for (const ing of recipe.ingredients) {
      const normalized = normalizeIngredientName(ing.name);
      const category = getCategory(normalized);
      const toTaste = isToTaste(ing.amount);

      if (!groups.has(normalized)) {
        groups.set(normalized, {
          displayName: capitalize(normalized),
          totalTsp: null,
          unit: ing.unit,
          category,
          isToTaste: toTaste,
          sources: new Set(),
          hasVolume: false,
          rawAmounts: [],
        });
      }

      const group = groups.get(normalized)!;
      group.sources.add(recipe.name);

      if (toTaste) {
        group.isToTaste = true;
        continue;
      }

      if (ing.numericAmount === null) continue;

      const scaledAmount = ing.numericAmount * scale;

      if (isVolumeUnit(ing.unit)) {
        const tsp = toTsp(scaledAmount, ing.unit);
        group.hasVolume = true;
        group.totalTsp = (group.totalTsp ?? 0) + tsp;
      } else {
        group.rawAmounts.push({ amount: scaledAmount, unit: ing.unit });
      }
    }
  }

  const allItems: ConsolidatedItem[] = [];

  for (const [normalized, group] of groups) {
    if (group.isToTaste && group.totalTsp === null && group.rawAmounts.length === 0) {
      allItems.push({
        normalizedName: normalized,
        displayName: group.displayName,
        totalAmount: null,
        unit: "",
        category: group.category,
        isToTaste: true,
        sources: Array.from(group.sources),
      });
      continue;
    }

    if (group.hasVolume && group.totalTsp !== null) {
      const converted = fromTsp(group.totalTsp);
      allItems.push({
        normalizedName: normalized,
        displayName: group.displayName,
        totalAmount: converted.amount,
        unit: converted.unit,
        category: group.category,
        isToTaste: false,
        sources: Array.from(group.sources),
      });
    }

    // Group non-volume amounts by unit
    const byUnit = new Map<string, number>();
    for (const raw of group.rawAmounts) {
      const u = raw.unit.toLowerCase();
      byUnit.set(u, (byUnit.get(u) ?? 0) + raw.amount);
    }

    for (const [unit, total] of byUnit) {
      // If we already added a volume entry, skip if this is also volume
      if (group.hasVolume && isVolumeUnit(unit)) continue;

      allItems.push({
        normalizedName: normalized,
        displayName: group.displayName,
        totalAmount: Math.round(total * 100) / 100,
        unit,
        category: group.category,
        isToTaste: false,
        sources: Array.from(group.sources),
      });
    }
  }

  // Apply rounding for purchasable quantities
  const rounded = applyRounding(allItems);

  // Sort by category then alphabetically
  const categoryOrder: StoreCategory[] = [
    "Produce",
    "Meat & Seafood",
    "Dairy & Eggs",
    "Bakery & Bread",
    "Pasta & Grains",
    "Canned & Jarred",
    "Oils & Vinegars",
    "Spices & Seasonings",
    "Sauces & Condiments",
    "Frozen",
    "Other",
  ];

  rounded.sort((a, b) => {
    const catDiff = categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category);
    if (catDiff !== 0) return catDiff;
    return a.displayName.localeCompare(b.displayName);
  });

  // Split into regular items and pantry items
  if (pantrySet && pantrySet.size > 0) {
    const regular: ConsolidatedItem[] = [];
    const pantry: ConsolidatedItem[] = [];

    for (const item of rounded) {
      if (pantrySet.has(item.normalizedName)) {
        pantry.push({ ...item, isPantry: true });
      } else {
        regular.push(item);
      }
    }

    return { items: regular, pantryItems: pantry };
  }

  return { items: rounded, pantryItems: [] };
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function formatAmount(item: ConsolidatedItem): string {
  if (item.isToTaste) return "To taste";
  if (item.totalAmount === null) return "";

  const amt = item.totalAmount;
  const display = Number.isInteger(amt) ? amt.toString() : formatFraction(amt);
  return item.unit ? `${display} ${item.unit}` : display;
}

function formatFraction(n: number): string {
  const whole = Math.floor(n);
  const frac = n - whole;

  const fractions: [number, string][] = [
    [0.125, "1/8"],
    [0.25, "1/4"],
    [0.33, "1/3"],
    [0.375, "3/8"],
    [0.5, "1/2"],
    [0.625, "5/8"],
    [0.667, "2/3"],
    [0.75, "3/4"],
    [0.875, "7/8"],
  ];

  for (const [val, str] of fractions) {
    if (Math.abs(frac - val) < 0.05) {
      return whole > 0 ? `${whole} ${str}` : str;
    }
  }

  return n % 1 === 0 ? n.toString() : n.toFixed(1);
}

export function formatGroceryListText(items: ConsolidatedItem[], checkedItems: Set<string>): string {
  const unchecked = items.filter((i) => !checkedItems.has(i.normalizedName));
  const grouped = new Map<StoreCategory, ConsolidatedItem[]>();

  for (const item of unchecked) {
    if (!grouped.has(item.category)) grouped.set(item.category, []);
    grouped.get(item.category)!.push(item);
  }

  let text = "";
  for (const [category, categoryItems] of grouped) {
    text += `${category}\n`;
    for (const item of categoryItems) {
      const amount = formatAmount(item);
      text += amount ? `  ${item.displayName} — ${amount}\n` : `  ${item.displayName}\n`;
    }
    text += "\n";
  }

  return text.trim();
}
