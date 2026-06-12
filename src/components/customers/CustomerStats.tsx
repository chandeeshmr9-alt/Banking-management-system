import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Banknote, Clock3, Users } from "lucide-react";

type CustomerStatsProps = {
  totalCustomers: number;
  activeRecords: number;
  recentlyAdded: number;
  isLoading: boolean;
};

const stats = [
  {
    label: "Total Customers",
    icon: Users,
    accent: "from-sky-500 to-cyan-500",
  },
  {
    label: "Active Records",
    icon: Banknote,
    accent: "from-emerald-500 to-teal-500",
  },
  {
    label: "Recently Added",
    icon: Clock3,
    accent: "from-amber-500 to-orange-500",
  },
] as const;

export default function CustomerStats({
  totalCustomers,
  activeRecords,
  recentlyAdded,
  isLoading,
}: CustomerStatsProps) {
  const values = [totalCustomers, activeRecords, recentlyAdded];

  if (isLoading) {
    return (
      <div className="grid gap-5 md:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-border/80 bg-white/95 shadow-sm dark:bg-slate-900/95">
            <CardContent className="space-y-4 p-6">
              <div className="h-11 w-11 animate-pulse rounded-2xl bg-slate-100" />
              <div className="space-y-2">
                <div className="h-3 w-28 animate-pulse rounded-full bg-slate-100" />
                <div className="h-8 w-20 animate-pulse rounded-full bg-slate-200" />
              </div>
              <div className="h-10 animate-pulse rounded-2xl bg-slate-100" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-5 md:grid-cols-3">
      {stats.map((stat, index) => {
        const StatIcon = stat.icon;

        return (
          <Card key={stat.label} className="border-border/80 bg-white/95 shadow-sm transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg dark:bg-slate-900/95">
            <CardContent className="space-y-4 p-6">
              <div className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${stat.accent} text-white shadow-banking`}>
                <StatIcon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-300">{stat.label}</p>
                <div className="mt-2 flex items-end gap-2">
                  <p className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">{values[index]}</p>
                  <Badge variant="outline" className="mb-1 rounded-full border-slate-200 bg-white text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
                    Live
                  </Badge>
                </div>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div className={`h-full w-3/4 rounded-full bg-gradient-to-r ${stat.accent}`} />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
