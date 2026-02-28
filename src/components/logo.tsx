import { ShoppingCart } from "lucide-react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showTagline?: boolean;
}

export function Logo({ size = "md", showTagline = false }: LogoProps) {
  const sizes = {
    sm: { text: "text-lg", icon: "h-4 w-4", tagline: "text-xs" },
    md: { text: "text-2xl", icon: "h-5 w-5", tagline: "text-sm" },
    lg: { text: "text-4xl", icon: "h-7 w-7", tagline: "text-base" },
  };

  const s = sizes[size];

  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center gap-1.5">
        <ShoppingCart className={`${s.icon} text-primary`} strokeWidth={2.5} />
        <span className={`${s.text} font-bold text-primary font-serif tracking-tight`}>
          Grocer<span className="text-foreground">Ease</span>
        </span>
      </div>
      {showTagline && (
        <p className={`${s.tagline} font-medium text-muted-foreground tracking-wide mt-1`}>
          Dinner on autopilot
        </p>
      )}
    </div>
  );
}
