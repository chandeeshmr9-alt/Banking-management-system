import * as React from "react";
import { AlertTriangle, CheckCircle2, CircleX, Loader2, PlusCircle } from "lucide-react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import AccountForm from "@/components/accounts/AccountForm";
import AccountStats from "@/components/accounts/AccountStats";
import AccountTable from "@/components/accounts/AccountTable";
import DeleteAccountDialog from "@/components/accounts/DeleteAccountDialog";
import type {
  Account,
  AccountFormErrors,
  AccountFormValues,
  AccountSortKey,
  SortDirection,
} from "@/components/accounts/account-types";
import { createAccount, deleteAccount, getAccounts, updateAccount } from "@/services/accountService";

type ToastTone = "success" | "danger" | "info";

type ToastItem = {
  id: number;
  title: string;
  description: string;
  tone: ToastTone;
};

type FieldName = keyof AccountFormValues;

const PAGE_SIZE = 5;

const blankTouched: Record<FieldName, boolean> = {
  account_id: false,
  customer_id: false,
  branch_id: false,
  account_type: false,
  balance: false,
};

const accountTypes = ["Savings", "Current", "Salary", "Fixed Deposit"] as const;

function createBlankForm(records: Account[]): AccountFormValues {
  const highestAccountId = records.reduce((currentHighest, account) => {
    const numericPart = Number(account.account_id.replace(/\D/g, ""));
    return Number.isFinite(numericPart) && numericPart > currentHighest ? numericPart : currentHighest;
  }, 0);

  return {
    account_id: String(highestAccountId + 1),
    customer_id: "",
    branch_id: "",
    account_type: "",
    balance: "",
  };
}

function validateAccount(values: AccountFormValues, existingAccounts: Account[], editingAccountId: string | null) {
  const errors: AccountFormErrors = {};
  const accountId = values.account_id.trim();

  if (!accountId) {
    errors.account_id = "Account ID is required.";
  } else if (!/^\d+$/.test(accountId)) {
    errors.account_id = "Account ID must be numeric.";
  } else if (
    existingAccounts.some(
      (account) => account.account_id === accountId && account.account_id !== editingAccountId,
    )
  ) {
    errors.account_id = "Account ID already exists.";
  }

  if (!values.customer_id.trim()) {
    errors.customer_id = "Customer ID is required.";
  } else if (!/^\d+$/.test(values.customer_id.trim())) {
    errors.customer_id = "Customer ID must be numeric.";
  }

  if (!values.branch_id.trim()) {
    errors.branch_id = "Branch ID is required.";
  } else if (!/^\d+$/.test(values.branch_id.trim())) {
    errors.branch_id = "Branch ID must be numeric.";
  }

  if (!values.account_type) {
    errors.account_type = "Account type is required.";
  } else if (!accountTypes.includes(values.account_type as (typeof accountTypes)[number])) {
    errors.account_type = "Select a valid account type.";
  }

  if (!values.balance.trim()) {
    errors.balance = "Balance is required.";
  } else if (Number.isNaN(Number(values.balance)) || Number(values.balance) < 0) {
    errors.balance = "Enter a valid non-negative balance.";
  }

  return errors;
}

function formatCurrency(balance: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(balance);
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallback;
}

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-slate-950/45 backdrop-blur-sm transition-opacity duration-300 data-[state=open]:opacity-100",
      className,
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPrimitive.Portal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-1/2 top-1/2 z-50 w-[min(92vw,40rem)] -translate-x-1/2 -translate-y-1/2 rounded-[2rem] border border-border bg-white p-6 shadow-2xl outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        className,
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close asChild>
        <Button variant="ghost" size="icon" className="absolute right-4 top-4 rounded-full" aria-label="Close dialog">
          <X className="h-4 w-4" />
        </Button>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

export default function Accounts() {
  const [accounts, setAccounts] = React.useState<Account[]>([]);
  const [formValues, setFormValues] = React.useState<AccountFormValues>(createBlankForm([]));
  const [errors, setErrors] = React.useState<AccountFormErrors>({});
  const [touched, setTouched] = React.useState<Record<FieldName, boolean>>(blankTouched);
  const [selectedAccount, setSelectedAccount] = React.useState<Account | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<Account | null>(null);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [sortKey, setSortKey] = React.useState<AccountSortKey>("account_id");
  const [sortDirection, setSortDirection] = React.useState<SortDirection>("asc");
  const [currentPage, setCurrentPage] = React.useState(1);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);
  const toastTimers = React.useRef<number[]>([]);

  const pushToast = React.useCallback((toast: Omit<ToastItem, "id">) => {
    const id = window.setTimeout(() => {
      setToasts((current) => current.filter((item) => item.id !== id));
    }, 3000);

    toastTimers.current.push(id);
    setToasts((current) => [...current, { ...toast, id }]);
  }, []);

  const syncAccounts = React.useCallback((records: Account[]) => {
    setAccounts(records);
    setFormValues(createBlankForm(records));
    setErrors({});
    setTouched(blankTouched);
    setSelectedAccount(null);
    setDeleteTarget(null);
    setCurrentPage(1);
  }, []);

  const resetForm = React.useCallback(
    (records: Account[] = accounts) => {
      setFormValues(createBlankForm(records));
      setErrors({});
      setTouched(blankTouched);
      setSelectedAccount(null);
      setDeleteTarget(null);
    },
    [accounts],
  );

  const loadAccounts = React.useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);

    try {
      const records = await getAccounts();
      syncAccounts(records);
    } catch (error) {
      const message = getErrorMessage(error, "Failed to load accounts");
      setLoadError(message);
      pushToast({ title: "Failed to load accounts", description: message, tone: "danger" });
    } finally {
      setIsLoading(false);
    }
  }, [pushToast, syncAccounts]);

  React.useEffect(() => {
    void loadAccounts();

    return () => {
      toastTimers.current.forEach((timer) => window.clearTimeout(timer));
    };
  }, [loadAccounts]);

  const refreshAccounts = React.useCallback(async () => {
    const records = await getAccounts();
    syncAccounts(records);
    return records;
  }, [syncAccounts]);

  const handleFieldChange = React.useCallback((field: FieldName, value: string) => {
    const nextValue =
      field === "account_type"
        ? value
        : field === "balance"
          ? value.replace(/[^\d.]/g, "")
          : value.replace(/\D/g, "");

    setFormValues((current) => ({ ...current, [field]: nextValue }));
    setTouched((current) => ({ ...current, [field]: true }));
  }, []);

  const handleAddAccount = React.useCallback(() => {
    resetForm();
    setIsDialogOpen(true);
  }, [resetForm]);

  const handleEditAccount = React.useCallback((account: Account) => {
    setSelectedAccount(account);
    setDeleteTarget(null);
    setFormValues({
      account_id: account.account_id,
      customer_id: account.customer_id,
      branch_id: account.branch_id,
      account_type: account.account_type,
      balance: String(account.balance),
    });
    setErrors({});
    setTouched(blankTouched);
    setIsDialogOpen(true);
  }, []);

  const handleRequestDelete = React.useCallback((account: Account) => {
    setDeleteTarget(account);
    setSelectedAccount(null);
  }, []);

  const handleSubmit = React.useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      const existingAccountId = selectedAccount?.account_id ?? null;
      const nextErrors = validateAccount(formValues, accounts, existingAccountId);
      setErrors(nextErrors);
      setTouched({ account_id: true, customer_id: true, branch_id: true, account_type: true, balance: true });

      if (Object.keys(nextErrors).length > 0 || isSubmitting) {
        return;
      }

      const payload = {
        account_id: formValues.account_id.trim(),
        customer_id: formValues.customer_id.trim(),
        branch_id: formValues.branch_id.trim(),
        account_type: formValues.account_type,
        balance: Number(formValues.balance).toFixed(2),
      };

      setIsSubmitting(true);
      try {
        if (selectedAccount) {
          await updateAccount(selectedAccount.account_id, payload);
          pushToast({
            title: "Account Updated Successfully",
            description: `Account ${payload.account_id} has been updated.`,
            tone: "success",
          });
        } else {
          await createAccount(payload);
          pushToast({
            title: "Account Added Successfully",
            description: `Account ${payload.account_id} has been added.`,
            tone: "success",
          });
        }

        await refreshAccounts();
        setIsDialogOpen(false);
      } catch (error) {
        const message = getErrorMessage(error, selectedAccount ? "Failed to update account" : "Failed to create account");
        pushToast({
          title: selectedAccount ? "Failed to update account" : "Failed to create account",
          description: message,
          tone: "danger",
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    [accounts, formValues, isSubmitting, pushToast, refreshAccounts, selectedAccount],
  );

  const handleConfirmDelete = React.useCallback(async () => {
    if (!deleteTarget || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    try {
      await deleteAccount(deleteTarget.account_id);
      pushToast({
        title: "Account Deleted Successfully",
        description: `Account ${deleteTarget.account_id} has been removed.`,
        tone: "success",
      });

      await refreshAccounts();
    } catch (error) {
      const message = getErrorMessage(error, "Failed to delete account");
      pushToast({ title: "Failed to delete account", description: message, tone: "danger" });
    } finally {
      setDeleteTarget(null);
      setIsSubmitting(false);
    }
  }, [deleteTarget, isSubmitting, pushToast, refreshAccounts]);

  const filteredAccounts = accounts.filter((account) => {
    const search = searchQuery.trim().toLowerCase();

    if (!search) {
      return true;
    }

    return [
      account.account_id,
      account.customer_id,
      account.branch_id,
      account.account_type,
      String(account.balance),
      formatCurrency(account.balance),
    ].some((value) => value.toLowerCase().includes(search));
  });

  const sortedAccounts = [...filteredAccounts].sort((left, right) => {
    const multiplier = sortDirection === "asc" ? 1 : -1;

    if (sortKey === "balance") {
      return (Number(left.balance) - Number(right.balance)) * multiplier;
    }

    if (sortKey === "account_id" || sortKey === "customer_id" || sortKey === "branch_id") {
      return (Number(left[sortKey]) - Number(right[sortKey])) * multiplier;
    }

    return String(left[sortKey]).localeCompare(String(right[sortKey]), undefined, {
      numeric: true,
      sensitivity: "base",
    }) * multiplier;
  });

  const totalPages = Math.max(1, Math.ceil(sortedAccounts.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedAccounts = sortedAccounts.slice((safeCurrentPage - 1) * PAGE_SIZE, safeCurrentPage * PAGE_SIZE);

  React.useEffect(() => {
    if (currentPage !== safeCurrentPage) {
      setCurrentPage(safeCurrentPage);
    }
  }, [currentPage, safeCurrentPage]);

  const totalBalance = accounts.reduce((sum, account) => sum + Number(account.balance), 0);
  const highValueAccounts = accounts.filter((account) => Number(account.balance) >= 50000).length;

  return (
    <div className="space-y-8 animate-fade-up">
      <section className="overflow-hidden rounded-[2rem] border border-border/80 bg-gradient-to-r from-white via-sky-50 to-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <Badge variant="info" className="w-fit rounded-full px-4 py-1.5">
              Banking Account Operations
            </Badge>
            <div className="space-y-2">
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                Account Management
              </h2>
              <p className="max-w-2xl text-base leading-7 text-slate-600">
                Manage account records directly from the Flask and MySQL backend with a responsive banking dashboard UI.
              </p>
            </div>
          </div>

          <Button variant="banking" size="lg" className="w-fit rounded-xl" onClick={handleAddAccount} disabled={isSubmitting}>
            <PlusCircle className="h-4 w-4" />
            Add Account
          </Button>
        </div>
      </section>

      {isLoading && (
        <Card className="border-border/80 bg-white/95 shadow-sm">
          <CardContent className="flex items-center gap-3 p-5 text-sm text-slate-600">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            Fetching accounts...
          </CardContent>
        </Card>
      )}

      {loadError && (
        <Card className="border-rose-200 bg-rose-50/70 shadow-sm">
          <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3 text-rose-900">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
              <div>
                <p className="font-semibold">Failed to load accounts</p>
                <p className="text-sm text-rose-800">{loadError}</p>
              </div>
            </div>
            <Button variant="outline" className="rounded-xl border-rose-200" onClick={() => void loadAccounts()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      <AccountStats totalAccounts={accounts.length} totalBalance={totalBalance} highValueAccounts={highValueAccounts} isLoading={isLoading} />

      <AccountTable
        accounts={paginatedAccounts}
        totalRecords={sortedAccounts.length}
        totalPages={totalPages}
        currentPage={safeCurrentPage}
        searchQuery={searchQuery}
        sortKey={sortKey}
        sortDirection={sortDirection}
        isLoading={isLoading}
        onSearchChange={(value) => {
          setSearchQuery(value);
          setCurrentPage(1);
        }}
        onSortChange={(key) => {
          setCurrentPage(1);
          setSortKey((currentKey) => {
            if (currentKey === key) {
              setSortDirection((currentDirection) => (currentDirection === "asc" ? "desc" : "asc"));
              return currentKey;
            }

            setSortDirection(key === "balance" ? "desc" : "asc");
            return key;
          });
        }}
        onEditAccount={handleEditAccount}
        onRequestDelete={handleRequestDelete}
        onPageChange={setCurrentPage}
        onClearSearch={() => {
          setSearchQuery("");
          setCurrentPage(1);
        }}
        onAddAccount={handleAddAccount}
      />

      <DialogPrimitive.Root open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <AccountForm
            values={formValues}
            errors={errors}
            touched={touched}
            isEditing={Boolean(selectedAccount)}
            isLoading={false}
            isSubmitting={isSubmitting}
            onFieldChange={handleFieldChange}
            onSubmit={handleSubmit}
            onClear={resetForm}
          />
        </DialogContent>
      </DialogPrimitive.Root>

      <DeleteAccountDialog
        account={deleteTarget}
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTarget(null);
          }
        }}
        onConfirm={() => void handleConfirmDelete()}
        isDeleting={isSubmitting}
      />

      <div className="fixed bottom-6 right-6 z-50 flex w-[min(92vw,24rem)] flex-col gap-3">
        {toasts.map((toast) => {
          const toastStyles =
            toast.tone === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-900 shadow-emerald-100"
              : toast.tone === "danger"
                ? "border-rose-200 bg-rose-50 text-rose-900 shadow-rose-100"
                : "border-sky-200 bg-sky-50 text-sky-900 shadow-sky-100";

          const ToastIcon = toast.tone === "success" ? CheckCircle2 : toast.tone === "danger" ? CircleX : AlertTriangle;

          return (
            <Card key={toast.id} className={`border ${toastStyles}`}>
              <CardContent className="flex items-start gap-3 p-4">
                <div className="mt-0.5 rounded-full bg-white/80 p-2 shadow-sm">
                  <ToastIcon className="h-4 w-4" />
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
