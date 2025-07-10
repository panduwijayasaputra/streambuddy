import * as React from "react";
import {
  Gamepad2,
  Zap,
  Target,
  Car,
  MapPin,
  Ghost,
  Box,
  Sword,
  Shield,
  Crosshair,
  LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const gameIcons: Record<string, LucideIcon> = {
  "Mobile Legends: Bang Bang": Gamepad2,
  "Free Fire": Zap,
  Valorant: Target,
  "GTA V": Car,
  "PUBG Mobile": MapPin,
  "Horror Games": Ghost,
  Minecraft: Box,
  "Genshin Impact": Sword,
  "Ragnarok X: Next Generation": Shield,
  "Call of Duty: Mobile": Crosshair,
};

export interface GameIconProps {
  game: string;
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "default" | "primary" | "secondary" | "accent" | "muted";
  className?: string;
}

const GameIcon = React.forwardRef<SVGSVGElement, GameIconProps>(
  ({ game, size = "md", variant = "default", className, ...props }, ref) => {
    const IconComponent = gameIcons[game] || Gamepad2;

    const sizeClasses = {
      sm: "h-4 w-4",
      md: "h-5 w-5",
      lg: "h-6 w-6",
      xl: "h-8 w-8",
    };

    const variantClasses = {
      default: "text-foreground",
      primary: "text-primary",
      secondary: "text-secondary",
      accent: "text-accent",
      muted: "text-muted-foreground",
    };

    return (
      <IconComponent
        ref={ref}
        className={cn(sizeClasses[size], variantClasses[variant], className)}
        {...props}
      />
    );
  }
);
GameIcon.displayName = "GameIcon";

export { GameIcon, gameIcons };
