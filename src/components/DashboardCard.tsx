import { Link } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import { ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type DashboardCardProps = {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  accentClassName?: string;
  badgeText?: string;
};

export function DashboardCard({
  title,
  description,
  href,
  icon: Icon,
  accentClassName = "from-primary to-sky-500",
  badgeText = "Open",
}: DashboardCardProps) {
  return (
    <Link to={href} className="group block h-full cursor-pointer" aria-label={title}>
      <Card className="h-full overflow-hidden border-border/80 bg-white/95 transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-banking dark:bg-slate-900">
        <CardHeader className="gap-4">
          <div className="flex items-start justify-between gap-4">
            <div
              className={cn(
                "flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg",
                accentClassName,
              )}
            >
              <Icon className="h-6 w-6" />
            </div>
            <div className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300">
              {badgeText}
            </div>
          </div>

          <div>
            <CardTitle className="text-xl">{title}</CardTitle>
            <CardDescription className="mt-2 text-sm leading-6">{description}</CardDescription>
          </div>
        </CardHeader>

        <CardContent className="pb-6">
          <div className="flex items-center justify-between rounded-xl border border-border bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition-colors group-hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:group-hover:bg-slate-700">
            <span>Navigate</span>
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
