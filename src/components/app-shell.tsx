"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, UtensilsCrossed, BookOpen, ShoppingBasket, LogOut } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Logo } from "@/components/logo";

interface NavItem {
  href: string;
  label: string;
  icon: typeof Menu;
}

const navItems: NavItem[] = [
  { href: "/", label: "Meal Planner", icon: UtensilsCrossed },
  { href: "/recipes", label: "Recipes", icon: BookOpen },
  { href: "/staples", label: "Staples", icon: ShoppingBasket },
];

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-2xl mx-auto flex items-center justify-between h-14 px-4">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 mr-3"
              onClick={() => setOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <Link href="/">
              <Logo size="sm" />
            </Link>
          </div>

          {/* Inline nav for wider screens */}
          <nav className="hidden sm:flex items-center gap-1">
            {navItems.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive(href)
                    ? "text-primary bg-primary/8"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-72 p-0 flex flex-col">
          <SheetHeader className="p-6 pb-4">
            <SheetTitle>
              <Logo size="sm" />
            </SheetTitle>
          </SheetHeader>
          <nav className="px-3 space-y-1 flex-1">
            {navItems.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive(href)
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-accent"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </nav>
          {user && (
            <div className="border-t p-4 space-y-3">
              <p className="text-xs text-muted-foreground truncate">
                {user.email}
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-muted-foreground"
                onClick={async () => {
                  await signOut();
                  setOpen(false);
                }}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign out
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <main className="max-w-2xl mx-auto">{children}</main>
    </div>
  );
}
