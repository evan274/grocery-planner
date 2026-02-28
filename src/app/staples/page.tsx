"use client";

import { useStaples } from "@/hooks/use-staples";
import { AppShell } from "@/components/app-shell";
import { StaplesPage as StaplesContent } from "@/components/staples-page";

export default function StaplesPage() {
  const { staples, addStaple, removeStaple, editStaple } = useStaples();

  return (
    <AppShell>
      <StaplesContent
        staples={staples}
        onAdd={addStaple}
        onRemove={removeStaple}
        onEdit={editStaple}
      />
    </AppShell>
  );
}
