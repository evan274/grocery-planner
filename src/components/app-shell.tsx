"use client";

import { ReactNode } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, UtensilsCrossed, BookOpen, ShoppingBasket } from "lucide-react";
import { useState } from "react";
import { Section } from "@/hooks/use-navigation";

interface AppShellProps {
  children: ReactNode;
  currentSection: Section;
  onNavigate: (section: Section) => void;
}

const navItems: { section: Section; label: string; icon: typeof Menu }[] = [
  { section: "planner", label: "Grocery Planner", icon: UtensilsCrossed },
  { section: "recipes", label: "Recipes", icon: BookOpen },
  { section: "staples", label: "Staples", icon: ShoppingBasket },
];

export function AppShell({ children, currentSection, onNavigate }: AppShellProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-2xl mx-auto flex items-center h-14 px-4">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 mr-3"
            onClick={() => setOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-bold text-primary">Grocery Planner</h1>
        </div>
      </header>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-72 p-0">
          <SheetHeader className="p-6 pb-4">
            <SheetTitle className="text-primary">Menu</SheetTitle>
          </SheetHeader>
          <nav className="px-3 space-y-1">
            {navItems.map(({ section, label, icon: Icon }) => (
              <button
                key={section}
                onClick={() => {
                  onNavigate(section);
                  setOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  currentSection === section
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-accent"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </nav>
        </SheetContent>
      </Sheet>

      <main className="max-w-2xl mx-auto">{children}</main>
    </div>
  );
}
