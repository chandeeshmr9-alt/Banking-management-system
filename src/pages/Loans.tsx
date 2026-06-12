import * as React from "react";
import { Banknote, RefreshCcw, CheckCircle2, ShieldCheck, ShieldAlert, Loader2, AlertTriangle, CircleX } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import ReadOnlyRecordsPage, { type ReadOnlyColumn } from "@/components/read-only/ReadOnlyRecordsPage";
import { getLoans, approveLoan, type Loan } from "@/services/loanService";
import { cn } from "@/lib/utils";

export default function Loans() {
  const [loans, setLoans] = React.useState<Loan[]>([]);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(true);
  const [isApproving, setIsApproving] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [toasts, setToasts] = React.useState<{ id: number; title: string; description: string; tone: "success" | "danger" }[]>([]);

  const pushToast = React.useCallback((toast: { title: string; description: string; tone: "success" | "danger" }) => {
    const id = Date.now();
    setToasts(prev => [...prev, { ...toast, id }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  }, []);

  const loadLoans = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setLoans(await getLoans());
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Failed to load loans");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void loadLoans();
  }, [loadLoans]);

  const handleApprove = async (loanId: string) => {
    setIsApproving(loanId);
    try {
      await approveLoan(loanId);
      pushToast({ title: "Loan Approved", description: `Loan ${loanId} has been successfully disbursed.`, tone: "success" });
      await loadLoans();
    } catch (err) {
      pushToast({ title: "Approval Failed", description: err instanceof Error ? err.message : "Unexpected error", tone: "danger" });
    } finally {
      setIsApproving(null);
    }
  };

  const columns: ReadOnlyColumn<Loan>[] = [
    { key: "loan_id", label: "Loan ID", render: (loan) => <span className="font-bold text-slate-900">#{loan.loan_id}</span> },
    { key: "customer_id", label: "Customer ID", render: (loan) => <Badge variant="outline">C{String(loan.customer_id).padStart(3, '0')}</Badge> },
    {
      key: "amount",
      label: "Amount",
      render: (loan) => (
        <span className="font-mono font-bold text-slate-900">
          {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(loan.amount)}
        </span>
      ),
    },
    { key: "loan_type", label: "Type", render: (loan) => loan.loan_type },
    {
      key: "status",
      label: "Status",
      render: (loan) => {
        const variant = loan.status === "Active" ? "success" : loan.status === "Pending" ? "info" : "outline";
        return <Badge variant={variant as any} className="rounded-full">{loan.status}</Badge>;
      },
    },
    {
      key: "actions",
      label: "Workflow",
      render: (loan) => (
        loan.status === "Pending" ? (
          <Button 
            size="sm" 
            className="h-8 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
            onClick={() => handleApprove(loan.loan_id)}
            disabled={!!isApproving}
          >
            {isApproving === loan.loan_id ? <Loader2 className="h-3 w-3 animate-spin" /> : <ShieldCheck className="h-3 w-3 mr-1" />}
            Approve
          </Button>
        ) : (
          <div className="flex items-center text-slate-400 text-xs">
            <CheckCircle2 className="h-3 w-3 mr-1 text-emerald-500" /> Processed
          </div>
        )
      )
    }
  ];

  const displayedLoans = loans.filter((loan) => {
    const search = searchQuery.trim().toLowerCase();
    if (!search) return true;
    return [loan.loan_id, loan.customer_id, String(loan.amount), loan.loan_type, loan.status].some((value) =>
      value.toLowerCase().includes(search),
    );
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="outline" className="rounded-xl" onClick={() => void loadLoans()} disabled={isLoading}>
          <RefreshCcw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
          Refresh Data
        </Button>
      </div>

      <ReadOnlyRecordsPage
        badge="Credit Operations"
        title="Loan Management"
        description="Verify and approve loan applications using the integrated database procedures."
        icon={Banknote}
        totalRecords={loans.length}
        displayedRecords={displayedLoans}
        searchQuery={searchQuery}
        searchPlaceholder="Filter by ID, Customer, or Status..."
        onSearchChange={setSearchQuery}
        columns={columns}
        isLoading={isLoading}
        error={error}
        onRetry={() => void loadLoans()}
        emptyTitle="No loan records"
        emptyDescription="All loan applications will appear here for verification."
        noResultsTitle="No matches found"
        noResultsDescription="Try adjusting your filters."
        renderRowKey={(loan) => loan.loan_id}
      />

      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
        {toasts.map((toast) => {
          const ToastIcon = toast.tone === "success" ? CheckCircle2 : CircleX;
          return (
            <Card key={toast.id} className={cn("border shadow-lg", toast.tone === 'success' ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200')}>
              <CardContent className="flex items-start gap-3 p-4">
                <ToastIcon className={cn("h-5 w-5 mt-0.5", toast.tone === 'success' ? 'text-emerald-600' : 'text-rose-600')} />
                <div>
                  <p className="text-sm font-bold text-slate-900">{toast.title}</p>
                  <p className="text-xs text-slate-600">{toast.description}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
