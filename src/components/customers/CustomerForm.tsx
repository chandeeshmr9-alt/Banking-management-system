import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Banknote, CheckCircle2, RotateCcw, Save, UserRoundPlus } from "lucide-react";
import type { CustomerFormErrors, CustomerFormValues } from "./customer-types";

type CustomerFormProps = {
  values: CustomerFormValues;
  errors: CustomerFormErrors;
  touched: Record<keyof CustomerFormValues, boolean>;
  isEditing: boolean;
  isLoading: boolean;
  isSubmitting?: boolean;
  onFieldChange: (field: keyof CustomerFormValues, value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onClear: () => void;
};

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

export default function CustomerForm({
  values,
  errors,
  touched,
  isEditing,
  isLoading,
  isSubmitting = false,
  onFieldChange,
  onSubmit,
  onClear,
}: CustomerFormProps) {
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
              {isEditing ? "Edit Customer" : "Add Customer"}
            </Badge>
            <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
              <UserRoundPlus className="h-5 w-5 text-primary dark:text-sky-300" />
              Customer Form
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-300">Maintain customer records locally with a banking-style form.</CardDescription>
          </div>
          <div className="hidden rounded-2xl border border-sky-200 bg-white px-4 py-3 text-right shadow-sm sm:block dark:border-slate-700 dark:bg-slate-800">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-300">Mode</p>
            <p className="mt-1 text-sm font-bold text-slate-900 dark:text-slate-100">{isEditing ? "Update Customer" : "New Entry"}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <form className="space-y-5" onSubmit={onSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <InputShell error={touched.id ? errors.id : undefined}>
              <FieldLabel>Customer ID</FieldLabel>
              <input
                type="text"
                value={values.id}
                onChange={(event) => onFieldChange("id", event.target.value.toUpperCase())}
                readOnly={isEditing}
                placeholder="C011"
                className={cn(
                  "h-11 w-full rounded-xl border bg-slate-50 px-4 text-sm text-slate-900 outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20",
                  touched.id && errors.id
                    ? "border-rose-300 bg-rose-50 focus:border-rose-400 focus:ring-rose-200"
                    : "border-border",
                  isEditing && "cursor-not-allowed bg-slate-100 text-slate-500",
                )}
              />
              <p className="text-xs text-slate-500 dark:text-slate-400">{isEditing ? "Customer ID is locked while editing." : "Use the C### format."}</p>
              {touched.id && errors.id ? <p className="text-xs font-medium text-rose-600">{errors.id}</p> : null}
            </InputShell>

            <InputShell error={touched.name ? errors.name : undefined}>
              <FieldLabel>Customer Name</FieldLabel>
              <input
                type="text"
                value={values.name}
                onChange={(event) => onFieldChange("name", event.target.value)}
                placeholder="Customer name"
                className={cn(
                  "h-11 w-full rounded-xl border bg-slate-50 px-4 text-sm text-slate-900 outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20",
                  touched.name && errors.name
                    ? "border-rose-300 bg-rose-50 focus:border-rose-400 focus:ring-rose-200"
                    : "border-border",
                )}
              />
              {touched.name && errors.name ? <p className="text-xs font-medium text-rose-600">{errors.name}</p> : null}
            </InputShell>

            <InputShell error={touched.phone ? errors.phone : undefined}>
              <FieldLabel>Phone Number</FieldLabel>
              <input
                type="tel"
                value={values.phone}
                onChange={(event) => onFieldChange("phone", event.target.value.replace(/\D/g, ""))}
                placeholder="9876543210"
                maxLength={10}
                className={cn(
                  "h-11 w-full rounded-xl border bg-slate-50 px-4 text-sm text-slate-900 outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20",
                  touched.phone && errors.phone
                    ? "border-rose-300 bg-rose-50 focus:border-rose-400 focus:ring-rose-200"
                    : "border-border",
                )}
              />
              {touched.phone && errors.phone ? <p className="text-xs font-medium text-rose-600">{errors.phone}</p> : null}
            </InputShell>

            <InputShell error={touched.address ? errors.address : undefined}>
              <FieldLabel>Address</FieldLabel>
              <textarea
                value={values.address}
                onChange={(event) => onFieldChange("address", event.target.value)}
                placeholder="Complete address"
                rows={3}
                className={cn(
                  "w-full rounded-xl border bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20",
                  touched.address && errors.address
                    ? "border-rose-300 bg-rose-50 focus:border-rose-400 focus:ring-rose-200"
                    : "border-border",
                )}
              />
              {touched.address && errors.address ? <p className="text-xs font-medium text-rose-600">{errors.address}</p> : null}
            </InputShell>
          </div>

          <div className="flex flex-col gap-3 border-t border-border pt-5 sm:flex-row">
            <Button type="submit" variant="banking" className="rounded-xl sm:flex-1" disabled={isSubmitting}>
              {isEditing ? <CheckCircle2 className="h-4 w-4" /> : <Save className="h-4 w-4" />}
              {isEditing ? "Update Customer" : "Save Customer"}
            </Button>
            <Button type="button" variant="outline" className="rounded-xl sm:w-36" onClick={onClear} disabled={isSubmitting}>
              <RotateCcw className="h-4 w-4" />
              Clear
            </Button>
          </div>

          <div className="rounded-2xl border border-sky-100 bg-sky-50/80 px-4 py-3 text-sm text-sky-900 dark:border-sky-900 dark:bg-slate-800 dark:text-slate-100">
            <div className="flex items-start gap-3">
              <Banknote className="mt-0.5 h-4 w-4 shrink-0 text-sky-700 dark:text-sky-300" />
              <p>
                All changes stay in local React state only. Use the table actions to demonstrate full customer CRUD flows.
              </p>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
