"use client";

import { useMealPlan } from "@/hooks/use-meal-plan";
import { useNavigation } from "@/hooks/use-navigation";
import { useStaples } from "@/hooks/use-staples";
import { AppShell } from "@/components/app-shell";
import { MealCountPicker } from "@/components/meal-count-picker";
import { SuggestedPlan } from "@/components/suggested-plan";
import { GroceryList } from "@/components/grocery-list";
import { RecipesPage } from "@/components/recipes-page";
import { StaplesPage } from "@/components/staples-page";

export default function Home() {
  const { section, navigateTo } = useNavigation();
  const { staples, addStaple, removeStaple, editStaple } = useStaples();

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
  } = useMealPlan();

  return (
    <AppShell currentSection={section} onNavigate={navigateTo}>
      {section === "recipes" && <RecipesPage />}

      {section === "staples" && (
        <StaplesPage
          staples={staples}
          onAdd={addStaple}
          onRemove={removeStaple}
          onEdit={editStaple}
        />
      )}

      {section === "planner" && (
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
