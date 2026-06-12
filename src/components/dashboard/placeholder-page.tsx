import type { LucideIcon } from "lucide-react";
import { ArrowLeft, Landmark } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type PlaceholderPageProps = {
  title: string;
  description: string;
  icon?: LucideIcon;
};

export function PlaceholderPage({ title, description, icon: Icon = Landmark }: PlaceholderPageProps) {
  return (
    <section className="flex min-h-[calc(100vh-220px)] items-center justify-center">
      <Card className="w-full max-w-2xl border-border/80 bg-white/95 shadow-banking">
        <CardContent className="space-y-6 p-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-sky-500 text-white shadow-banking">
            <Icon className="h-7 w-7" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h2>
            <p className="mx-auto max-w-xl text-sm leading-6 text-slate-600">{description}</p>
          </div>

          <div className="grid gap-3 rounded-2xl border border-border bg-slate-50 p-4 text-left text-sm text-slate-600 sm:grid-cols-2">
            <div className="rounded-xl bg-white p-4 shadow-sm">
              Frontend route placeholder
            </div>
            <div className="rounded-xl bg-white p-4 shadow-sm">
              No backend integration yet
            </div>
          </div>

          <Button asChild variant="banking" className="rounded-xl">
            <Link to="/" className="inline-flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
        </CardContent>
      </Card>
    </section>
  );
}
