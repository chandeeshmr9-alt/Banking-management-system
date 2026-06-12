import { NavLink, useLocation } from "react-router-dom";
import { Menu, Building2, LayoutDashboard, Users, CreditCard, Landmark, Repeat, Briefcase, Settings, ShieldAlert, FileText, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { motion } from "framer-motion";

const navigationItems = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/customers", label: "Customers", icon: Users },
  { path: "/accounts", label: "Accounts", icon: CreditCard },
  { path: "/cards", label: "Cards", icon: CreditCard },
  { path: "/transactions", label: "Transactions", icon: Repeat },
  { path: "/loans", label: "Loans", icon: Landmark },
  { path: "/branches", label: "Branches", icon: Building2 },
  { path: "/employees", label: "Employees", icon: Briefcase },
  { path: "/audit-logs", label: "Audit Logs", icon: ShieldAlert },
  { path: "/procedures", label: "Procedures", icon: FileText },
  { path: "/triggers", label: "Triggers", icon: Zap },
];

function SidebarContent() {
  const location = useLocation();

  return (
    <div className="flex h-full flex-col p-4">
      <div className="flex items-center gap-3 px-2 py-8">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-lg shadow-blue-200">
          <Landmark className="h-6 w-6" />
        </div>
        <div className="flex flex-col">
          <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white uppercase">Banking Management System</span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600">Enterprise DBMS</span>
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        {navigationItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "group relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-300",
                  isActive
                    ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                )
              }
            >
              <item.icon className={cn("h-5 w-5 transition-transform group-hover:scale-110", active ? "text-white" : "text-slate-400")} />
              <span>{item.label}</span>
              {active && (
                <motion.div
                  layoutId="active-pill"
                  className="absolute inset-0 z-[-1] rounded-xl bg-blue-600"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="mt-auto pt-6">
        <div className="rounded-2xl bg-slate-900 p-4 text-white dark:bg-blue-900/40">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
              <span className="text-xs font-bold">AD</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold">Admin Portal</span>
              <span className="text-[10px] text-slate-400">DBMS Controller</span>
            </div>
          </div>
          <Button variant="ghost" className="mt-3 w-full justify-start gap-2 px-2 text-xs text-slate-300 hover:bg-white/10 hover:text-white">
            <Settings className="h-3 w-3" />
            System Settings
          </Button>
        </div>
      </div>
    </div>
  );
}

export function DesktopSidebar() {
  return (
    <aside className="sticky top-0 hidden h-screen w-72 shrink-0 border-r border-slate-100 bg-white/50 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/50 md:block">
      <SidebarContent />
    </aside>
  );
}

export function SidebarMenuButton() {
  return (
    <div className="md:hidden">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="rounded-xl">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-80 p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>
    </div>
  );
}
