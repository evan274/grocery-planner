import { NextResponse } from "next/server";
import * as cheerio from "cheerio";
import { parseIngredientString, parseISO8601Duration } from "@/lib/parse-ingredient";

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Fetch the page
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch URL: ${response.status}` },
        { status: 400 }
      );
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Find JSON-LD script tags
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let recipeData: any = null;

    $('script[type="application/ld+json"]').each((_, el) => {
      try {
        const json = JSON.parse($(el).html() || "");

        // Handle @graph arrays
        if (json["@graph"]) {
          for (const item of json["@graph"]) {
            if (item["@type"] === "Recipe" || (Array.isArray(item["@type"]) && item["@type"].includes("Recipe"))) {
              recipeData = item;
              return false;
            }
          }
        }

        // Handle direct Recipe type
        if (json["@type"] === "Recipe" || (Array.isArray(json["@type"]) && json["@type"].includes("Recipe"))) {
          recipeData = json;
          return false;
        }

        // Handle array of objects
        if (Array.isArray(json)) {
          for (const item of json) {
            if (item["@type"] === "Recipe" || (Array.isArray(item["@type"]) && item["@type"].includes("Recipe"))) {
              recipeData = item;
              return false;
            }
          }
        }
      } catch {
        // Skip invalid JSON
      }
    });

    if (!recipeData) {
      return NextResponse.json(
        { error: "No recipe data found on this page. Try adding it manually." },
        { status: 404 }
      );
    }

    // Parse the recipe data
    const name = (recipeData.name as string) || "Untitled Recipe";

    const rawIngredients = (recipeData.recipeIngredient as string[]) || [];
    const ingredients = rawIngredients.map((raw) => parseIngredientString(raw));

    const prepMinutes = parseISO8601Duration(recipeData.prepTime as string);
    const cookMinutes = parseISO8601Duration(recipeData.cookTime as string);

    // Parse servings
    let baseServings = 4;
    const yieldValue = recipeData.recipeYield;
    if (yieldValue) {
      const yieldStr = Array.isArray(yieldValue) ? yieldValue[0] : yieldValue;
      const parsed = parseInt(String(yieldStr));
      if (!isNaN(parsed) && parsed > 0) {
        baseServings = parsed;
      }
    }

    // Parse tags from category/cuisine
    const tags: string[] = [];
    const category = recipeData.recipeCategory;
    const cuisine = recipeData.recipeCuisine;
    if (category) {
      const cats = Array.isArray(category) ? category : [category];
      tags.push(...cats.map((c) => String(c).toLowerCase()));
    }
    if (cuisine) {
      const cuisines = Array.isArray(cuisine) ? cuisine : [cuisine];
      tags.push(...cuisines.map((c) => String(c).toLowerCase()));
    }

    return NextResponse.json({
      name,
      ingredients,
      prepMinutes: prepMinutes ?? null,
      cookMinutes: cookMinutes ?? null,
      baseServings,
      tags,
    });
  } catch (error) {
    console.error("Scrape error:", error);
    return NextResponse.json(
      { error: "Failed to parse recipe. Try adding it manually." },
      { status: 500 }
    );
  }
}
