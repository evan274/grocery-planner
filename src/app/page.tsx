"use client";

import { useMealPlan } from "@/hooks/use-meal-plan";
import { MealCountPicker } from "@/components/meal-count-picker";
import { SuggestedPlan } from "@/components/suggested-plan";
import { GroceryList } from "@/components/grocery-list";

export default function Home() {
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
    getSwapCandidates,
    updateServings,
    groceryList,
    checkedItems,
    toggleChecked,
    goToList,
    goToPlan,
  } = useMealPlan();

  if (view === "list") {
    return (
      <main className="max-w-2xl mx-auto">
        <GroceryList
          items={groceryList}
          checkedItems={checkedItems}
          onToggle={toggleChecked}
          onBack={goToPlan}
        />
      </main>
    );
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Grocery Planner</h1>
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
        />
      )}
    </main>
  );
}
