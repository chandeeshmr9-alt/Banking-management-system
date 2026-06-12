import * as React from "react";
import {
  AlertTriangle,
  ArrowRightLeft,
  CheckCircle2,
  Clock3,
  Loader2,
  RefreshCcw,
  ShieldAlert,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  depositFunds,
  withdrawFunds,
  type TriggerResult,
  type TriggerTransaction,
} from "@/services/triggerService";

type FormValues = {
  accountId: string;
  amount: string;
};

type FormErrors = Partial<Record<keyof FormValues, string>>;

type ActionType = "Deposit" | "Withdrawal";

type ToastTone = "success" | "danger" | "info";

type ToastItem = {
  id: number;
  title: string;
  description: string;
  tone: ToastTone;
};

const initialValues: FormValues = {
  accountId: "",
  amount: "",
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);
}

function validate(values: FormValues) {
  const errors: FormErrors = {};

  if (!values.accountId.trim()) {
    errors.accountId = "Account ID is required.";
  } else if (!/^\d+$/.test(values.accountId.trim())) {
    errors.accountId = "Account ID must be numeric.";
  }

  if (!values.amount.trim()) {
    errors.amount = "Amount is required.";
  } else if (Number.isNaN(Number(values.amount)) || Number(values.amount) <= 0) {
    errors.amount = "Enter a valid amount greater than zero.";
  }

  return errors;
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallback;
}

export default function Triggers() {
  const [formValues, setFormValues] = React.useState<FormValues>(initialValues);
  const [errors, setErrors] = React.useState<FormErrors>({});
  const [touched, setTouched] = React.useState<Record<keyof FormValues, boolean>>({
    accountId: false,
    amount: false,
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [result, setResult] = React.useState<TriggerResult | null>(null);
  const [activeAction, setActiveAction] = React.useState<ActionType | null>(null);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);
  const toastTimers = React.useRef<number[]>([]);

  const pushToast = React.useCallback((toast: Omit<ToastItem, "id">) => {
    const id = window.setTimeout(() => {
      setToasts((current) => current.filter((item) => item.id !== id));
    }, 3000);

    toastTimers.current.push(id);
    setToasts((current) => [...current, { ...toast, id }]);
  }, []);

  React.useEffect(() => {
    return () => {
      toastTimers.current.forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  const handleFieldChange = React.useCallback((field: keyof FormValues, value: string) => {
    const nextValue = field === "amount" ? value.replace(/[^\d.]/g, "") : value.replace(/\D/g, "");
    setFormValues((current) => ({ ...current, [field]: nextValue }));
    setTouched((current) => ({ ...current, [field]: true }));
  }, []);

  const handleReset = React.useCallback(() => {
    setFormValues(initialValues);
    setErrors({});
    setTouched({ accountId: false, amount: false });
    setSubmitError(null);
    setResult(null);
    setActiveAction(null);
  }, []);

  const executeAction = React.useCallback(
    async (action: ActionType) => {
      const nextErrors = validate(formValues);
      setErrors(nextErrors);
      setTouched({ accountId: true, amount: true });
      setActiveAction(action);

      if (Object.keys(nextErrors).length > 0 || isSubmitting) {
        return;
      }

      setIsSubmitting(true);
      setSubmitError(null);

      try {
        const payload = {
          account_id: formValues.accountId.trim(),
          amount: Number(formValues.amount).toFixed(2),
        };

        const response = action === "Deposit" ? await depositFunds(payload) : await withdrawFunds(payload);

        setResult(response.data);
        pushToast({
          title: response.message,
          description: `Account ${response.data.account_id} moved from ${formatCurrency(response.data.old_balance)} to ${formatCurrency(response.data.new_balance)}.`,
          tone: "success",
        });
      } catch (error) {
        const message = getErrorMessage(error, action === "Deposit" ? "Failed to deposit funds" : "Failed to withdraw funds");
        setSubmitError(message);
        pushToast({
          title: action === "Deposit" ? "Deposit Failed" : "Withdrawal Failed",
          description: message,
          tone: "danger",
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    [formValues, isSubmitting, pushToast],
  );

  return (
    <div className="space-y-8 animate-fade-up">
      <section className="overflow-hidden rounded-[2rem] border border-border/80 bg-gradient-to-r from-white via-emerald-50 to-white p-6 shadow-sm sm:p-8 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <Badge variant="info" className="w-fit rounded-full px-4 py-1.5">
              Transaction Demo
            </Badge>
            <div className="space-y-2">
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                Trigger Demonstration
              </h2>
              <p className="max-w-2xl text-base leading-7 text-slate-600">
                Insert a deposit or withdrawal record into <span className="font-semibold text-slate-900">Transactions</span>. The database
                trigger updates the <span className="font-semibold text-slate-900">Account</span> balance automatically.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
            <p className="font-semibold">Backend</p>
            <p className="mt-1 font-mono text-xs tracking-[0.12em] text-emerald-800 dark:text-slate-300">POST /api/triggers/deposit</p>
            <p className="mt-1 font-mono text-xs tracking-[0.12em] text-emerald-800 dark:text-slate-300">POST /api/triggers/withdraw</p>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <Card className="border-border/80 bg-white/95 shadow-sm dark:bg-slate-900/95">
          <CardHeader>
            <Badge variant="success" className="w-fit rounded-full px-3 py-1">
              Account Action
            </Badge>
            <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
              <ArrowRightLeft className="h-5 w-5 text-primary dark:text-sky-300" />
              Trigger Action Form
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-300">Choose deposit or withdraw to create a transaction record and invoke the trigger.</CardDescription>
          </CardHeader>

          <CardContent>
            <div className="space-y-5">
              <Field label="Account ID" error={touched.accountId ? errors.accountId : undefined}>
                <input
                  type="text"
                  value={formValues.accountId}
                  onChange={(event) => handleFieldChange("accountId", event.target.value)}
                  placeholder="1"
                  className={inputClass(touched.accountId ? errors.accountId : undefined)}
                />
              </Field>

              <Field label="Amount" error={touched.amount ? errors.amount : undefined}>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formValues.amount}
                  onChange={(event) => handleFieldChange("amount", event.target.value)}
                  placeholder="5000.00"
                  className={inputClass(touched.amount ? errors.amount : undefined)}
                />
              </Field>

              {submitError ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900 dark:border-rose-900 dark:bg-rose-950/60 dark:text-rose-200">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                    <p>{submitError}</p>
                  </div>
                </div>
              ) : null}

              <div className="grid gap-3 sm:grid-cols-2">
                <Button
                  type="button"
                  variant="banking"
                  className="rounded-xl"
                  disabled={isSubmitting}
                  onClick={() => void executeAction("Deposit")}
                >
                  {isSubmitting && activeAction === "Deposit" ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                  Deposit
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl"
                  disabled={isSubmitting}
                  onClick={() => void executeAction("Withdrawal")}
                >
                  {isSubmitting && activeAction === "Withdrawal" ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldAlert className="h-4 w-4" />}
                  Withdraw
                </Button>
              </div>

              <Button type="button" variant="ghost" className="w-full rounded-xl" onClick={handleReset} disabled={isSubmitting}>
                <RefreshCcw className="h-4 w-4" />
                Reset
              </Button>

              <div className="rounded-2xl border border-sky-100 bg-sky-50/80 px-4 py-3 text-sm text-sky-900 dark:border-sky-900 dark:bg-slate-800 dark:text-slate-100">
                <div className="flex items-start gap-3">
                  <Wallet className="mt-0.5 h-4 w-4 shrink-0 text-sky-700 dark:text-sky-300" />
                  <p>
                    A deposit inserts a <span className="font-semibold">Deposit</span> record, and a withdrawal inserts a
                    <span className="font-semibold"> Withdrawal</span> record. The trigger then updates the account balance automatically.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-border/80 bg-white/95 shadow-sm dark:bg-slate-900/95">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-300" />
                Result
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-300">Old balance, new balance, and transaction details from the API response.</CardDescription>
            </CardHeader>
            <CardContent>
              {result ? (
                <div className="space-y-5">
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-200">
                    <p className="font-semibold">Success</p>
                    <p className="mt-1 text-sm leading-6">{`The ${result.transaction_type.toLowerCase()} completed successfully through the trigger demo.`}</p>
                  </div>

                  <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sky-900 dark:border-sky-900 dark:bg-slate-800 dark:text-slate-100">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700 dark:text-sky-300">Transaction Status</p>
                    <p className="mt-1 text-lg font-bold">{result.transaction_status}</p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <MetricCard label="Old Balance" value={formatCurrency(result.old_balance)} tone="rose" />
                    <MetricCard label="New Balance" value={formatCurrency(result.new_balance)} tone="emerald" />
                  </div>

                  {result.transaction ? (
                    <TransactionCard transaction={result.transaction} />
                  ) : null}
                </div>
              ) : (
                <div className="rounded-[1.5rem] border border-dashed border-slate-200 bg-slate-50 p-8 text-center dark:border-slate-700 dark:bg-slate-900">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-primary shadow-sm dark:bg-slate-800 dark:text-sky-300">
                    <ArrowRightLeft className="h-7 w-7" />
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-slate-100">No trigger executed yet</h3>
                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600 dark:text-slate-300">
                    Submit a deposit or withdrawal to see the old balance, new balance, and transaction row returned by the backend.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/80 bg-white/95 shadow-sm dark:bg-slate-900/95">
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-slate-100">Trigger Notes</CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-300">How the demonstration maps to the SQL trigger behavior.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
              <NoteItem index="01" title="Insert transaction" description="The backend inserts a row into Transactions for Deposit or Withdrawal." />
              <NoteItem index="02" title="Trigger updates balance" description="The AFTER INSERT trigger updates the Account balance automatically." />
              <NoteItem index="03" title="Minimum balance protection" description="A withdrawal below the minimum balance returns the trigger error message from MySQL." />
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="fixed bottom-6 right-6 z-50 flex w-[min(92vw,24rem)] flex-col gap-3">
        {toasts.map((toast) => {
          const toastStyles =
            toast.tone === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-900 shadow-emerald-100"
              : toast.tone === "danger"
                ? "border-rose-200 bg-rose-50 text-rose-900 shadow-rose-100"
                : "border-sky-200 bg-sky-50 text-sky-900 shadow-sky-100";

          return (
            <Card key={toast.id} className={`border ${toastStyles}`}>
              <CardContent className="flex items-start gap-3 p-4">
                <div className="mt-0.5 rounded-full bg-white/80 p-2 shadow-sm">
                  {toast.tone === "success" ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{toast.title}</p>
                  <p className="mt-1 text-sm leading-6 opacity-80">{toast.description}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("space-y-2", error && "text-rose-600")}>
      <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">{label}</label>
      {children}
      {error ? <p className="text-xs font-medium text-rose-600 dark:text-rose-300">{error}</p> : null}
    </div>
  );
}

function inputClass(error?: string) {
  return cn(
    "h-11 w-full rounded-xl border bg-slate-50 px-4 text-sm text-slate-900 outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20",
    error ? "border-rose-300 bg-rose-50 focus:border-rose-400 focus:ring-rose-200" : "border-border",
  );
}

function MetricCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "rose" | "emerald";
}) {
  const toneClass = tone === "rose" ? "from-rose-500 to-pink-500" : "from-emerald-500 to-teal-500";

  return (
    <div className="rounded-[1.5rem] border border-border bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-300">{label}</p>
      <div className={cn("mt-3 h-1.5 w-20 rounded-full bg-gradient-to-r", toneClass)} />
      <p className="mt-4 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">{value}</p>
    </div>
  );
}

function TransactionCard({ transaction }: { transaction: TriggerTransaction }) {
  return (
    <div className="space-y-3 rounded-[1.5rem] border border-border bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-center gap-2">
        <Clock3 className="h-4 w-4 text-slate-500 dark:text-slate-300" />
        <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-300">Transaction Details</h3>
      </div>

      <div className="rounded-2xl border border-border bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900">
        <p className="font-semibold text-slate-900 dark:text-slate-100">{transaction.transaction_type}</p>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Transaction ID {transaction.transaction_id}</p>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Account {transaction.account_id}</p>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Amount {formatCurrency(transaction.amount)}</p>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{transaction.transaction_date}</p>
      </div>
    </div>
  );
}

function NoteItem({ index, title, description }: { index: string; title: string; description: string }) {
  return (
    <div className="flex gap-3 rounded-2xl border border-border bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-xs font-extrabold tracking-[0.18em] text-primary shadow-sm dark:bg-slate-900 dark:text-sky-300">
        {index}
      </div>
      <div>
        <p className="font-semibold text-slate-900 dark:text-slate-100">{title}</p>
        <p className="mt-1 text-slate-600 dark:text-slate-300">{description}</p>
      </div>
    </div>
  );
}
