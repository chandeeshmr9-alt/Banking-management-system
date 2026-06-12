import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { type ModuleCard as ModuleCardType } from "@/data/navigation";

type Props = ModuleCardType;

export function ModuleCard({ title, description, href, icon: Icon, accentClassName }: Props) {
  return (
    <Card className="group overflow-hidden border-border/80 bg-white/95 transition-all duration-300 hover:-translate-y-1 hover:shadow-banking">
      <CardHeader className="gap-4">
        <div className="flex items-start justify-between gap-4">
          <div className={cn("flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg", accentClassName)}>
            <Icon className="h-6 w-6" />
          </div>
          <div className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            Active Module
          </div>
        </div>
        <div>
          <CardTitle className="text-xl">{title}</CardTitle>
          <CardDescription className="mt-2 text-sm leading-6">{description}</CardDescription>
        </div>
      </CardHeader>

      <CardContent className="pb-6">
        <Button asChild variant="outline" className="w-full justify-between rounded-xl">
          <Link to={href}>
            <span>Open Module</span>
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
