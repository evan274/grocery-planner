"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { RecipeForm } from "@/components/recipe-form";
import { useRecipes } from "@/hooks/use-recipes";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Recipe } from "@/lib/types";

export default function EditRecipePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { recipes, loading, updateRecipe } = useRecipes();
  const [recipe, setRecipe] = useState<Recipe | null>(null);

  useEffect(() => {
    if (!loading) {
      const found = recipes.find((r) => r.id === id);
      setRecipe(found ?? null);
    }
  }, [recipes, loading, id]);

  async function handleSubmit(data: Omit<Recipe, "id">) {
    const result = await updateRecipe(id, data);
    if (result) {
      router.push("/recipes");
    }
  }

  return (
    <AppShell>
      <div className="px-4 py-6 space-y-4">
        <div className="flex items-center gap-3">
          <Link href="/recipes">
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h2 className="text-lg font-semibold">Edit Recipe</h2>
        </div>

        {loading ? (
          <div className="py-12 text-center text-muted-foreground">
            Loading...
          </div>
        ) : recipe ? (
          <RecipeForm
            initialData={recipe}
            onSubmit={handleSubmit}
            submitLabel="Save Changes"
          />
        ) : (
          <div className="py-12 text-center text-muted-foreground">
            Recipe not found.
          </div>
        )}
      </div>
    </AppShell>
  );
}
