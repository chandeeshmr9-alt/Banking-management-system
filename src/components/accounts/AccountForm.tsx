import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { CheckCircle2, Landmark, RotateCcw, Save, Wallet } from "lucide-react";
import type { AccountFormErrors, AccountFormValues, AccountType } from "./account-types";

type AccountFormProps = {
  values: AccountFormValues;
  errors: AccountFormErrors;
  touched: Record<keyof AccountFormValues, boolean>;
  isEditing: boolean;
  isLoading: boolean;
  isSubmitting?: boolean;
  onFieldChange: (field: keyof AccountFormValues, value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onClear: () => void;
};

const accountTypes: AccountType[] = ["Savings", "Current", "Salary", "Fixed Deposit"];

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">{children}</label>;
}

function InputShell({
  error,
  children,
}: {
  error?: string;
  children: React.ReactNode;
}) {
  return <div className={cn("space-y-2", error && "text-rose-600")}>{children}</div>;
}

export default function AccountForm({
  values,
  errors,
  touched,
  isEditing,
  isLoading,
  isSubmitting = false,
  onFieldChange,
  onSubmit,
  onClear,
}: AccountFormProps) {
  if (isLoading) {
    return (
      <Card className="border-border/80 bg-white/95 shadow-sm dark:bg-slate-900/95">
        <CardHeader className="space-y-3">
          <div className="h-5 w-36 animate-pulse rounded-full bg-slate-200 dark:bg-slate-700" />
          <div className="h-4 w-56 animate-pulse rounded-full bg-slate-100 dark:bg-slate-800" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="h-20 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />
            <div className="h-20 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />
            <div className="h-20 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />
            <div className="h-20 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800 sm:col-span-2" />
          </div>
          <div className="flex gap-3">
            <div className="h-11 flex-1 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
            <div className="h-11 w-28 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/80 bg-white/95 shadow-sm dark:bg-slate-900/95">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-2">
            <Badge variant={isEditing ? "success" : "info"} className="w-fit rounded-full px-3 py-1">
              {isEditing ? "Edit Account" : "Add Account"}
            </Badge>
            <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
              <Wallet className="h-5 w-5 text-primary dark:text-sky-300" />
              Account Form
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-300">Maintain account records directly through the Flask API.</CardDescription>
          </div>
          <div className="hidden rounded-2xl border border-sky-200 bg-white px-4 py-3 text-right shadow-sm sm:block dark:border-slate-700 dark:bg-slate-800">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-300">Mode</p>
            <p className="mt-1 text-sm font-bold text-slate-900 dark:text-slate-100">{isEditing ? "Update Account" : "New Entry"}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <form className="space-y-5" onSubmit={onSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <InputShell error={touched.account_id ? errors.account_id : undefined}>
              <FieldLabel>Account ID</FieldLabel>
              <input
                type="text"
                value={values.account_id}
                onChange={(event) => onFieldChange("account_id", event.target.value.replace(/\D/g, ""))}
                readOnly={isEditing}
                placeholder="Auto-generated"
                className={cn(
                  "h-11 w-full rounded-xl border bg-slate-50 px-4 text-sm text-slate-900 outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20",
                  touched.account_id && errors.account_id
                    ? "border-rose-300 bg-rose-50 focus:border-rose-400 focus:ring-rose-200"
                    : "border-border",
                  isEditing && "cursor-not-allowed bg-slate-100 text-slate-500",
                )}
              />
              <p className="text-xs text-slate-500 dark:text-slate-400">Leave blank to let MySQL generate the next account ID.</p>
              {touched.account_id && errors.account_id ? <p className="text-xs font-medium text-rose-600">{errors.account_id}</p> : null}
            </InputShell>

            <InputShell error={touched.customer_id ? errors.customer_id : undefined}>
              <FieldLabel>Customer ID</FieldLabel>
              <input
                type="text"
                value={values.customer_id}
                onChange={(event) => onFieldChange("customer_id", event.target.value.replace(/\D/g, ""))}
                placeholder="1"
                className={cn(
                  "h-11 w-full rounded-xl border bg-slate-50 px-4 text-sm text-slate-900 outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20",
                  touched.customer_id && errors.customer_id
                    ? "border-rose-300 bg-rose-50 focus:border-rose-400 focus:ring-rose-200"
                    : "border-border",
                )}
              />
              {touched.customer_id && errors.customer_id ? <p className="text-xs font-medium text-rose-600">{errors.customer_id}</p> : null}
            </InputShell>

            <InputShell error={touched.branch_id ? errors.branch_id : undefined}>
              <FieldLabel>Branch ID</FieldLabel>
              <input
                type="text"
                value={values.branch_id}
                onChange={(event) => onFieldChange("branch_id", event.target.value.replace(/\D/g, ""))}
                placeholder="1"
                className={cn(
                  "h-11 w-full rounded-xl border bg-slate-50 px-4 text-sm text-slate-900 outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20",
                  touched.branch_id && errors.branch_id
                    ? "border-rose-300 bg-rose-50 focus:border-rose-400 focus:ring-rose-200"
                    : "border-border",
                )}
              />
              {touched.branch_id && errors.branch_id ? <p className="text-xs font-medium text-rose-600">{errors.branch_id}</p> : null}
            </InputShell>

            <InputShell error={touched.account_type ? errors.account_type : undefined}>
              <FieldLabel>Account Type</FieldLabel>
              <select
                value={values.account_type}
                onChange={(event) => onFieldChange("account_type", event.target.value)}
                className={cn(
                  "h-11 w-full rounded-xl border bg-slate-50 px-4 text-sm text-slate-900 outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20",
                  touched.account_type && errors.account_type
                    ? "border-rose-300 bg-rose-50 focus:border-rose-400 focus:ring-rose-200"
                    : "border-border",
                )}
              >
                <option value="">Select account type</option>
                {accountTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              {touched.account_type && errors.account_type ? <p className="text-xs font-medium text-rose-600">{errors.account_type}</p> : null}
            </InputShell>

            <InputShell error={touched.balance ? errors.balance : undefined}>
              <FieldLabel>Balance</FieldLabel>
              <input
                type="number"
                step="0.01"
                min="0"
                value={values.balance}
                onChange={(event) => onFieldChange("balance", event.target.value)}
                placeholder="0.00"
                className={cn(
                  "h-11 w-full rounded-xl border bg-slate-50 px-4 text-sm text-slate-900 outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20",
                  touched.balance && errors.balance
                    ? "border-rose-300 bg-rose-50 focus:border-rose-400 focus:ring-rose-200"
                    : "border-border",
                )}
              />
              {touched.balance && errors.balance ? <p className="text-xs font-medium text-rose-600">{errors.balance}</p> : null}
            </InputShell>
          </div>

          <div className="flex flex-col gap-3 border-t border-border pt-5 sm:flex-row">
            <Button type="submit" variant="banking" className="rounded-xl sm:flex-1" disabled={isSubmitting}>
              {isEditing ? <CheckCircle2 className="h-4 w-4" /> : <Save className="h-4 w-4" />}
              {isEditing ? "Update Account" : "Save Account"}
            </Button>
            <Button type="button" variant="outline" className="rounded-xl sm:w-36" onClick={onClear} disabled={isSubmitting}>
              <RotateCcw className="h-4 w-4" />
              Clear
            </Button>
          </div>

          <div className="rounded-2xl border border-sky-100 bg-sky-50/80 px-4 py-3 text-sm text-sky-900 dark:border-sky-900 dark:bg-slate-800 dark:text-slate-100">
            <div className="flex items-start gap-3">
              <Landmark className="mt-0.5 h-4 w-4 shrink-0 text-sky-700 dark:text-sky-300" />
              <p>
                Account records are managed through the Flask API and persisted to the existing MySQL Account table.
              </p>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
