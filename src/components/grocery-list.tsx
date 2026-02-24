"use client";

import { useMemo } from "react";
import { ConsolidatedItem, StoreCategory } from "@/lib/types";
import { GroceryItem } from "./grocery-item";
import { CopyButton } from "./copy-button";
import { Button } from "@/components/ui/button";
import { formatGroceryListText } from "@/lib/consolidate";
import { ArrowLeft } from "lucide-react";

interface GroceryListProps {
  items: ConsolidatedItem[];
  checkedItems: Set<string>;
  onToggle: (normalizedName: string) => void;
  onBack: () => void;
}

export function GroceryList({
  items,
  checkedItems,
  onToggle,
  onBack,
}: GroceryListProps) {
  const grouped = useMemo(() => {
    const map = new Map<StoreCategory, ConsolidatedItem[]>();
    for (const item of items) {
      if (!map.has(item.category)) map.set(item.category, []);
      map.get(item.category)!.push(item);
    }
    return map;
  }, [items]);

  const copyText = useMemo(
    () => formatGroceryListText(items, checkedItems),
    [items, checkedItems]
  );

  const totalCount = items.length;
  const checkedCount = items.filter((i) =>
    checkedItems.has(i.normalizedName)
  ).length;

  return (
    <div className="pb-24">
      <div className="flex items-center justify-between mb-4">
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
              <div className="sticky top-0 z-10 bg-background px-4 py-2 border-b">
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
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t pb-[calc(1rem+env(safe-area-inset-bottom))]">
        <CopyButton text={copyText} />
      </div>
    </div>
  );
}
