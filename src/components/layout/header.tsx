import { SidebarMenuButton } from "@/components/layout/sidebar";
import { Bell, Search, UserCircle, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";

export function Header({ title, subtitle }: { title: string; subtitle: string }) {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/70 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/70">
      <div className="flex h-20 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <SidebarMenuButton />
          <div className="hidden sm:block">
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">{title}</h2>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{subtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="relative hidden lg:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search data..." 
              className="h-10 w-64 rounded-xl border-none bg-slate-100 pl-10 text-sm focus:ring-2 focus:ring-blue-500 dark:bg-slate-800"
            />
          </div>

          <Button variant="ghost" size="icon" className="rounded-xl relative">
            <Bell className="h-5 w-5 text-slate-600 dark:text-slate-400" />
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-blue-600 border-2 border-white dark:border-slate-950"></span>
          </Button>

          <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 mx-2"></div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right md:block">
              <p className="text-sm font-bold text-slate-900 dark:text-white">{user?.username || "Guest"}</p>
              <p className="text-[10px] font-bold uppercase tracking-tight text-blue-600">{user?.role || "Visitor"}</p>
            </div>
            <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl border-slate-200 dark:border-slate-800">
              <UserCircle className="h-6 w-6 text-slate-600 dark:text-slate-400" />
            </Button>
            <Button onClick={logout} variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-slate-400 hover:text-red-600">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
