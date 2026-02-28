"use client";

import { useState, useCallback, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { StapleItem, StoreCategory } from "@/lib/types";

export function useStaples() {
  const [staples, setStaples] = useState<StapleItem[]>([]);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("staples")
      .select("*")
      .order("name")
      .then(({ data }) => {
        if (data) {
          setStaples(
            data.map((row) => ({
              id: row.id,
              name: row.name,
              category: row.category as StoreCategory,
              checked: false,
            }))
          );
        }
      });
  }, []);

  const addStaple = useCallback(async (name: string, category: StoreCategory) => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("staples")
      .insert({ user_id: user.id, name: name.trim(), category })
      .select()
      .single();

    if (error) {
      console.error("Failed to add staple:", error);
      return;
    }

    setStaples((prev) => [
      ...prev,
      { id: data.id, name: data.name, category: data.category as StoreCategory, checked: false },
    ]);
  }, []);

  const removeStaple = useCallback(async (id: string) => {
    const supabase = createClient();
    await supabase.from("staples").delete().eq("id", id);
    setStaples((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const editStaple = useCallback(
    async (id: string, name: string, category: StoreCategory) => {
      const supabase = createClient();
      await supabase
        .from("staples")
        .update({ name: name.trim(), category })
        .eq("id", id);

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
