import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { Icon } from "@/components/ui/icon";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Menu, User, Settings, Bell } from "lucide-react";

export interface HeaderProps {
  className?: string;
}

const Header = React.forwardRef<HTMLElement, HeaderProps>(
  ({ className, ...props }, ref) => {
    return (
      <header
        ref={ref}
        className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
        {...props}
      >
        <div className="container flex h-16 items-center justify-between">
          {/* Logo and Navigation */}
          <div className="flex items-center space-x-6">
            <Link href="/" className="flex items-center space-x-2">
              <Logo size="md" />
            </Link>

            <nav className="hidden md:flex items-center space-x-6">
              <Link
                href="/dashboard"
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                Dashboard
              </Link>
              <Link
                href="/overlay"
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                Overlay
              </Link>
              <Link
                href="/analytics"
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                Analytics
              </Link>
              <Link
                href="/settings"
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                Settings
              </Link>
            </nav>
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            <ThemeToggle className="hidden md:flex" />

            <Button variant="ghost" size="sm" className="hidden md:flex">
              <Icon icon={Bell} className="h-4 w-4" />
            </Button>

            <Button variant="ghost" size="sm" className="hidden md:flex">
              <Icon icon={Settings} className="h-4 w-4" />
            </Button>

            <Button variant="ghost" size="sm">
              <Icon icon={User} className="h-4 w-4" />
            </Button>

            <Button variant="ghost" size="sm" className="md:hidden">
              <Icon icon={Menu} className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>
    );
  }
);
Header.displayName = "Header";

export { Header };
