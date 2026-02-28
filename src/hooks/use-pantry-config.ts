"use client";

import { useState, useCallback, useEffect } from "react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

const DEFAULT_PANTRY = [
  "salt",
  "black pepper",
  "olive oil",
  "red pepper flakes",
  "cooking spray",
  "water",
];

export function usePantryConfig() {
  const [pantryItems, setPantryItems] = useState<Set<string>>(new Set(DEFAULT_PANTRY));
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoaded(true);
      return;
    }

    const supabase = createClient();
    supabase
      .from("pantry_config")
      .select("item_name")
      .then(({ data }) => {
        if (data && data.length > 0) {
          setPantryItems(new Set(data.map((row) => row.item_name)));
        }
        // If no rows, user hasn't customized yet — seed defaults
        if (data && data.length === 0) {
          seedDefaults(supabase);
        }
        setLoaded(true);
      });
  }, []);

  const addItem = useCallback(async (name: string) => {
    const normalized = name.toLowerCase().trim();
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from("pantry_config")
      .upsert({ user_id: user.id, item_name: normalized }, { onConflict: "user_id,item_name" });

    setPantryItems((prev) => new Set([...prev, normalized]));
  }, []);

  const removeItem = useCallback(async (name: string) => {
    const normalized = name.toLowerCase().trim();
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from("pantry_config")
      .delete()
      .eq("user_id", user.id)
      .eq("item_name", normalized);

    setPantryItems((prev) => {
      const next = new Set(prev);
      next.delete(normalized);
      return next;
    });
  }, []);

  const isOnHand = useCallback(
    (normalizedName: string) => pantryItems.has(normalizedName),
    [pantryItems]
  );

  return { pantryItems, addItem, removeItem, isOnHand, loaded };
}

async function seedDefaults(supabase: ReturnType<typeof createClient>) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const rows = DEFAULT_PANTRY.map((item) => ({
    user_id: user.id,
    item_name: item,
  }));

  await supabase.from("pantry_config").insert(rows);
}
