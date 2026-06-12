import * as React from "react";
import {
  AlertTriangle,
  ArrowRightLeft,
  CheckCircle2,
  Clock3,
  Loader2,
  RefreshCcw,
  Send,
  Wallet,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { transferFunds, type TransferFundsResult } from "@/services/procedureService";

type FormValues = {
  fromAccountId: string;
  toAccountId: string;
  amount: string;
};

type FormErrors = Partial<Record<keyof FormValues, string>>;

type ToastTone = "success" | "danger" | "info";

type ToastItem = {
  id: number;
  title: string;
  description: string;
  tone: ToastTone;
};

const initialValues: FormValues = {
  fromAccountId: "",
  toAccountId: "",
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

  if (!values.fromAccountId.trim()) {
    errors.fromAccountId = "From Account ID is required.";
  } else if (!/^\d+$/.test(values.fromAccountId.trim())) {
    errors.fromAccountId = "From Account ID must be numeric.";
  }

  if (!values.toAccountId.trim()) {
    errors.toAccountId = "To Account ID is required.";
  } else if (!/^\d+$/.test(values.toAccountId.trim())) {
    errors.toAccountId = "To Account ID must be numeric.";
  }

  if (values.fromAccountId.trim() && values.toAccountId.trim() && values.fromAccountId.trim() === values.toAccountId.trim()) {
    errors.toAccountId = "Source and destination accounts must be different.";
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

export default function Procedures() {
  const [formValues, setFormValues] = React.useState<FormValues>(initialValues);
  const [errors, setErrors] = React.useState<FormErrors>({});
  const [touched, setTouched] = React.useState<Record<keyof FormValues, boolean>>({
    fromAccountId: false,
    toAccountId: false,
    amount: false,
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [result, setResult] = React.useState<TransferFundsResult | null>(null);
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
    const cleanedValue = field === "amount" ? value.replace(/[^\d.]/g, "") : value.replace(/\D/g, "");
    setFormValues((current) => ({ ...current, [field]: cleanedValue }));
    setTouched((current) => ({ ...current, [field]: true }));
  }, []);

  const handleReset = React.useCallback(() => {
    setFormValues(initialValues);
    setErrors({});
    setTouched({ fromAccountId: false, toAccountId: false, amount: false });
    setSubmitError(null);
    setResult(null);
  }, []);

  const handleSubmit = React.useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      const nextErrors = validate(formValues);
      setErrors(nextErrors);
      setTouched({ fromAccountId: true, toAccountId: true, amount: true });

      if (Object.keys(nextErrors).length > 0 || isSubmitting) {
        return;
      }

      setIsSubmitting(true);
      setSubmitError(null);

      try {
        const transferResult = await transferFunds({
          from_account_id: formValues.fromAccountId.trim(),
          to_account_id: formValues.toAccountId.trim(),
          amount: Number(formValues.amount).toFixed(2),
        });

        setResult(transferResult);
        pushToast({
          title: "Transfer Completed",
          description: `Transferred ${formatCurrency(transferResult.transfer_amount)} successfully.`,
          tone: "success",
        });
      } catch (error) {
        const message = getErrorMessage(error, "Failed to transfer funds");
        setSubmitError(message);
        pushToast({
          title: "Transfer Failed",
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
      <section className="overflow-hidden rounded-[2rem] border border-border/80 bg-gradient-to-r from-white via-amber-50 to-white p-6 shadow-sm sm:p-8 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <Badge variant="info" className="w-fit rounded-full px-4 py-1.5">
              Stored Procedure Demo
            </Badge>
            <div className="space-y-2">
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                Stored Procedure Demonstration
              </h2>
              <p className="max-w-2xl text-base leading-7 text-slate-600">
                Execute the <span className="font-semibold text-slate-900">TransferFunds</span> procedure through the Flask API and inspect the
                updated balances plus transaction rows returned from MySQL.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
            <p className="font-semibold">Execute</p>
            <p className="mt-1 font-mono text-xs tracking-[0.12em] text-amber-800 dark:text-slate-300">CALL TransferFunds(from_account_id, to_account_id, amount);</p>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <Card className="border-border/80 bg-white/95 shadow-sm dark:bg-slate-900/95">
          <CardHeader>
            <Badge variant="success" className="w-fit rounded-full px-3 py-1">
              Transfer Funds
            </Badge>
            <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
              <ArrowRightLeft className="h-5 w-5 text-primary dark:text-sky-300" />
              Fund Transfer Form
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-300">Move money between two accounts using the backend procedure endpoint.</CardDescription>
          </CardHeader>

          <CardContent>
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="From Account ID" error={touched.fromAccountId ? errors.fromAccountId : undefined}>
                  <input
                    type="text"
                    value={formValues.fromAccountId}
                    onChange={(event) => handleFieldChange("fromAccountId", event.target.value)}
                    placeholder="1"
                    className={inputClass(touched.fromAccountId ? errors.fromAccountId : undefined)}
                  />
                </Field>

                <Field label="To Account ID" error={touched.toAccountId ? errors.toAccountId : undefined}>
                  <input
                    type="text"
                    value={formValues.toAccountId}
                    onChange={(event) => handleFieldChange("toAccountId", event.target.value)}
                    placeholder="2"
                    className={inputClass(touched.toAccountId ? errors.toAccountId : undefined)}
                  />
                </Field>

                <Field label="Amount" error={touched.amount ? errors.amount : undefined}>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formValues.amount}
                    onChange={(event) => handleFieldChange("amount", event.target.value)}
                    placeholder="10000.00"
                    className={inputClass(touched.amount ? errors.amount : undefined)}
                  />
                </Field>
              </div>

              {submitError ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900 dark:border-rose-900 dark:bg-rose-950/60 dark:text-rose-200">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                    <p>{submitError}</p>
                  </div>
                </div>
              ) : null}

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button type="submit" variant="banking" className="rounded-xl sm:flex-1" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Transfer Funds
                </Button>
                <Button type="button" variant="outline" className="rounded-xl sm:w-36" onClick={handleReset} disabled={isSubmitting}>
                  <RefreshCcw className="h-4 w-4" />
                  Reset
                </Button>
              </div>

              <div className="rounded-2xl border border-sky-100 bg-sky-50/80 px-4 py-3 text-sm text-sky-900 dark:border-sky-900 dark:bg-slate-800 dark:text-slate-100">
                <div className="flex items-start gap-3">
                  <Wallet className="mt-0.5 h-4 w-4 shrink-0 text-sky-700 dark:text-sky-300" />
                  <p>
                    The backend will execute <span className="font-semibold">TransferFunds</span>, then return the updated balances and the
                    transfer transaction details for both accounts.
                  </p>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-border/80 bg-white/95 shadow-sm dark:bg-slate-900/95">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-300" />
                Transfer Result
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-300">Success message, balances, and transactions returned by the API.</CardDescription>
            </CardHeader>
            <CardContent>
              {result ? (
                <div className="space-y-5">
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-200">
                    <p className="font-semibold">Success</p>
                    <p className="mt-1 text-sm leading-6">
                      {`Transferred ${formatCurrency(result.transfer_amount)} successfully through CALL TransferFunds.`}
                    </p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <BalanceDeltaCard
                      title="Sender Account"
                      beforeAccount={result.sender_before}
                      afterAccount={result.sender_after}
                      accent="rose"
                    />
                    <BalanceDeltaCard
                      title="Receiver Account"
                      beforeAccount={result.receiver_before}
                      afterAccount={result.receiver_after}
                      accent="emerald"
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Clock3 className="h-4 w-4 text-slate-500 dark:text-slate-300" />
                      <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-300">Transaction Details</h3>
                    </div>

                    <div className="space-y-3">
                      {result.transactions.map((transaction) => (
                        <div key={transaction.transaction_id} className="rounded-2xl border border-border bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800">
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <p className="font-semibold text-slate-900 dark:text-slate-100">
                                {transaction.transaction_type} - Account {transaction.account_id}
                              </p>
                              <p className="text-sm text-slate-500 dark:text-slate-300">Transaction ID {transaction.transaction_id}</p>
                            </div>
                            <Badge variant={transaction.transaction_type === "Deposit" ? "success" : "outline"} className="w-fit rounded-full px-3 py-1">
                              {formatCurrency(transaction.amount)}
                            </Badge>
                          </div>
                          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{transaction.transaction_date}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-[1.5rem] border border-dashed border-slate-200 bg-slate-50 p-8 text-center dark:border-slate-700 dark:bg-slate-900">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-primary shadow-sm dark:bg-slate-800 dark:text-sky-300">
                    <ArrowRightLeft className="h-7 w-7" />
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-slate-100">No transfer executed yet</h3>
                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600 dark:text-slate-300">
                    Submit the form to see the success message, updated balances, and transaction rows returned by the stored procedure.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/80 bg-white/95 shadow-sm">
            <CardHeader>
              <CardTitle className="text-slate-900">Demo Notes</CardTitle>
              <CardDescription>What the backend does when the form is submitted.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-6 text-slate-600">
              <NoteItem index="01" title="Validates input" description="Requires two different numeric account IDs and a positive amount." />
              <NoteItem index="02" title="Calls the procedure" description="Executes CALL TransferFunds(from_account_id, to_account_id, amount) on the Flask backend." />
              <NoteItem index="03" title="Returns live results" description="Reads back the updated balances and the most recent transfer transactions for display." />
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="fixed bottom-6 right-6 z-50 flex w-[min(92vw,24rem)] flex-col gap-3">
        {toasts.map((toast) => {
          const toastStyles =
            toast.tone === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-900 shadow-emerald-100 dark:border-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-200"
              : toast.tone === "danger"
                ? "border-rose-200 bg-rose-50 text-rose-900 shadow-rose-100 dark:border-rose-900 dark:bg-rose-950/60 dark:text-rose-200"
                : "border-sky-200 bg-sky-50 text-sky-900 shadow-sky-100 dark:border-sky-900 dark:bg-slate-800 dark:text-sky-200";

          const ToastIcon = toast.tone === "success" ? CheckCircle2 : AlertTriangle;

          return (
            <Card key={toast.id} className={`border ${toastStyles}`}>
              <CardContent className="flex items-start gap-3 p-4">
                <div className="mt-0.5 rounded-full bg-white/80 p-2 shadow-sm dark:bg-slate-900">
                  <ToastIcon className="h-4 w-4 text-slate-700 dark:text-slate-100" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{toast.title}</p>
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

function BalanceDeltaCard({
  title,
  beforeAccount,
  afterAccount,
  accent,
}: {
  title: string;
  beforeAccount: TransferFundsResult["sender_before"];
  afterAccount: TransferFundsResult["sender_after"];
  accent: "rose" | "emerald";
}) {
  const accentStyles = accent === "rose" ? "from-rose-500 to-pink-500" : "from-emerald-500 to-teal-500";

  return (
    <div className="rounded-[1.5rem] border border-border bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-300">{title}</p>
          <p className="mt-1 text-lg font-bold text-slate-900 dark:text-slate-100">Account {afterAccount.account_id}</p>
        </div>
        <div className={cn("rounded-2xl bg-gradient-to-br px-3 py-2 text-white shadow-sm", accentStyles)}>
          <Wallet className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-300">
        <p>Customer ID: {afterAccount.customer_id}</p>
        <p>Branch ID: {afterAccount.branch_id}</p>
        <p>Type: {afterAccount.account_type}</p>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-900">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-300">Before</p>
          <p className="mt-1 text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">{formatCurrency(beforeAccount.balance)}</p>
        </div>
        <div className="rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-900">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-300">After</p>
          <p className="mt-1 text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">{formatCurrency(afterAccount.balance)}</p>
        </div>
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
