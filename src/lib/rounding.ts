import { ConsolidatedItem } from "./types";

type RoundingRule = (amount: number) => number;

const roundUpWhole: RoundingRule = (n) => Math.ceil(n);

const roundToQuarterLb: RoundingRule = (n) => Math.ceil(n * 4) / 4;

const clovesToHeads = (cloves: number): { amount: number; unit: string } => {
  const heads = cloves / 10;
  return { amount: Math.ceil(heads), unit: "head" };
};

const discreteItems = new Set([
  "broccoli",
  "broccolini",
  "carrots",
  "lemon",
  "lime",
  "orange",
  "yellow onion",
  "white onion",
  "red onion",
  "red pepper",
  "eggplant",
  "zucchini",
  "cauliflower",
  "egg",
  "eggs",
]);

const weightUnits = new Set(["lb", "lbs"]);

const garlicCloveUnits = new Set(["clove", "cloves"]);

export function applyRounding(items: ConsolidatedItem[]): ConsolidatedItem[] {
  return items.map((item) => {
    if (item.isToTaste || item.totalAmount === null) return item;

    // Garlic cloves → heads
    if (
      item.normalizedName === "garlic" &&
      garlicCloveUnits.has(item.unit.toLowerCase())
    ) {
      const converted = clovesToHeads(item.totalAmount);
      return { ...item, totalAmount: converted.amount, unit: converted.unit };
    }

    // Discrete items: round up to whole number
    if (discreteItems.has(item.normalizedName)) {
      return { ...item, totalAmount: roundUpWhole(item.totalAmount) };
    }

    // Weight items: round to nearest 0.25 lb
    if (weightUnits.has(item.unit.toLowerCase())) {
      return { ...item, totalAmount: roundToQuarterLb(item.totalAmount) };
    }

    // Everything else: keep as-is
    return item;
  });
}
