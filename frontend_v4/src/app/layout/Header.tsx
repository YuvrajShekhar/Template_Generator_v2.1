import * as React from "react";
import { useLocation } from "react-router-dom";
import { cn } from "@shared/utils/cn";
import { Bell, Moon, Sun, User } from "lucide-react";
import { Button } from "@shared/components/ui";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@shared/components/ui/Tooltip";
import { Separator } from "@shared/components/ui/Separator";

// Page title mapping
const pageTitles: Record<string, { title: string; description?: string }> = {
  "/generator": {
    title: "Document Generator",
    description: "Select a template and generate documents",
  },
  "/validator": {
    title: "Document Validator",
    description: "Validate your document templates",
  },
};

interface HeaderProps {
  isSidebarCollapsed: boolean;
}

export function Header({ isSidebarCollapsed }: HeaderProps) {
  const location = useLocation();
  const [isDarkMode, setIsDarkMode] = React.useState(false);

  // Get page info based on current route
  const getPageInfo = () => {
    // Check for exact match first
    if (pageTitles[location.pathname]) {
      return pageTitles[location.pathname];
    }
    
    // Check for partial match (for nested routes)
    for (const [path, info] of Object.entries(pageTitles)) {
      if (location.pathname.startsWith(path)) {
        return info;
      }
    }
    
    return { title: "DocManager", description: undefined };
  };

  const pageInfo = getPageInfo();

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <header
      className={cn(
        "fixed top-0 right-0 z-30 h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all duration-300",
        isSidebarCollapsed ? "left-16" : "left-64"
      )}
    >
      <div className="flex h-full items-center justify-between px-6">
        {/* Left side - Page title */}
        <div className="flex flex-col gap-0.5">
          <h1 className="text-lg font-semibold">{pageInfo.title}</h1>
          {pageInfo.description && (
            <p className="text-sm text-muted-foreground">
              {pageInfo.description}
            </p>
          )}
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-2">
          {/* Dark mode toggle */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={toggleDarkMode}>
                {isDarkMode ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {isDarkMode ? "Light mode" : "Dark mode"}
            </TooltipContent>
          </Tooltip>

          {/* Notifications */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Notifications</TooltipContent>
          </Tooltip>

          <Separator orientation="vertical" className="h-6" />

          {/* User menu */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Profile</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </header>
  );
}
