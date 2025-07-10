import * as React from "react";
import { LucideIcon, LucideProps } from "lucide-react";
import { cn } from "@/lib/utils";

export interface IconProps extends Omit<LucideProps, "ref"> {
  icon: LucideIcon;
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "default" | "primary" | "secondary" | "accent" | "muted";
}

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

const Icon = React.forwardRef<SVGSVGElement, IconProps>(
  (
    {
      icon: IconComponent,
      className,
      size = "md",
      variant = "default",
      ...props
    },
    ref
  ) => {
    return (
      <IconComponent
        ref={ref}
        className={cn(sizeClasses[size], variantClasses[variant], className)}
        {...props}
      />
    );
  }
);
Icon.displayName = "Icon";

export { Icon };
