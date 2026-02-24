"use client";

import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";

interface ServingControlProps {
  servings: number;
  onChange: (servings: number) => void;
  min?: number;
  max?: number;
}

export function ServingControl({
  servings,
  onChange,
  min = 1,
  max = 12,
}: ServingControlProps) {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        onClick={() => onChange(Math.max(min, servings - 1))}
        disabled={servings <= min}
      >
        <Minus className="h-3 w-3" />
      </Button>
      <span className="w-8 text-center text-sm font-medium">{servings}</span>
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        onClick={() => onChange(Math.min(max, servings + 1))}
        disabled={servings >= max}
      >
        <Plus className="h-3 w-3" />
      </Button>
    </div>
  );
}
