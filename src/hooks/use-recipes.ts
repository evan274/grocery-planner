"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Recipe, Ingredient } from "@/lib/types";
import { seedRecipes } from "@/data/seed-recipes";

interface DbRecipe {
  id: string;
  user_id: string;
  name: string;
  meal_type: "dinner" | "lunch";
  base_servings: number;
  prep_minutes: number | null;
  cook_minutes: number | null;
  tags: string[];
  ingredients: Ingredient[];
  created_at: string;
  updated_at: string;
}

function dbToRecipe(row: DbRecipe): Recipe {
  return {
    id: row.id,
    name: row.name,
    mealType: row.meal_type,
    baseServings: row.base_servings,
    prepMinutes: row.prep_minutes ?? undefined,
    cookMinutes: row.cook_minutes ?? undefined,
    tags: row.tags,
    ingredients: row.ingredients,
  };
}

export function useRecipes() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRecipes = useCallback(async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("recipes")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Failed to fetch recipes:", error);
      return;
    }

    if (data && data.length === 0) {
      // First login — seed with starter recipes
      await seedUserRecipes(supabase);
      const { data: seeded } = await supabase
        .from("recipes")
        .select("*")
        .order("created_at", { ascending: true });
      if (seeded) {
        setRecipes(seeded.map(dbToRecipe));
      }
    } else if (data) {
      setRecipes(data.map(dbToRecipe));
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  const addRecipe = useCallback(
    async (recipe: Omit<Recipe, "id">) => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from("recipes")
        .insert({
          user_id: user.id,
          name: recipe.name,
          meal_type: recipe.mealType,
          base_servings: recipe.baseServings,
          prep_minutes: recipe.prepMinutes ?? null,
          cook_minutes: recipe.cookMinutes ?? null,
          tags: recipe.tags ?? [],
          ingredients: recipe.ingredients,
        })
        .select()
        .single();

      if (error) {
        console.error("Failed to add recipe:", error);
        return null;
      }

      const newRecipe = dbToRecipe(data);
      setRecipes((prev) => [...prev, newRecipe]);
      return newRecipe;
    },
    []
  );

  const updateRecipe = useCallback(
    async (id: string, updates: Partial<Omit<Recipe, "id">>) => {
      const supabase = createClient();
      const dbUpdates: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.mealType !== undefined) dbUpdates.meal_type = updates.mealType;
      if (updates.baseServings !== undefined) dbUpdates.base_servings = updates.baseServings;
      if (updates.prepMinutes !== undefined) dbUpdates.prep_minutes = updates.prepMinutes;
      if (updates.cookMinutes !== undefined) dbUpdates.cook_minutes = updates.cookMinutes;
      if (updates.tags !== undefined) dbUpdates.tags = updates.tags;
      if (updates.ingredients !== undefined) dbUpdates.ingredients = updates.ingredients;

      const { data, error } = await supabase
        .from("recipes")
        .update(dbUpdates)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Failed to update recipe:", error);
        return null;
      }

      const updated = dbToRecipe(data);
      setRecipes((prev) => prev.map((r) => (r.id === id ? updated : r)));
      return updated;
    },
    []
  );

  const deleteRecipe = useCallback(async (id: string) => {
    const supabase = createClient();
    const { error } = await supabase.from("recipes").delete().eq("id", id);

    if (error) {
      console.error("Failed to delete recipe:", error);
      return false;
    }

    setRecipes((prev) => prev.filter((r) => r.id !== id));
    return true;
  }, []);

  return { recipes, loading, addRecipe, updateRecipe, deleteRecipe, refetch: fetchRecipes };
}

async function seedUserRecipes(supabase: ReturnType<typeof createClient>) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const rows = seedRecipes.map((r) => ({
    user_id: user.id,
    name: r.name,
    meal_type: r.mealType,
    base_servings: r.baseServings,
    prep_minutes: r.prepMinutes ?? null,
    cook_minutes: r.cookMinutes ?? null,
    tags: r.tags ?? [],
    ingredients: r.ingredients,
  }));

  await supabase.from("recipes").insert(rows);
}
