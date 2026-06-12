import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { type DatabaseOperationCard as DatabaseOperationCardType } from "@/data/navigation";

type Props = DatabaseOperationCardType;

export function DatabaseOperationCard({
  title,
  description,
  href,
  icon: Icon,
  accentClassName,
  highlights,
}: Props) {
  return (
    <Card className="group overflow-hidden border-border/80 bg-white/95 transition-all duration-300 hover:-translate-y-1 hover:shadow-banking">
      <CardHeader className="gap-4">
        <div className="flex items-center justify-between gap-4">
          <div className={cn("flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg", accentClassName)}>
            <Icon className="h-6 w-6" />
          </div>
          <Badge variant="info">Database Demo</Badge>
        </div>
        <div>
          <CardTitle className="text-xl">{title}</CardTitle>
          <CardDescription className="mt-2 text-sm leading-6">{description}</CardDescription>
        </div>
      </CardHeader>

      <CardContent className="space-y-5 pb-6">
        <div className="flex flex-wrap gap-2">
          {highlights.map((item) => (
            <Badge key={item} variant="secondary" className="rounded-full px-3 py-1">
              {item}
            </Badge>
          ))}
        </div>

        <Button asChild className="w-full justify-between rounded-xl" variant="banking">
          <Link to={href}>
            <span>Open Demo</span>
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
