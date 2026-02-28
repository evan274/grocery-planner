"use client";

import { useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { RecipeForm } from "@/components/recipe-form";
import { useRecipes } from "@/hooks/use-recipes";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Recipe } from "@/lib/types";

export default function NewRecipePage() {
  const router = useRouter();
  const { addRecipe } = useRecipes();

  async function handleSubmit(data: Omit<Recipe, "id">) {
    const result = await addRecipe(data);
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
          <h2 className="text-lg font-semibold">Add Recipe</h2>
        </div>

        <RecipeForm onSubmit={handleSubmit} submitLabel="Add Recipe" />
      </div>
    </AppShell>
  );
}
