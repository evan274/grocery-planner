"use client";

import { useState, useCallback, useEffect } from "react";

const STORAGE_KEY = "grocery-pantry-config";

const DEFAULT_PANTRY = [
  "salt",
  "black pepper",
  "olive oil",
  "red pepper flakes",
  "cooking spray",
  "water",
];

function loadPantry(): Set<string> {
  if (typeof window === "undefined") return new Set(DEFAULT_PANTRY);
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return new Set(JSON.parse(stored));
  } catch {}
  return new Set(DEFAULT_PANTRY);
}

export function usePantryConfig() {
  const [pantryItems, setPantryItems] = useState<Set<string>>(() => loadPantry());

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...pantryItems]));
  }, [pantryItems]);

  const addItem = useCallback((name: string) => {
    setPantryItems((prev) => new Set([...prev, name.toLowerCase().trim()]));
  }, []);

  const removeItem = useCallback((name: string) => {
    setPantryItems((prev) => {
      const next = new Set(prev);
      next.delete(name.toLowerCase().trim());
      return next;
    });
  }, []);

  const isOnHand = useCallback(
    (normalizedName: string) => pantryItems.has(normalizedName),
    [pantryItems]
  );

  return { pantryItems, addItem, removeItem, isOnHand };
}
