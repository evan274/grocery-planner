"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ServingControl } from "./serving-control";
import { Recipe, MealSelection } from "@/lib/types";
import { ArrowLeftRight } from "lucide-react";

interface RecipeCardProps {
  recipe: Recipe;
  selection: MealSelection;
  onUpdateServings: (servings: number) => void;
  onSwap: () => void;
  sharedIngredients?: string[];
}

export function RecipeCard({
  recipe,
  selection,
  onUpdateServings,
  onSwap,
  sharedIngredients = [],
}: RecipeCardProps) {
  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-sm leading-tight">{recipe.name}</h3>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={onSwap}
          >
            <ArrowLeftRight className="h-4 w-4" />
          </Button>
        </div>

        {sharedIngredients.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {sharedIngredients.slice(0, 3).map((ing) => (
              <Badge key={ing} variant="secondary" className="text-xs">
                {ing}
              </Badge>
            ))}
            {sharedIngredients.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{sharedIngredients.length - 3}
              </Badge>
            )}
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            Servings (base: {recipe.baseServings})
          </span>
          <ServingControl
            servings={selection.servings}
            onChange={onUpdateServings}
          />
        </div>
      </CardContent>
    </Card>
  );
}
