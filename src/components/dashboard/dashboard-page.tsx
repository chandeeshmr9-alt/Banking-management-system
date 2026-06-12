import { ArrowRight, Building2, Landmark } from "lucide-react";
import { Link } from "react-router-dom";
import { moduleCards, databaseOperationCards } from "@/data/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ModuleCard } from "@/components/dashboard/module-card";
import { DatabaseOperationCard } from "@/components/dashboard/database-operation-card";

export function DashboardPage() {
  return (
    <div className="space-y-8 animate-fade-up">
      <section className="overflow-hidden rounded-[2rem] border border-border/80 bg-gradient-to-r from-white via-sky-50 to-white p-6 shadow-sm sm:p-8">
        <div className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr] lg:items-center">
          <div className="space-y-5">
            <Badge variant="info" className="w-fit rounded-full px-4 py-1.5">
              Banking Management System Dashboard
            </Badge>
            <div className="space-y-3">
              <h2 className="max-w-2xl text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                A clean, professional control center for banking operations.
              </h2>
              <p className="max-w-2xl text-base leading-7 text-slate-600">
                Manage core banking modules, explore database operations, and navigate through
                a polished full-stack experience built with React • Flask • MySQL.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild variant="banking" className="rounded-xl">
                <Link to="/customers">
                  <Landmark className="h-4 w-4" />
                  Dashboard Overview
                </Link>
              </Button>
              <Button asChild variant="outline" className="rounded-xl">
                <Link to="/branches">
                  <Building2 className="h-4 w-4" />
                  Branch Network
                </Link>
              </Button>
            </div>
          </div>

          <Card className="border-border/80 bg-white/90 shadow-sm">
            <CardContent className="space-y-4 p-6">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-700">Project Snapshot</p>
                <Badge variant="success">Full Stack</Badge>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { label: "Modules", value: "6" },
                  { label: "Database Demos", value: "2" },
                  { label: "Responsive Layout", value: "Yes" },
                  { label: "Backend", value: "Connected" },
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl border border-border bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{item.label}</p>
                    <p className="mt-2 text-2xl font-bold text-slate-900">{item.value}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h3 className="text-2xl font-bold tracking-tight text-slate-900">Core Modules</h3>
            <p className="mt-1 text-sm text-slate-600">Quick access to the primary banking modules.</p>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {moduleCards.map((card) => (
            <ModuleCard key={card.href} {...card} />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h3 className="text-2xl font-bold tracking-tight text-slate-900">Database Operations</h3>
            <p className="mt-1 text-sm text-slate-600">
              Two highlighted demonstrations for database-driven banking workflows.
            </p>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          {databaseOperationCards.map((card) => (
            <DatabaseOperationCard key={card.href} {...card} />
          ))}
        </div>
      </section>

      <section className="rounded-[2rem] border border-border/80 bg-white/90 p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-900">Ready for future integration</p>
            <p className="mt-1 text-sm text-slate-600">
              The navigation routes are in place, and the UI is connected to the Flask backend and MySQL database.
            </p>
          </div>
          <Button asChild variant="outline" className="rounded-xl">
            <Link to="/accounts">
              <span>Explore Modules</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
