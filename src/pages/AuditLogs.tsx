import * as React from "react";
import { History, Search, Loader2, Database, User, Activity, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type AuditLog = {
  log_id: number;
  user_id: number | null;
  action: string;
  table_name: string;
  record_id: number;
  old_value: string | null;
  new_value: string | null;
  timestamp: string;
};

const BASE_URL = "http://localhost:5002/api/audit";

export default function AuditLogs() {
  const [logs, setLogs] = React.useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");

  const loadLogs = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(BASE_URL);
      const data = await response.json();
      if (data.success) {
        setLogs(data.data);
      }
    } catch (error) {
      console.error("Failed to load audit logs", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const filtered = logs.filter(log => 
    [log.action, log.table_name, String(log.record_id), log.new_value || ""].some(s => 
      s.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <div className="space-y-8 animate-fade-up">
      <section className="overflow-hidden rounded-[2rem] border border-border/80 bg-gradient-to-r from-white via-slate-50 to-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <Badge variant="outline" className="w-fit rounded-full px-4 py-1.5 border-slate-300">System Monitoring</Badge>
            <div className="space-y-2">
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">Audit Trails</h2>
              <p className="max-w-2xl text-base leading-7 text-slate-600">Track all database modifications and user activities across the system.</p>
            </div>
          </div>
        </div>
      </section>

      <Card className="border-border/80 bg-white/95 shadow-sm">
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5 text-slate-400" />
              Activity History
            </CardTitle>
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Filter activities..."
                className="h-10 w-full rounded-xl border border-border bg-slate-50 pl-10 text-sm focus:ring-2 focus:ring-primary/20"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-20 text-center"><Loader2 className="mx-auto animate-spin text-primary" /></div>
          ) : (
            <div className="space-y-4">
              {filtered.map((log) => (
                <div key={log.log_id} className="group relative flex flex-col gap-4 rounded-2xl border border-border p-5 transition-all hover:border-blue-200 hover:bg-blue-50/30">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-xl shadow-sm",
                        log.action === 'INSERT' ? "bg-emerald-100 text-emerald-700" :
                        log.action === 'UPDATE' ? "bg-blue-100 text-blue-700" :
                        "bg-rose-100 text-rose-700"
                      )}>
                        <Activity className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{log.action}</span>
                          <span className="text-slate-400">on</span>
                          <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600 uppercase tracking-wider">{log.table_name}</span>
                        </div>
                        <div className="mt-1 flex items-center gap-4 text-xs text-slate-500">
                          <div className="flex items-center gap-1"><User className="h-3 w-3" /> Admin</div>
                          <div className="flex items-center gap-1"><Database className="h-3 w-3" /> ID: {log.record_id}</div>
                          <div className="flex items-center gap-1"><Clock className="h-3 w-3" /> {new Date(log.timestamp).toLocaleString()}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {log.new_value && (
                    <div className="rounded-xl bg-slate-50 p-3 text-xs font-mono text-slate-600 border border-slate-100">
                      {log.new_value}
                    </div>
                  )}
                </div>
              ))}
              {filtered.length === 0 && (
                <div className="py-10 text-center text-slate-500">No logs found matching your criteria.</div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
