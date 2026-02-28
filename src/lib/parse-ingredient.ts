import { Ingredient } from "./types";

const UNITS = new Set([
  "cup", "cups", "tablespoon", "tablespoons", "tbsp",
  "teaspoon", "teaspoons", "tsp", "ounce", "ounces", "oz",
  "pound", "pounds", "lb", "lbs", "gram", "grams", "g",
  "kilogram", "kilograms", "kg", "milliliter", "milliliters", "ml",
  "liter", "liters", "l", "quart", "quarts", "pint", "pints",
  "gallon", "gallons", "pinch", "dash", "handful", "bunch",
  "clove", "cloves", "head", "heads", "can", "cans",
  "package", "packages", "bag", "bags", "jar", "jars",
  "bottle", "bottles", "slice", "slices", "piece", "pieces",
  "whole", "large", "medium", "small", "stick", "sticks",
  "sprig", "sprigs", "link", "links", "fillet", "fillets",
]);

const UNIT_NORMALIZE: Record<string, string> = {
  tablespoon: "tbsp", tablespoons: "tbsp",
  teaspoon: "tsp", teaspoons: "tsp",
  ounce: "oz", ounces: "oz",
  pound: "lb", pounds: "lb", lbs: "lb",
  gram: "g", grams: "g",
  cups: "cup",
  cloves: "cloves", clove: "clove",
  cans: "can",
};

// Unicode fractions
const FRACTION_MAP: Record<string, number> = {
  "½": 0.5, "⅓": 0.333, "⅔": 0.667, "¼": 0.25, "¾": 0.75,
  "⅛": 0.125, "⅜": 0.375, "⅝": 0.625, "⅞": 0.875,
  "⅕": 0.2, "⅖": 0.4, "⅗": 0.6, "⅘": 0.8, "⅙": 0.167, "⅚": 0.833,
};

function parseNumber(s: string): number | null {
  // Handle unicode fractions
  for (const [frac, val] of Object.entries(FRACTION_MAP)) {
    if (s.includes(frac)) {
      const prefix = s.replace(frac, "").trim();
      const whole = prefix ? parseFloat(prefix) : 0;
      if (!isNaN(whole)) return whole + val;
    }
  }

  // Handle "1/2" style fractions
  const fracMatch = s.match(/^(\d+)\s+(\d+)\/(\d+)$/);
  if (fracMatch) {
    return parseInt(fracMatch[1]) + parseInt(fracMatch[2]) / parseInt(fracMatch[3]);
  }

  const simpleFrac = s.match(/^(\d+)\/(\d+)$/);
  if (simpleFrac) {
    return parseInt(simpleFrac[1]) / parseInt(simpleFrac[2]);
  }

  const num = parseFloat(s);
  return isNaN(num) ? null : num;
}

export function parseIngredientString(raw: string): Ingredient {
  let text = raw.trim();

  // Extract parenthetical notes
  let notes = "";
  const parenMatch = text.match(/\(([^)]+)\)/);
  if (parenMatch) {
    notes = parenMatch[1];
    text = text.replace(parenMatch[0], "").trim();
  }

  // Extract leading number/fraction
  const numPattern = /^([\d\s½⅓⅔¼¾⅛⅜⅝⅞⅕⅖⅗⅘⅙⅚./]+)\s*/;
  const numMatch = text.match(numPattern);

  let numericAmount: number | null = null;
  let amount = "";

  if (numMatch) {
    const numStr = numMatch[1].trim();
    numericAmount = parseNumber(numStr);
    amount = numStr;
    text = text.slice(numMatch[0].length).trim();
  }

  // Extract unit
  let unit = "";
  const words = text.split(/\s+/);
  if (words.length > 0 && UNITS.has(words[0].toLowerCase().replace(/,/, ""))) {
    const rawUnit = words[0].toLowerCase().replace(/,/, "");
    unit = UNIT_NORMALIZE[rawUnit] ?? rawUnit;
    words.shift();

    // Handle "of" after unit
    if (words[0]?.toLowerCase() === "of") {
      words.shift();
    }
  }

  const name = words.join(" ").replace(/,\s*$/, "").trim();

  // Extract trailing notes after comma
  const commaIdx = name.indexOf(",");
  let finalName = name;
  if (commaIdx !== -1) {
    const trailingNote = name.slice(commaIdx + 1).trim();
    finalName = name.slice(0, commaIdx).trim();
    notes = notes ? `${notes}, ${trailingNote}` : trailingNote;
  }

  return {
    amount: amount || (numericAmount !== null ? String(numericAmount) : ""),
    unit,
    name: finalName || raw,
    component: "",
    notes,
    numericAmount,
  };
}

export function parseISO8601Duration(iso: string): number | undefined {
  if (!iso) return undefined;
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!match) return undefined;
  const hours = parseInt(match[1] || "0");
  const minutes = parseInt(match[2] || "0");
  return hours * 60 + minutes || undefined;
}
