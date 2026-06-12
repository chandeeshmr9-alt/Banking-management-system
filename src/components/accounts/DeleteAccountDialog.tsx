import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { AlertTriangle, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Account } from "./account-types";

type DeleteAccountDialogProps = {
  account: Account | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isDeleting?: boolean;
};

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
        "fixed left-1/2 top-1/2 z-50 w-[min(92vw,32rem)] -translate-x-1/2 -translate-y-1/2 rounded-[1.75rem] border border-border bg-white p-6 shadow-2xl outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
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

export default function DeleteAccountDialog({
  account,
  open,
  onOpenChange,
  onConfirm,
  isDeleting = false,
}: DeleteAccountDialogProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <div className="space-y-4 pr-7">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-rose-50 p-3 text-rose-600 shadow-sm">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div className="space-y-2">
              <DialogPrimitive.Title className="text-xl font-bold tracking-tight text-slate-900">
                Delete Account?
              </DialogPrimitive.Title>
              <DialogPrimitive.Description className="text-sm leading-6 text-slate-600">
                This action removes the account from MySQL. Related records may block deletion because of foreign key constraints.
              </DialogPrimitive.Description>
            </div>
          </div>

          <div className="rounded-2xl border border-rose-100 bg-rose-50/70 p-4 text-sm text-rose-900">
            <div className="flex items-center gap-2 font-semibold">
              <Trash2 className="h-4 w-4" />
              Account ID {account?.account_id ?? "--"}
            </div>
            <p className="mt-1 text-rose-800/80">
              Customer {account?.customer_id ?? "--"}, Branch {account?.branch_id ?? "--"}, {account?.account_type ?? "--"}
            </p>
          </div>

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <DialogPrimitive.Close asChild>
              <Button variant="outline" className="rounded-xl" disabled={isDeleting}>
                Cancel
              </Button>
            </DialogPrimitive.Close>
            <Button
              className="rounded-xl bg-rose-600 text-white hover:bg-rose-700"
              onClick={onConfirm}
              disabled={isDeleting}
            >
              <Trash2 className="h-4 w-4" />
              Delete Account
            </Button>
          </div>
        </div>
      </DialogContent>
    </DialogPrimitive.Root>
  );
}
