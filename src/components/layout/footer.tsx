export function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-100 bg-white/50 py-8 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            © 2026 Banking Management System. Built for demonstration.
          </p>
          <div className="flex items-center gap-6">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Production Grade</span>
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Full Stack</span>
            <span className="text-xs font-bold uppercase tracking-widest text-blue-600">v1.2.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
