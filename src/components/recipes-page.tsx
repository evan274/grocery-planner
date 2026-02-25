"use client";

import { useState, useMemo } from "react";
import { recipes } from "@/data/recipes";
import { Recipe } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RecipeFilters } from "./recipe-filters";
import { Clock, ChefHat } from "lucide-react";

function totalTime(recipe: Recipe): number {
  return (recipe.prepMinutes ?? 0) + (recipe.cookMinutes ?? 0);
}

export function RecipesPage() {
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [sortByTime, setSortByTime] = useState(false);

  const filtered = useMemo(() => {
    let result = [...recipes];

    if (activeFilter === "under30") {
      result = result.filter((r) => totalTime(r) <= 30);
    } else if (activeFilter === "under45") {
      result = result.filter((r) => totalTime(r) <= 45);
    } else if (activeFilter === "fast") {
      result = result.filter(
        (r) => r.tags?.includes("fast") || r.tags?.includes("easy")
      );
    }

    if (sortByTime) {
      result.sort((a, b) => totalTime(a) - totalTime(b));
    }

    return result;
  }, [activeFilter, sortByTime]);

  return (
    <div className="px-4 py-6 space-y-4">
      <div>
        <h2 className="text-lg font-semibold">All Recipes</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {recipes.length} recipes available
        </p>
      </div>

      <div className="flex items-center justify-between gap-2">
        <RecipeFilters activeFilter={activeFilter} onFilterChange={setActiveFilter} />
        <button
          onClick={() => setSortByTime(!sortByTime)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
            sortByTime
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          }`}
        >
          Sort by time
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filtered.map((recipe) => (
          <Card key={recipe.id}>
            <CardContent className="p-4 space-y-3">
              <h3 className="font-semibold text-sm leading-tight">
                {recipe.name}
              </h3>

              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                {recipe.prepMinutes != null && (
                  <span className="flex items-center gap-1">
                    <ChefHat className="h-3 w-3" />
                    {recipe.prepMinutes}m prep
                  </span>
                )}
                {recipe.cookMinutes != null && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {recipe.cookMinutes}m cook
                  </span>
                )}
                {(recipe.prepMinutes != null || recipe.cookMinutes != null) && (
                  <Badge variant="secondary" className="text-xs">
                    {totalTime(recipe)} min total
                  </Badge>
                )}
              </div>

              {recipe.tags && recipe.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {recipe.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs capitalize">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              <div className="text-xs text-muted-foreground">
                {recipe.ingredients.length} ingredients &middot;{" "}
                {recipe.mealType === "dinner" ? "Dinner" : "Lunch"} &middot;{" "}
                Base {recipe.baseServings} servings
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-8">
          No recipes match this filter.
        </p>
      )}
    </div>
  );
}
