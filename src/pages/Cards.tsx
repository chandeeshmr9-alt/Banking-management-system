import * as React from "react";
import { AlertTriangle, CheckCircle2, CircleX, Loader2, PlusCircle, CreditCard, ShieldCheck, ShieldAlert, Trash2, Edit3, Search, ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { getCards, createCard, updateCard, deleteCard, type Card as CardType } from "@/services/cardService";

type ToastTone = "success" | "danger" | "info";
type ToastItem = { id: number; title: string; description: string; tone: ToastTone };

const PAGE_SIZE = 5;

const cardTypes = ["Debit", "Credit"] as const;
const cardStatuses = ["Active", "Blocked", "Expired"] as const;

export default function Cards() {
  const [cards, setCards] = React.useState<CardType[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [selectedCard, setSelectedAccount] = React.useState<CardType | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<CardType | null>(null);
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);
  const toastTimers = React.useRef<number[]>([]);

  const [formValues, setFormValues] = React.useState({
    account_id: "",
    card_number: "",
    card_type: "Debit" as "Debit" | "Credit",
    expiry_date: "",
    cvv: "",
    status: "Active" as "Active" | "Blocked" | "Expired"
  });

  const [searchQuery, setSearchQuery] = React.useState("");
  const [currentPage, setCurrentPage] = React.useState(1);
  const [sortKey, setSortKey] = React.useState<keyof CardType>("card_id");
  const [sortDirection, setSortDirection] = React.useState<"asc" | "desc">("asc");

  const pushToast = React.useCallback((toast: Omit<ToastItem, "id">) => {
    const id = window.setTimeout(() => {
      setToasts((current) => current.filter((item) => item.id !== id));
    }, 3000);
    toastTimers.current.push(id);
    setToasts((current) => [...current, { ...toast, id }]);
  }, []);

  const loadData = React.useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const data = await getCards();
      setCards(data);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Failed to load cards");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadData();
    return () => toastTimers.current.forEach(clearTimeout);
  }, [loadData]);

  const handleAdd = () => {
    setSelectedAccount(null);
    setFormValues({
      account_id: "",
      card_number: "",
      card_type: "Debit",
      expiry_date: "",
      cvv: "",
      status: "Active"
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (card: CardType) => {
    setSelectedAccount(card);
    setFormValues({
      account_id: String(card.account_id),
      card_number: card.card_number,
      card_type: card.card_type,
      expiry_date: card.expiry_date,
      cvv: card.cvv,
      status: card.status
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        ...formValues,
        account_id: Number(formValues.account_id)
      };

      if (selectedCard) {
        await updateCard(selectedCard.card_id, payload);
        pushToast({ title: "Success", description: "Card updated", tone: "success" });
      } else {
        await createCard(payload);
        pushToast({ title: "Success", description: "Card created", tone: "success" });
      }
      loadData();
      setIsDialogOpen(false);
    } catch (error) {
      pushToast({ title: "Error", description: error instanceof Error ? error.message : "Operation failed", tone: "danger" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsSubmitting(true);
    try {
      await deleteCard(deleteTarget.card_id);
      pushToast({ title: "Deleted", description: "Card removed successfully", tone: "success" });
      loadData();
      setDeleteTarget(null);
    } catch (error) {
      pushToast({ title: "Error", description: error instanceof Error ? error.message : "Delete failed", tone: "danger" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = cards.filter(c => 
    [c.card_number, c.card_type, c.status, String(c.account_id)].some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const sorted = [...filtered].sort((a, b) => {
    const mult = sortDirection === "asc" ? 1 : -1;
    return String(a[sortKey]).localeCompare(String(b[sortKey])) * mult;
  });

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const paged = sorted.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <div className="space-y-8 animate-fade-up">
      <section className="overflow-hidden rounded-[2rem] border border-border/80 bg-gradient-to-r from-white via-indigo-50 to-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <Badge variant="info" className="w-fit rounded-full px-4 py-1.5">Banking Card Operations</Badge>
            <div className="space-y-2">
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">Cards Management</h2>
              <p className="max-w-2xl text-base leading-7 text-slate-600">Issue and manage debit/credit cards for bank accounts.</p>
            </div>
          </div>
          <Button variant="banking" size="lg" className="rounded-xl" onClick={handleAdd}>
            <PlusCircle className="h-4 w-4" /> Add Card
          </Button>
        </div>
      </section>

      <div className="grid gap-6">
        <Card className="border-border/80 bg-white/95 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search cards..."
                  className="h-10 w-full rounded-xl border border-border bg-slate-50 pl-10 text-sm focus:ring-2 focus:ring-primary/20"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden rounded-xl border border-border">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Card Number</th>
                    <th className="px-6 py-4 font-semibold">Account</th>
                    <th className="px-6 py-4 font-semibold">Type</th>
                    <th className="px-6 py-4 font-semibold">Expiry</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {isLoading ? (
                    <tr><td colSpan={6} className="py-10 text-center"><Loader2 className="mx-auto animate-spin text-primary" /></td></tr>
                  ) : paged.map(card => (
                    <tr key={card.card_id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-mono font-medium">{card.card_number.replace(/(.{4})/g, '$1 ')}</td>
                      <td className="px-6 py-4">#{card.account_id}</td>
                      <td className="px-6 py-4"><Badge variant="outline">{card.card_type}</Badge></td>
                      <td className="px-6 py-4">{card.expiry_date}</td>
                      <td className="px-6 py-4">
                        <Badge variant={card.status === 'Active' ? 'success' : card.status === 'Blocked' ? 'danger' : 'info'}>
                          {card.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(card)}><Edit3 className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="sm" className="text-rose-600" onClick={() => setDeleteTarget(card)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Form Dialog */}
      <DialogPrimitive.Root open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogPrimitive.Portal>
          <div className="fixed inset-0 z-50 bg-slate-950/45 backdrop-blur-sm" />
          <DialogPrimitive.Content className="fixed left-1/2 top-1/2 z-50 w-[min(92vw,30rem)] -translate-x-1/2 -translate-y-1/2 rounded-3xl border bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <DialogPrimitive.Title className="text-xl font-bold">{selectedCard ? 'Edit Card' : 'Add New Card'}</DialogPrimitive.Title>
              <DialogPrimitive.Close><X className="h-5 w-5" /></DialogPrimitive.Close>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold">Account ID</label>
                <input required className="w-full rounded-xl border p-3" value={formValues.account_id} onChange={e => setFormValues({...formValues, account_id: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold">Card Number</label>
                <input required maxLength={16} className="w-full rounded-xl border p-3 font-mono" value={formValues.card_number} onChange={e => setFormValues({...formValues, card_number: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Type</label>
                  <select className="w-full rounded-xl border p-3" value={formValues.card_type} onChange={e => setFormValues({...formValues, card_type: e.target.value as any})}>
                    {cardTypes.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Status</label>
                  <select className="w-full rounded-xl border p-3" value={formValues.status} onChange={e => setFormValues({...formValues, status: e.target.value as any})}>
                    {cardStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Expiry Date (YYYY-MM-DD)</label>
                  <input type="date" required className="w-full rounded-xl border p-3" value={formValues.expiry_date} onChange={e => setFormValues({...formValues, expiry_date: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold">CVV</label>
                  <input required maxLength={4} className="w-full rounded-xl border p-3" value={formValues.cvv} onChange={e => setFormValues({...formValues, cvv: e.target.value})} />
                </div>
              </div>
              <Button type="submit" variant="banking" className="w-full py-6 rounded-xl" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="animate-spin" /> : selectedCard ? 'Update Card' : 'Issue Card'}
              </Button>
            </form>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>

      {/* Delete Confirmation */}
      <DialogPrimitive.Root open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogPrimitive.Portal>
          <div className="fixed inset-0 z-50 bg-slate-950/45 backdrop-blur-sm" />
          <DialogPrimitive.Content className="fixed left-1/2 top-1/2 z-50 w-[min(92vw,24rem)] -translate-x-1/2 -translate-y-1/2 rounded-3xl border bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-bold mb-2">Delete Card?</h3>
            <p className="text-slate-600 text-sm mb-6">Are you sure you want to delete card ending in {deleteTarget?.card_number.slice(-4)}? This action is permanent.</p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setDeleteTarget(null)}>Cancel</Button>
              <Button className="flex-1 rounded-xl bg-rose-600 text-white hover:bg-rose-700" onClick={handleDelete} disabled={isSubmitting}>Delete</Button>
            </div>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>

      {/* Toasts */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
        {toasts.map((toast) => {
          const ToastIcon = toast.tone === "success" ? CheckCircle2 : toast.tone === "danger" ? CircleX : AlertTriangle;
          return (
            <Card key={toast.id} className={cn("border", toast.tone === 'success' ? 'bg-emerald-50' : toast.tone === 'danger' ? 'bg-rose-50' : 'bg-blue-50')}>
              <CardContent className="flex items-start gap-3 p-4">
                <ToastIcon className="h-5 w-5 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold">{toast.title}</p>
                  <p className="text-xs opacity-80">{toast.description}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
