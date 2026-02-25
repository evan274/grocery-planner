"use client";

import { useState, useCallback, useEffect } from "react";
import { StapleItem, StoreCategory } from "@/lib/types";

const STORAGE_KEY = "grocery-staples";

function loadStaples(): StapleItem[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return [];
}

export function useStaples() {
  const [staples, setStaples] = useState<StapleItem[]>(() => loadStaples());

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(staples));
  }, [staples]);

  const addStaple = useCallback((name: string, category: StoreCategory) => {
    setStaples((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name: name.trim(),
        category,
        checked: false,
      },
    ]);
  }, []);

  const removeStaple = useCallback((id: string) => {
    setStaples((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const editStaple = useCallback(
    (id: string, name: string, category: StoreCategory) => {
      setStaples((prev) =>
        prev.map((s) =>
          s.id === id ? { ...s, name: name.trim(), category } : s
        )
      );
    },
    []
  );

  const toggleStaple = useCallback((id: string) => {
    setStaples((prev) =>
      prev.map((s) => (s.id === id ? { ...s, checked: !s.checked } : s))
    );
  }, []);

  return { staples, addStaple, removeStaple, editStaple, toggleStaple };
}
