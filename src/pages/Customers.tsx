import * as React from "react";
import { AlertTriangle, CheckCircle2, CircleX, Loader2, PlusCircle } from "lucide-react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import CustomerForm from "@/components/customers/CustomerForm";
import CustomerStats from "@/components/customers/CustomerStats";
import CustomerTable from "@/components/customers/CustomerTable";
import DeleteCustomerDialog from "@/components/customers/DeleteCustomerDialog";
import type {
  Customer,
  CustomerFormErrors,
  CustomerFormValues,
  CustomerSortKey,
  SortDirection,
} from "@/components/customers/customer-types";
import { createCustomer, deleteCustomer, getCustomers, updateCustomer } from "@/services/customerService";

type ToastTone = "success" | "danger" | "info";

type ToastItem = {
  id: number;
  title: string;
  description: string;
  tone: ToastTone;
};

type FieldName = keyof CustomerFormValues;

const PAGE_SIZE = 5;

const blankTouched: Record<FieldName, boolean> = {
  id: false,
  name: false,
  phone: false,
  address: false,
};

function createBlankForm(records: Customer[]): CustomerFormValues {
  const highestId = records.reduce((currentHighest, customer) => {
    const numericPart = Number(customer.id.replace(/\D/g, ""));
    return Number.isFinite(numericPart) && numericPart > currentHighest ? numericPart : currentHighest;
  }, 0);

  return {
    id: `C${String(highestId + 1).padStart(3, "0")}`,
    name: "",
    phone: "",
    address: "",
  };
}

function validateCustomer(values: CustomerFormValues, existingCustomers: Customer[], editingId: string | null) {
  const errors: CustomerFormErrors = {};
  const id = values.id.trim();

  if (!id) {
    errors.id = "Customer ID is required.";
  } else if (!/^C\d+$/i.test(id)) {
    errors.id = "Use C### format (e.g. C011).";
  } else if (
    existingCustomers.some(
      (customer) => customer.id.toUpperCase() === id.toUpperCase() && customer.id !== editingId,
    )
  ) {
    errors.id = "Customer ID already exists.";
  }

  if (!values.name.trim()) {
    errors.name = "Name is required.";
  }

  if (!values.phone.trim()) {
    errors.phone = "Phone number is required.";
  } else if (!/^\d{10}$/.test(values.phone.trim())) {
    errors.phone = "Enter a valid 10-digit phone number.";
  }

  if (!values.address.trim()) {
    errors.address = "Address is required.";
  }

  return errors;
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

export default function Customers() {
  const [customers, setCustomers] = React.useState<Customer[]>([]);
  const [formValues, setFormValues] = React.useState<CustomerFormValues>(createBlankForm([]));
  const [errors, setErrors] = React.useState<CustomerFormErrors>({});
  const [touched, setTouched] = React.useState<Record<FieldName, boolean>>(blankTouched);
  const [selectedCustomer, setSelectedCustomer] = React.useState<Customer | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<Customer | null>(null);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [sortKey, setSortKey] = React.useState<CustomerSortKey>("id");
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

  const syncCustomers = React.useCallback((records: Customer[]) => {
    setCustomers(records);
    setFormValues(createBlankForm(records));
    setErrors({});
    setTouched(blankTouched);
    setSelectedCustomer(null);
    setDeleteTarget(null);
    setCurrentPage(1);
  }, []);

  const resetForm = React.useCallback(
    (records: Customer[] = customers) => {
      setFormValues(createBlankForm(records));
      setErrors({});
      setTouched(blankTouched);
      setSelectedCustomer(null);
      setDeleteTarget(null);
    },
    [customers],
  );

  const loadCustomers = React.useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);

    try {
      const records = await getCustomers();
      syncCustomers(records);
    } catch (error) {
      const message = getErrorMessage(error, "Failed to load customers");
      setLoadError(message);
      pushToast({ title: "Failed to load customers", description: message, tone: "danger" });
    } finally {
      setIsLoading(false);
    }
  }, [pushToast, syncCustomers]);

  React.useEffect(() => {
    void loadCustomers();

    return () => {
      toastTimers.current.forEach((timer) => window.clearTimeout(timer));
    };
  }, [loadCustomers]);

  const refreshCustomers = React.useCallback(async () => {
    const records = await getCustomers();
    syncCustomers(records);
    return records;
  }, [syncCustomers]);

  const handleFieldChange = React.useCallback((field: FieldName, value: string) => {
    setFormValues((current) => ({ ...current, [field]: value }));
    setTouched((current) => ({ ...current, [field]: true }));
  }, []);

  const handleAddCustomer = React.useCallback(() => {
    resetForm();
    setIsDialogOpen(true);
  }, [resetForm]);

  const handleEditCustomer = React.useCallback((customer: Customer) => {
    setSelectedCustomer(customer);
    setDeleteTarget(null);
    setFormValues({
      id: customer.id,
      name: customer.name,
      phone: customer.phone,
      address: customer.address,
    });
    setErrors({});
    setTouched(blankTouched);
    setIsDialogOpen(true);
  }, []);

  const handleRequestDelete = React.useCallback((customer: Customer) => {
    setDeleteTarget(customer);
    setSelectedCustomer(null);
  }, []);

  const handleSubmit = React.useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      const existingId = selectedCustomer?.id ?? null;
      const nextErrors = validateCustomer(formValues, customers, existingId);
      setErrors(nextErrors);
      setTouched({ id: true, name: true, phone: true, address: true });

      if (Object.keys(nextErrors).length > 0 || isSubmitting) {
        return;
      }

      const payload = {
        customer_id: formValues.id.replace(/\D/g, ""),
        name: formValues.name.trim(),
        phone: formValues.phone.trim(),
        address: formValues.address.trim(),
      };

      setIsSubmitting(true);
      try {
        if (selectedCustomer) {
          await updateCustomer(selectedCustomer.id, payload);
          pushToast({
            title: "Customer Updated Successfully",
            description: `Customer ${formValues.id} has been updated.`,
            tone: "success",
          });
        } else {
          await createCustomer(payload);
          pushToast({
            title: "Customer Added Successfully",
            description: `Customer ${formValues.id} has been added.`,
            tone: "success",
          });
        }

        await refreshCustomers();
        setIsDialogOpen(false);
      } catch (error) {
        const message = getErrorMessage(error, selectedCustomer ? "Failed to update customer" : "Failed to create customer");
        pushToast({
          title: selectedCustomer ? "Failed to update customer" : "Failed to create customer",
          description: message,
          tone: "danger",
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    [customers, formValues, isSubmitting, pushToast, refreshCustomers, selectedCustomer],
  );

  const handleConfirmDelete = React.useCallback(async () => {
    if (!deleteTarget || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    try {
      await deleteCustomer(deleteTarget.id);
      pushToast({
        title: "Customer Deleted Successfully",
        description: `Customer ${deleteTarget.id} has been removed.`,
        tone: "success",
      });

      await refreshCustomers();
    } catch (error) {
      const message = getErrorMessage(error, "Failed to delete customer");
      pushToast({ title: "Failed to delete customer", description: message, tone: "danger" });
    } finally {
      setDeleteTarget(null);
      setIsSubmitting(false);
    }
  }, [deleteTarget, isSubmitting, pushToast, refreshCustomers]);

  const filteredCustomers = customers.filter((customer) => {
    const search = searchQuery.trim().toLowerCase();

    if (!search) {
      return true;
    }

    return [
      customer.id,
      customer.name,
      customer.phone,
      customer.address,
    ].some((value) => value.toLowerCase().includes(search));
  });

  const sortedCustomers = [...filteredCustomers].sort((left, right) => {
    const multiplier = sortDirection === "asc" ? 1 : -1;

    return String(left[sortKey]).localeCompare(String(right[sortKey]), undefined, {
      numeric: true,
      sensitivity: "base",
    }) * multiplier;
  });

  const totalPages = Math.max(1, Math.ceil(sortedCustomers.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedCustomers = sortedCustomers.slice((safeCurrentPage - 1) * PAGE_SIZE, safeCurrentPage * PAGE_SIZE);

  React.useEffect(() => {
    if (currentPage !== safeCurrentPage) {
      setCurrentPage(safeCurrentPage);
    }
  }, [currentPage, safeCurrentPage]);

  return (
    <div className="space-y-8 animate-fade-up">
      <section className="overflow-hidden rounded-[2rem] border border-border/80 bg-gradient-to-r from-white via-blue-50 to-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <Badge variant="info" className="w-fit rounded-full px-4 py-1.5">
              Banking Customer Operations
            </Badge>
            <div className="space-y-2">
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                Customer Management
              </h2>
              <p className="max-w-2xl text-base leading-7 text-slate-600">
                Manage bank customers directly from the backend with a responsive banking dashboard UI.
              </p>
            </div>
          </div>

          <Button variant="banking" size="lg" className="w-fit rounded-xl" onClick={handleAddCustomer} disabled={isSubmitting}>
            <PlusCircle className="h-4 w-4" />
            Add Customer
          </Button>
        </div>
      </section>

      {isLoading && (
        <Card className="border-border/80 bg-white/95 shadow-sm">
          <CardContent className="flex items-center gap-3 p-5 text-sm text-slate-600">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            Fetching customers...
          </CardContent>
        </Card>
      )}

      {loadError && (
        <Card className="border-rose-200 bg-rose-50/70 shadow-sm">
          <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3 text-rose-900">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
              <div>
                <p className="font-semibold">Failed to load customers</p>
                <p className="text-sm text-rose-800">{loadError}</p>
              </div>
            </div>
            <Button variant="outline" className="rounded-xl border-rose-200" onClick={() => void loadCustomers()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      <CustomerStats 
        totalCustomers={customers.length} 
        activeRecords={customers.length} 
        recentlyAdded={Math.min(customers.length, 2)} 
        isLoading={isLoading} 
      />

      <CustomerTable
        customers={paginatedCustomers}
        totalRecords={sortedCustomers.length}
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
            setSortDirection("asc");
            return key;
          });
        }}
        onEditCustomer={handleEditCustomer}
        onRequestDelete={handleRequestDelete}
        onPageChange={setCurrentPage}
        onClearSearch={() => {
          setSearchQuery("");
          setCurrentPage(1);
        }}
        onAddCustomer={handleAddCustomer}
      />

      <DialogPrimitive.Root open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <CustomerForm
            values={formValues}
            errors={errors}
            touched={touched}
            isEditing={Boolean(selectedCustomer)}
            isLoading={false}
            isSubmitting={isSubmitting}
            onFieldChange={handleFieldChange}
            onSubmit={handleSubmit}
            onClear={resetForm}
          />
        </DialogContent>
      </DialogPrimitive.Root>

      <DeleteCustomerDialog
        customer={deleteTarget}
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
