"use client";

import { ConsolidatedItem } from "@/lib/types";
import { formatAmount } from "@/lib/consolidate";
import { cn } from "@/lib/utils";

interface GroceryItemProps {
  item: ConsolidatedItem;
  checked: boolean;
  onToggle: () => void;
}

export function GroceryItem({ item, checked, onToggle }: GroceryItemProps) {
  const amount = formatAmount(item);

  return (
    <button
      onClick={onToggle}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 text-left transition-colors min-h-[44px]",
        checked
          ? "opacity-40"
          : "hover:bg-accent active:bg-accent"
      )}
    >
      <div
        className={cn(
          "h-5 w-5 rounded border-2 shrink-0 flex items-center justify-center transition-colors",
          checked
            ? "bg-primary border-primary"
            : "border-muted-foreground/30"
        )}
      >
        {checked && (
          <svg className="h-3 w-3 text-primary-foreground" viewBox="0 0 12 12" fill="none">
            <path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <span className={cn("text-sm", checked && "line-through")}>
          {item.displayName}
        </span>
      </div>
      {amount && (
        <span className={cn("text-sm text-muted-foreground shrink-0", checked && "line-through")}>
          {amount}
        </span>
      )}
    </button>
  );
}
