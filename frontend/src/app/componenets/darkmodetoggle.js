"use client";

import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button"; // shadcn/ui Button component
import { MoonIcon, SunIcon } from "lucide-react";

export function DarkModeToggle() {
  const { theme, setTheme } = useTheme();

  // Avoid rendering until the theme value is hydrated
  if (!theme) return null;

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      aria-label="Toggle Dark Mode"
    >
      {theme === "dark" ? (
        <SunIcon className="h-4 w-4" />
      ) : (
        <MoonIcon className="h-4 w-4" />
      )}
    </Button>
  );
}
