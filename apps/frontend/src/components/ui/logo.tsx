import * as React from "react";
import { cn } from "@/lib/utils";

export interface LogoProps {
  variant?: "default" | "white" | "dark";
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const Logo = React.forwardRef<HTMLDivElement, LogoProps>(
  ({ variant = "default", size = "md", className, ...props }, ref) => {
    const sizeClasses = {
      sm: "text-lg",
      md: "text-xl",
      lg: "text-2xl",
      xl: "text-3xl",
    };

    const variantClasses = {
      default: "text-blue-600",
      white: "text-white",
      dark: "text-gray-900",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "font-bold tracking-tight",
          sizeClasses[size],
          variantClasses[variant],
          className
        )}
        {...props}
      >
        <span className="text-blue-600">Stream</span>
        <span className="text-red-600">Buddy</span>
      </div>
    );
  }
);
Logo.displayName = "Logo";

export { Logo };
