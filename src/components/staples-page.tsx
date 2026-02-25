"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { StapleItem, StoreCategory } from "@/lib/types";
import { Plus, Trash2 } from "lucide-react";

const categories: StoreCategory[] = [
  "Produce",
  "Meat & Seafood",
  "Dairy & Eggs",
  "Bakery & Bread",
  "Pasta & Grains",
  "Canned & Jarred",
  "Oils & Vinegars",
  "Spices & Seasonings",
  "Sauces & Condiments",
  "Frozen",
  "Other",
];

interface StaplesPageProps {
  staples: StapleItem[];
  onAdd: (name: string, category: StoreCategory) => void;
  onRemove: (id: string) => void;
  onEdit: (id: string, name: string, category: StoreCategory) => void;
}

export function StaplesPage({ staples, onAdd, onRemove }: StaplesPageProps) {
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState<StoreCategory>("Produce");

  const handleAdd = () => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    onAdd(trimmed, newCategory);
    setNewName("");
  };

  // Group staples by category
  const grouped = new Map<StoreCategory, StapleItem[]>();
  for (const staple of staples) {
    if (!grouped.has(staple.category)) grouped.set(staple.category, []);
    grouped.get(staple.category)!.push(staple);
  }

  return (
    <div className="px-4 py-6 space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Staples</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Items you buy every week. These get added to your grocery list automatically.
        </p>
      </div>

      {/* Add new staple */}
      <div className="flex gap-2">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder="Add a staple item..."
          className="flex-1 h-10 rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <select
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value as StoreCategory)}
          className="h-10 rounded-lg border bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        <Button onClick={handleAdd} size="icon" className="h-10 w-10 shrink-0">
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Staples list */}
      {staples.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">
          No staples yet. Add items you buy every week.
        </p>
      ) : (
        <div className="space-y-4">
          {Array.from(grouped.entries()).map(([category, items]) => (
            <div key={category}>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                {category}
              </h3>
              <div className="space-y-1">
                {items.map((staple) => (
                  <div
                    key={staple.id}
                    className="flex items-center justify-between rounded-lg border px-3 py-2"
                  >
                    <span className="text-sm">{staple.name}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => onRemove(staple.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
