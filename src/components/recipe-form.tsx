"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Ingredient, Recipe } from "@/lib/types";
import { Plus, Trash2, Link as LinkIcon, Loader2, Camera } from "lucide-react";

const MEAL_TYPES = ["dinner", "lunch"] as const;
const TAG_OPTIONS = ["easy", "fast", "vegetarian", "italian", "asian", "mexican", "mediterranean", "american", "indian"];
const UNIT_OPTIONS = [
  "", "tsp", "tbsp", "cup", "oz", "lb", "g", "kg", "ml",
  "whole", "clove", "cloves", "can", "jar", "package", "bunch",
  "pint", "quart", "head", "large", "medium", "small", "bag",
  "link", "links", "fillet", "servings",
];

interface RecipeFormProps {
  initialData?: Recipe;
  onSubmit: (data: Omit<Recipe, "id">) => Promise<void>;
  submitLabel: string;
}

function emptyIngredient(): Ingredient {
  return { amount: "", unit: "", name: "", component: "", notes: "", numericAmount: null };
}

export function RecipeForm({ initialData, onSubmit, submitLabel }: RecipeFormProps) {
  const [name, setName] = useState(initialData?.name ?? "");
  const [mealType, setMealType] = useState<"dinner" | "lunch">(initialData?.mealType ?? "dinner");
  const [baseServings, setBaseServings] = useState(initialData?.baseServings ?? 4);
  const [prepMinutes, setPrepMinutes] = useState<number | "">(initialData?.prepMinutes ?? "");
  const [cookMinutes, setCookMinutes] = useState<number | "">(initialData?.cookMinutes ?? "");
  const [tags, setTags] = useState<string[]>(initialData?.tags ?? []);
  const [ingredients, setIngredients] = useState<Ingredient[]>(
    initialData?.ingredients?.length ? initialData.ingredients : [emptyIngredient()]
  );

  const [imported, setImported] = useState(!!initialData);
  const [importUrl, setImportUrl] = useState("");
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function toggleTag(tag: string) {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  function updateIngredient(index: number, field: keyof Ingredient, value: string | number | null) {
    setIngredients((prev) =>
      prev.map((ing, i) => (i === index ? { ...ing, [field]: value } : ing))
    );
  }

  function removeIngredient(index: number) {
    setIngredients((prev) => prev.filter((_, i) => i !== index));
  }

  function addIngredient() {
    setIngredients((prev) => [...prev, emptyIngredient()]);
  }

  function applyImportData(data: {
    name?: string;
    ingredients?: Ingredient[];
    prepMinutes?: number | null;
    cookMinutes?: number | null;
    baseServings?: number;
    tags?: string[];
  }) {
    if (data.name) setName(data.name);
    if (data.prepMinutes != null) setPrepMinutes(data.prepMinutes);
    if (data.cookMinutes != null) setCookMinutes(data.cookMinutes);
    if (data.baseServings) setBaseServings(data.baseServings);
    if (data.tags?.length) setTags(data.tags);
    if (data.ingredients?.length) {
      setIngredients(
        data.ingredients.map((ing: Ingredient) => ({
          ...ing,
          numericAmount: ing.numericAmount ?? (parseFloat(ing.amount) || null),
        }))
      );
    }
    setImported(true);
  }

  async function handleUrlImport() {
    if (!importUrl.trim()) return;
    setImporting(true);
    setImportError("");

    try {
      const res = await fetch("/api/recipes/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: importUrl.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setImportError(data.error || "Import failed");
        return;
      }

      applyImportData(data);
    } catch {
      setImportError("Failed to connect. Check the URL and try again.");
    } finally {
      setImporting(false);
    }
  }

  async function handlePhotoImport(file: File) {
    setImporting(true);
    setImportError("");

    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch("/api/recipes/ocr", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setImportError(data.error || "OCR failed");
        return;
      }

      applyImportData(data);
    } catch {
      setImportError("Failed to process image. Try again.");
    } finally {
      setImporting(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handlePhotoImport(file);
    // Reset so the same file can be re-selected
    e.target.value = "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || ingredients.filter((i) => i.name.trim()).length === 0) return;

    setSubmitting(true);

    // Parse numericAmount for each ingredient
    const parsedIngredients = ingredients
      .filter((i) => i.name.trim())
      .map((i) => ({
        ...i,
        numericAmount: i.numericAmount ?? (parseFloat(i.amount) || null),
      }));

    await onSubmit({
      name: name.trim(),
      mealType,
      baseServings,
      prepMinutes: prepMinutes || undefined,
      cookMinutes: cookMinutes || undefined,
      tags,
      ingredients: parsedIngredients,
    });

    setSubmitting(false);
  }

  // Phase 1: Import UI (shown when not yet imported and not in edit mode)
  if (!imported) {
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="p-4 space-y-3">
            <label className="block text-sm font-medium">Import from URL</label>
            <div className="flex gap-2">
              <input
                type="url"
                value={importUrl}
                onChange={(e) => { setImportUrl(e.target.value); setImportError(""); }}
                placeholder="Paste a recipe URL..."
                className="flex-1 h-10 rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleUrlImport(); } }}
              />
              <Button type="button" variant="outline" onClick={handleUrlImport} disabled={importing}>
                {importing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <LinkIcon className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Works with NYT Cooking, AllRecipes, Bon Appetit, Serious Eats, and most recipe sites.
            </p>
          </CardContent>
        </Card>

        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground uppercase tracking-wide">or</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <Card>
          <CardContent className="p-4 space-y-3">
            <label className="block text-sm font-medium">Upload a photo</label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              className="w-full h-20 border-dashed"
              onClick={() => fileInputRef.current?.click()}
              disabled={importing}
            >
              {importing ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span className="text-sm">Reading recipe...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  <span className="text-sm">Take a photo or choose an image</span>
                </div>
              )}
            </Button>
            <p className="text-xs text-muted-foreground">
              Snap a photo of a recipe&apos;s ingredient list. OCR will extract what it can — you can edit after.
            </p>
          </CardContent>
        </Card>

        {importError && (
          <p className="text-sm text-destructive text-center">{importError}</p>
        )}
      </div>
    );
  }

  // Phase 2: Full form (shown after import or in edit mode)
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info */}
      <div className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1.5">
            Recipe Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full h-10 rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="mealType" className="block text-sm font-medium mb-1.5">
              Meal Type
            </label>
            <select
              id="mealType"
              value={mealType}
              onChange={(e) => setMealType(e.target.value as "dinner" | "lunch")}
              className="w-full h-10 rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {MEAL_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="servings" className="block text-sm font-medium mb-1.5">
              Base Servings
            </label>
            <input
              id="servings"
              type="number"
              min={1}
              value={baseServings}
              onChange={(e) => setBaseServings(parseInt(e.target.value) || 4)}
              className="w-full h-10 rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="prepTime" className="block text-sm font-medium mb-1.5">
              Prep (min)
            </label>
            <input
              id="prepTime"
              type="number"
              min={0}
              value={prepMinutes}
              onChange={(e) => setPrepMinutes(e.target.value ? parseInt(e.target.value) : "")}
              className="w-full h-10 rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label htmlFor="cookTime" className="block text-sm font-medium mb-1.5">
              Cook (min)
            </label>
            <input
              id="cookTime"
              type="number"
              min={0}
              value={cookMinutes}
              onChange={(e) => setCookMinutes(e.target.value ? parseInt(e.target.value) : "")}
              className="w-full h-10 rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium mb-2">Tags</label>
        <div className="flex flex-wrap gap-2">
          {TAG_OPTIONS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              className="focus:outline-none"
            >
              <Badge
                variant={tags.includes(tag) ? "default" : "outline"}
                className="cursor-pointer capitalize"
              >
                {tag}
              </Badge>
            </button>
          ))}
        </div>
      </div>

      {/* Ingredients */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Ingredients</label>
          <Button type="button" variant="outline" size="sm" onClick={addIngredient}>
            <Plus className="h-3.5 w-3.5 mr-1" />
            Add
          </Button>
        </div>

        <div className="space-y-2">
          {ingredients.map((ing, idx) => (
            <div key={idx} className="flex gap-2 items-start">
              <input
                type="text"
                value={ing.amount}
                onChange={(e) => updateIngredient(idx, "amount", e.target.value)}
                placeholder="Amt"
                className="w-16 h-9 rounded-lg border bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <select
                value={ing.unit}
                onChange={(e) => updateIngredient(idx, "unit", e.target.value)}
                className="w-20 h-9 rounded-lg border bg-background px-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {UNIT_OPTIONS.map((u) => (
                  <option key={u} value={u}>
                    {u || "—"}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={ing.name}
                onChange={(e) => updateIngredient(idx, "name", e.target.value)}
                placeholder="Ingredient name"
                className="flex-1 h-9 rounded-lg border bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <input
                type="text"
                value={ing.notes}
                onChange={(e) => updateIngredient(idx, "notes", e.target.value)}
                placeholder="Notes"
                className="w-24 h-9 rounded-lg border bg-background px-2 text-sm hidden sm:block"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-9 w-9 shrink-0 text-muted-foreground hover:text-destructive"
                onClick={() => removeIngredient(idx)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting ? "Saving..." : submitLabel}
      </Button>
    </form>
  );
}
