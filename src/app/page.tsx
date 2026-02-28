"use client";

import { useMealPlan } from "@/hooks/use-meal-plan";
import { useRecipes } from "@/hooks/use-recipes";
import { useStaples } from "@/hooks/use-staples";
import { AppShell } from "@/components/app-shell";
import { MealCountPicker } from "@/components/meal-count-picker";
import { SuggestedPlan } from "@/components/suggested-plan";
import { GroceryList } from "@/components/grocery-list";

export default function PlannerPage() {
  const { recipes, loading: recipesLoading } = useRecipes();
  const { staples } = useStaples();

  const {
    view,
    mealCount,
    setMealCount,
    peopleCount,
    updateAllServings,
    selections,
    selectedRecipes,
    hasGenerated,
    generatePlan,
    shuffle,
    swapRecipe,
    acceptWasteSwap,
    undoWasteSwap,
    canUndo,
    getSwapCandidates,
    updateServings,
    groceryList,
    pantryReminders,
    promotedPantryItems,
    promotePantryItem,
    checkedItems,
    toggleChecked,
    goToList,
    goToPlan,
  } = useMealPlan(recipes);

  return (
    <AppShell>
      {recipesLoading ? (
        <div className="px-4 py-12 text-center text-muted-foreground">
          Loading recipes...
        </div>
      ) : (
        <>
          {view === "list" ? (
            <GroceryList
              items={groceryList}
              pantryReminders={pantryReminders}
              promotedPantryItems={promotedPantryItems}
              onPromotePantryItem={promotePantryItem}
              staples={staples}
              checkedItems={checkedItems}
              onToggle={toggleChecked}
              onBack={goToPlan}
            />
          ) : (
            <div className="px-4 py-6 space-y-6">
              <div>
                <h2 className="text-lg font-semibold">Plan Your Week</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Plan meals, minimize waste, shop smarter.
                </p>
              </div>

              <MealCountPicker
                mealCount={mealCount}
                setMealCount={setMealCount}
                peopleCount={peopleCount}
                updateAllServings={updateAllServings}
                onGenerate={generatePlan}
                hasGenerated={hasGenerated}
              />

              {hasGenerated && selectedRecipes.length > 0 && (
                <SuggestedPlan
                  selectedRecipes={selectedRecipes}
                  selections={selections}
                  allRecipes={recipes}
                  onShuffle={shuffle}
                  onSwap={swapRecipe}
                  onUpdateServings={updateServings}
                  getSwapCandidates={getSwapCandidates}
                  onGenerateList={goToList}
                  onAcceptWasteSwap={acceptWasteSwap}
                  onUndo={undoWasteSwap}
                  canUndo={canUndo}
                />
              )}
            </div>
          )}
        </>
      )}
    </AppShell>
  );
}
