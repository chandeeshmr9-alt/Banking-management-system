import { Link, useLocation } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { routeMeta } from "@/data/routes";

export function Breadcrumbs() {
  const location = useLocation();
  const current = routeMeta[location.pathname as keyof typeof routeMeta];

  const items =
    location.pathname === "/"
      ? [{ label: "Dashboard", href: "/" }]
      : [
          { label: "Dashboard", href: "/" },
          { label: current?.breadcrumb ?? "Page", href: location.pathname },
        ];

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-slate-500">
      {items.map((item, index) => (
        <div key={item.href} className="flex items-center gap-2">
          {index > 0 ? <ChevronRight className="h-3.5 w-3.5" /> : null}
          {index === items.length - 1 ? (
            <span className="font-medium text-slate-700">{item.label}</span>
          ) : (
            <Link className="transition-colors hover:text-slate-900" to={item.href}>
              {item.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}
