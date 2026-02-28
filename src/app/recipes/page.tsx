"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRecipes } from "@/hooks/use-recipes";
import { AppShell } from "@/components/app-shell";
import { Recipe } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RecipeFilters } from "@/components/recipe-filters";
import { Clock, ChefHat, Plus, Pencil, Trash2 } from "lucide-react";

function totalTime(recipe: Recipe): number {
  return (recipe.prepMinutes ?? 0) + (recipe.cookMinutes ?? 0);
}

export default function RecipesPage() {
  const { recipes, loading, deleteRecipe } = useRecipes();
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [sortByTime, setSortByTime] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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
  }, [recipes, activeFilter, sortByTime]);

  async function handleDelete(id: string) {
    if (deletingId === id) {
      await deleteRecipe(id);
      setDeletingId(null);
    } else {
      setDeletingId(id);
      // Reset after 3 seconds if not confirmed
      setTimeout(() => setDeletingId((prev) => (prev === id ? null : prev)), 3000);
    }
  }

  return (
    <AppShell>
      <div className="px-4 py-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">Recipes</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {recipes.length} recipes available
            </p>
          </div>
          <Link href="/recipes/new">
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1.5" />
              Add Recipe
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="py-12 text-center text-muted-foreground">
            Loading recipes...
          </div>
        ) : (
          <>
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
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-sm leading-tight">
                        {recipe.name}
                      </h3>
                      <div className="flex items-center gap-1 shrink-0">
                        <Link href={`/recipes/${recipe.id}/edit`}>
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          className={`h-7 w-7 ${deletingId === recipe.id ? "text-destructive" : "text-muted-foreground"}`}
                          onClick={() => handleDelete(recipe.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>

                    {deletingId === recipe.id && (
                      <p className="text-xs text-destructive">
                        Click delete again to confirm
                      </p>
                    )}

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
          </>
        )}
      </div>
    </AppShell>
  );
}
