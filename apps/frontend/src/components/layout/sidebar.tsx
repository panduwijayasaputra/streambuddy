import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import {
  LayoutDashboard,
  Monitor,
  BarChart3,
  Settings,
  MessageSquare,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

export interface SidebarProps {
  className?: string;
  collapsed?: boolean;
}

const navigationItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Overlay",
    href: "/overlay",
    icon: Monitor,
  },
  {
    title: "Analytics",
    href: "/analytics",
    icon: BarChart3,
  },
  {
    title: "Chat Processing",
    href: "/chat",
    icon: MessageSquare,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

const Sidebar = React.forwardRef<HTMLElement, SidebarProps>(
  ({ className, collapsed = false, ...props }, ref) => {
    const pathname = usePathname();

    return (
      <aside
        ref={ref}
        className={cn(
          "flex h-full w-64 flex-col border-r bg-background",
          collapsed && "w-16",
          className
        )}
        {...props}
      >
        {/* Navigation */}
        <nav className="flex-1 space-y-2 p-4">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start",
                    collapsed && "justify-center px-2"
                  )}
                >
                  <Icon
                    icon={item.icon}
                    className={cn("h-4 w-4", collapsed ? "mr-0" : "mr-2")}
                  />
                  {!collapsed && item.title}
                </Button>
              </Link>
            );
          })}
        </nav>

        {/* Collapse Toggle */}
        <div className="border-t p-4">
          <Button variant="ghost" size="sm" className="w-full justify-start">
            <Icon
              icon={collapsed ? ChevronRight : ChevronDown}
              className="h-4 w-4 mr-2"
            />
            {!collapsed && "Collapse"}
          </Button>
        </div>
      </aside>
    );
  }
);
Sidebar.displayName = "Sidebar";

export { Sidebar };
