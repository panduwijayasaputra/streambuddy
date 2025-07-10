import * as React from "react";
import { cn } from "@/lib/utils";
import { Header } from "./header";
import { Sidebar } from "./sidebar";
import { ThemeProvider } from "@/components/ui/theme-provider";

export interface MainLayoutProps {
  children: React.ReactNode;
  className?: string;
  showSidebar?: boolean;
}

const MainLayout = React.forwardRef<HTMLDivElement, MainLayoutProps>(
  ({ children, className, showSidebar = true, ...props }, ref) => {
    return (
      <ThemeProvider>
        <div ref={ref} className="flex h-screen flex-col" {...props}>
          {/* Header */}
          <Header />

          {/* Main Content */}
          <div className="flex flex-1 overflow-hidden">
            {/* Sidebar */}
            {showSidebar && <Sidebar className="hidden lg:flex" />}

            {/* Content Area */}
            <main className="flex-1 overflow-auto">
              <div className={cn("container mx-auto p-6", className)}>
                {children}
              </div>
            </main>
          </div>
        </div>
      </ThemeProvider>
    );
  }
);
MainLayout.displayName = "MainLayout";

export { MainLayout };
