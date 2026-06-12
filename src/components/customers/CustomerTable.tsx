import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Edit3,
  Landmark,
  PlusCircle,
  Search,
  Trash2,
  UserRound,
} from "lucide-react";
import type { Customer, CustomerSortKey, SortDirection } from "./customer-types";

type CustomerTableProps = {
  customers: Customer[];
  totalRecords: number;
  totalPages: number;
  currentPage: number;
  searchQuery: string;
  sortKey: CustomerSortKey;
  sortDirection: SortDirection;
  isLoading: boolean;
  onSearchChange: (value: string) => void;
  onSortChange: (key: CustomerSortKey) => void;
  onEditCustomer: (customer: Customer) => void;
  onRequestDelete: (customer: Customer) => void;
  onPageChange: (page: number) => void;
  onClearSearch: () => void;
  onAddCustomer: () => void;
};

const sortableColumns: Array<{ key: CustomerSortKey; label: string }> = [
  { key: "id", label: "Customer ID" },
  { key: "name", label: "Customer Name" },
  { key: "phone", label: "Phone Number" },
  { key: "address", label: "Address" },
];

export default function CustomerTable({
  customers,
  totalRecords,
  totalPages,
  currentPage,
  searchQuery,
  sortKey,
  sortDirection,
  isLoading,
  onSearchChange,
  onSortChange,
  onEditCustomer,
  onRequestDelete,
  onPageChange,
  onClearSearch,
  onAddCustomer,
}: CustomerTableProps) {
  if (isLoading) {
    return (
      <Card className="border-border/80 bg-white/95 shadow-sm dark:bg-slate-900/95">
        <CardHeader>
          <div className="space-y-3">
            <div className="h-6 w-48 animate-pulse rounded-full bg-slate-100 dark:bg-slate-800" />
            <div className="h-4 w-64 animate-pulse rounded-full bg-slate-100 dark:bg-slate-800" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="h-11 w-full animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="h-16 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const hasRecords = customers.length > 0;
  const showNoResults = totalRecords === 0;

  return (
    <Card className="border-border/80 bg-white/95 shadow-sm dark:bg-slate-900/95">
      <CardHeader className="space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <Badge variant="info" className="w-fit rounded-full px-3 py-1">
              Customer Directory
            </Badge>
            <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
              <Landmark className="h-5 w-5 text-primary dark:text-sky-300" />
              Customer Records Table
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-300">
              Search, sort, page through, and manage your banking customer dataset.
            </CardDescription>
          </div>

          <div className="rounded-2xl border border-border bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
            <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-100">
              <UserRound className="h-4 w-4 text-primary dark:text-sky-300" />
              {totalRecords} {totalRecords === 1 ? "record" : "records"}
            </div>
            <p className="mt-1">Page {currentPage} of {totalPages}</p>
          </div>
        </div>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-xl">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-300" />
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search by ID, name, phone, or address"
              className="h-11 w-full rounded-xl border border-border bg-slate-50 pl-10 pr-24 text-sm text-slate-900 outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={onClearSearch}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-white hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-slate-100"
              >
                Clear
              </button>
            ) : null}
          </div>

          <Button variant="outline" className="rounded-xl lg:w-fit" onClick={onAddCustomer}>
            <PlusCircle className="h-4 w-4" />
            Add Customer
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {showNoResults ? (
          <div className="rounded-[1.75rem] border border-dashed border-sky-200 bg-sky-50/70 p-8 text-center dark:border-slate-700 dark:bg-slate-900">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-primary shadow-sm dark:bg-slate-800 dark:text-sky-300">
              <Search className="h-7 w-7" />
            </div>
            <h3 className="mt-4 text-xl font-bold text-slate-900 dark:text-slate-100">
              {searchQuery ? "No matching customers found" : "No customer records available"}
            </h3>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600 dark:text-slate-300">
              {searchQuery
                ? "Try a different search term or clear the filter to view all stored records."
                : "Use the Add Customer button to create the first local customer record."}
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              {searchQuery ? (
                <Button variant="outline" className="rounded-xl" onClick={onClearSearch}>
                  Clear Search
                </Button>
              ) : null}
              <Button variant="banking" className="rounded-xl" onClick={onAddCustomer}>
                <PlusCircle className="h-4 w-4" />
                Add Customer
              </Button>
            </div>
          </div>
        ) : (
          <div className="overflow-hidden rounded-[1.75rem] border border-border bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-[0.18em] text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                  <tr>
                    {sortableColumns.map((column) => {
                      const active = sortKey === column.key;

                      return (
                        <th key={column.key} scope="col" className="px-5 py-4 font-semibold">
                          <button
                            type="button"
                            onClick={() => onSortChange(column.key)}
                            className="inline-flex items-center gap-2 transition hover:text-slate-900 dark:hover:text-slate-100"
                            aria-sort={active ? (sortDirection === "asc" ? "ascending" : "descending") : "none"}
                          >
                            {column.label}
                            {active ? (
                              sortDirection === "asc" ? (
                                <ArrowUp className="h-3.5 w-3.5" />
                              ) : (
                                <ArrowDown className="h-3.5 w-3.5" />
                              )
                            ) : (
                                <ArrowUpDown className="h-3.5 w-3.5 text-slate-400 dark:text-slate-300" />
                            )}
                          </button>
                        </th>
                      );
                    })}
                    <th scope="col" className="px-5 py-4 font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-white dark:bg-slate-900">
                  {hasRecords ? (
                    customers.map((customer) => (
                      <tr key={customer.id} className="group transition-colors hover:bg-sky-50/60">
                        <td className="px-5 py-4">
                          <Badge variant="outline" className="rounded-full border-sky-200 bg-white text-slate-900 dark:border-sky-900 dark:bg-slate-800 dark:text-slate-100">
                            {customer.id}
                          </Badge>
                        </td>
                        <td className="px-5 py-4 font-semibold text-slate-900 dark:text-slate-100">{customer.name}</td>
                        <td className="px-5 py-4 text-slate-600 dark:text-slate-300">{customer.phone}</td>
                        <td className="px-5 py-4 text-slate-600 dark:text-slate-300">
                          <span className="block max-w-[20rem] truncate">{customer.address}</span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex flex-wrap gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="rounded-lg border-slate-200 bg-white text-slate-700 hover:border-sky-300 hover:bg-sky-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
                              onClick={() => onEditCustomer(customer)}
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="rounded-lg border-rose-200 bg-white text-rose-600 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700 dark:border-rose-900 dark:bg-slate-800 dark:text-rose-300 dark:hover:bg-rose-950/60"
                              onClick={() => onRequestDelete(customer)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-5 py-14 text-center text-sm text-slate-500 dark:text-slate-300">
                        No records are available for the current view.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {totalPages > 1 && hasRecords ? (
          <div className="flex flex-col gap-3 rounded-2xl border border-border bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-700 dark:bg-slate-800">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Showing {(currentPage - 1) * 5 + 1} to {Math.min(currentPage * 5, totalRecords)} of {totalRecords} records
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="rounded-lg"
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                <Button
                  key={page}
                  variant={page === currentPage ? "banking" : "outline"}
                  size="sm"
                  className={cn("min-w-10 rounded-lg px-3", page !== currentPage && "bg-white dark:bg-slate-900")}
                  onClick={() => onPageChange(page)}
                >
                  {page}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                className="rounded-lg"
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
