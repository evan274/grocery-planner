"use client";

import { useState, useCallback } from "react";

export type Section = "planner" | "recipes" | "staples";

export function useNavigation() {
  const [section, setSection] = useState<Section>("planner");

  const navigateTo = useCallback((s: Section) => {
    setSection(s);
  }, []);

  return { section, navigateTo };
}
