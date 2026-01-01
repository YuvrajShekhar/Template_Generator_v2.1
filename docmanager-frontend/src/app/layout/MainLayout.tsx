import * as React from "react";
import { Outlet } from "react-router-dom";
import { cn } from "@shared/utils/cn";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { TooltipProvider, SkipLink } from "@shared/components/ui";

export function MainLayout() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);

  // Persist sidebar state in localStorage
  React.useEffect(() => {
    const savedState = localStorage.getItem("sidebar-collapsed");
    if (savedState !== null) {
      setIsSidebarCollapsed(JSON.parse(savedState));
    }
  }, []);

  const handleSidebarToggle = () => {
    const newState = !isSidebarCollapsed;
    setIsSidebarCollapsed(newState);
    localStorage.setItem("sidebar-collapsed", JSON.stringify(newState));
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        {/* Skip Link for keyboard accessibility */}
        <SkipLink targetId="main-content" />

        {/* Sidebar */}
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onToggle={handleSidebarToggle}
        />

        {/* Header */}
        <Header isSidebarCollapsed={isSidebarCollapsed} />

        {/* Main Content */}
        <main
          id="main-content"
          role="main"
          aria-label="Main content"
          className={cn(
            "min-h-screen pt-16 transition-all duration-300",
            isSidebarCollapsed ? "pl-16" : "pl-64"
          )}
        >
          <div className="container py-6">
            <Outlet />
          </div>
        </main>
      </div>
    </TooltipProvider>
  );
}
