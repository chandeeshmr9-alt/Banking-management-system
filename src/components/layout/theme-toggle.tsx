import * as React from "react";
import { MoonStar, SunMedium } from "lucide-react";
import { Button } from "@/components/ui/button";
import { applyTheme, getStoredTheme, type ThemeMode } from "@/lib/theme";

export function ThemeToggle() {
  const [theme, setTheme] = React.useState<ThemeMode>(() => getStoredTheme());

  React.useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const isDark = theme === "dark";

  return (
    <Button
      type="button"
      variant="outline"
      className="rounded-xl border-border bg-background px-3 text-sm font-semibold text-slate-700 shadow-sm hover:text-slate-900 dark:text-slate-100 dark:hover:text-white"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      {isDark ? <SunMedium className="h-4 w-4" /> : <MoonStar className="h-4 w-4" />}
      <span className="hidden sm:inline">{isDark ? "Light" : "Dark"} Mode</span>
      <span className="sm:hidden">{isDark ? "Light" : "Dark"}</span>
    </Button>
  );
}
