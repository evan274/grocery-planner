"use client";

import { useMemo, useState } from "react";
import { ConsolidatedItem, StoreCategory, StapleItem } from "@/lib/types";
import { GroceryItem } from "./grocery-item";
import { CopyButton } from "./copy-button";
import { Button } from "@/components/ui/button";
import { formatGroceryListText, formatAmount } from "@/lib/consolidate";
import { ArrowLeft, ChevronDown, ChevronUp, Plus } from "lucide-react";

interface GroceryListProps {
  items: ConsolidatedItem[];
  pantryReminders: ConsolidatedItem[];
  promotedPantryItems: Set<string>;
  onPromotePantryItem: (normalizedName: string) => void;
  staples: StapleItem[];
  checkedItems: Set<string>;
  onToggle: (normalizedName: string) => void;
  onBack: () => void;
}

export function GroceryList({
  items,
  pantryReminders,
  promotedPantryItems,
  onPromotePantryItem,
  staples,
  checkedItems,
  onToggle,
  onBack,
}: GroceryListProps) {
  const [pantryExpanded, setPantryExpanded] = useState(false);

  // Merge promoted pantry items into main list
  const allItems = useMemo(() => {
    const promoted = pantryReminders.filter((p) =>
      promotedPantryItems.has(p.normalizedName)
    );
    return [...items, ...promoted];
  }, [items, pantryReminders, promotedPantryItems]);

  const unpromotedPantry = useMemo(
    () => pantryReminders.filter((p) => !promotedPantryItems.has(p.normalizedName)),
    [pantryReminders, promotedPantryItems]
  );

  const grouped = useMemo(() => {
    const map = new Map<StoreCategory, ConsolidatedItem[]>();
    for (const item of allItems) {
      if (!map.has(item.category)) map.set(item.category, []);
      map.get(item.category)!.push(item);
    }
    return map;
  }, [allItems]);

  const copyText = useMemo(
    () => formatGroceryListText(allItems, checkedItems),
    [allItems, checkedItems]
  );

  const totalCount = allItems.length;
  const checkedCount = allItems.filter((i) =>
    checkedItems.has(i.normalizedName)
  ).length;

  return (
    <div className="pb-24">
      <div className="flex items-center justify-between mb-4 px-4 pt-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-1.5" />
          Back to plan
        </Button>
        <span className="text-sm text-muted-foreground">
          {checkedCount}/{totalCount} items
        </span>
      </div>

      <div className="space-y-6">
        {Array.from(grouped.entries()).map(([category, categoryItems]) => {
          const unchecked = categoryItems.filter(
            (i) => !checkedItems.has(i.normalizedName)
          );
          const checked = categoryItems.filter((i) =>
            checkedItems.has(i.normalizedName)
          );
          const remainingCount = unchecked.length;

          return (
            <div key={category}>
              <div className="sticky top-14 z-10 bg-background px-4 py-2 border-b">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm">{category}</h3>
                  <span className="text-xs text-muted-foreground">
                    {remainingCount} remaining
                  </span>
                </div>
              </div>
              <div className="divide-y">
                {unchecked.map((item) => (
                  <GroceryItem
                    key={item.normalizedName + item.unit}
                    item={item}
                    checked={false}
                    onToggle={() => onToggle(item.normalizedName)}
                  />
                ))}
                {checked.map((item) => (
                  <GroceryItem
                    key={item.normalizedName + item.unit}
                    item={item}
                    checked={true}
                    onToggle={() => onToggle(item.normalizedName)}
                  />
                ))}
              </div>
            </div>
          );
        })}

        {/* Staples Section */}
        {staples.length > 0 && (
          <div>
            <div className="sticky top-14 z-10 bg-background px-4 py-2 border-b">
              <h3 className="font-semibold text-sm text-primary">Staples</h3>
            </div>
            <div className="divide-y">
              {staples.map((staple) => (
                <button
                  key={staple.id}
                  onClick={() => onToggle(`staple-${staple.id}`)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors min-h-[44px] ${
                    checkedItems.has(`staple-${staple.id}`)
                      ? "opacity-40"
                      : "hover:bg-accent active:bg-accent"
                  }`}
                >
                  <div
                    className={`h-5 w-5 rounded border-2 shrink-0 flex items-center justify-center transition-colors ${
                      checkedItems.has(`staple-${staple.id}`)
                        ? "bg-primary border-primary"
                        : "border-muted-foreground/30"
                    }`}
                  >
                    {checkedItems.has(`staple-${staple.id}`) && (
                      <svg className="h-3 w-3 text-primary-foreground" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  <span className={`text-sm flex-1 ${checkedItems.has(`staple-${staple.id}`) ? "line-through" : ""}`}>
                    {staple.name}
                  </span>
                  <span className="text-xs text-muted-foreground">{staple.category}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Pantry Reminders */}
        {unpromotedPantry.length > 0 && (
          <div>
            <button
              onClick={() => setPantryExpanded(!pantryExpanded)}
              className="sticky top-14 z-10 bg-background px-4 py-2 border-b w-full flex items-center justify-between"
            >
              <h3 className="font-semibold text-sm text-muted-foreground">
                Check you have these
              </h3>
              {pantryExpanded ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
            {pantryExpanded && (
              <div className="divide-y">
                {unpromotedPantry.map((item) => (
                  <div
                    key={item.normalizedName + item.unit}
                    className="flex items-center gap-3 px-4 py-3 text-left min-h-[44px]"
                  >
                    <div className="flex-1 min-w-0">
                      <span className="text-sm text-muted-foreground">
                        {item.displayName}
                      </span>
                    </div>
                    {formatAmount(item) && (
                      <span className="text-sm text-muted-foreground/60 shrink-0">
                        {formatAmount(item)}
                      </span>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs shrink-0"
                      onClick={() => onPromotePantryItem(item.normalizedName)}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add to list
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t pb-[calc(1rem+env(safe-area-inset-bottom))]">
        <CopyButton text={copyText} />
      </div>
    </div>
  );
}
