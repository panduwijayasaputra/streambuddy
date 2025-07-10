"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { useTheme } from "./theme-provider";
import { Moon, Sun, Monitor } from "lucide-react";

export interface ThemeToggleProps {
  className?: string;
}

const ThemeToggle = React.forwardRef<HTMLButtonElement, ThemeToggleProps>(
  ({ className, ...props }, ref) => {
    const { theme, setTheme } = useTheme();

    const toggleTheme = () => {
      if (theme === "light") {
        setTheme("dark");
      } else if (theme === "dark") {
        setTheme("system");
      } else {
        setTheme("light");
      }
    };

    const getThemeIcon = () => {
      switch (theme) {
        case "light":
          return Sun;
        case "dark":
          return Moon;
        default:
          return Monitor;
      }
    };

    return (
      <Button
        ref={ref}
        variant="ghost"
        size="sm"
        onClick={toggleTheme}
        className={className}
        {...props}
      >
        <Icon icon={getThemeIcon()} className="h-4 w-4" />
      </Button>
    );
  }
);
ThemeToggle.displayName = "ThemeToggle";

export { ThemeToggle };
