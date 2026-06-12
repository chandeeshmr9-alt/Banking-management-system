import * as React from "react";
import { ArrowRightLeft, RefreshCcw } from "lucide-react";
import ReadOnlyRecordsPage, { type ReadOnlyColumn } from "@/components/read-only/ReadOnlyRecordsPage";
import { Button } from "@/components/ui/button";
import { getTransactions, type Transaction } from "@/services/transactionService";

const columns: ReadOnlyColumn<Transaction>[] = [
  { key: "transaction_id", label: "Transaction ID", render: (transaction) => transaction.transaction_id },
  { key: "account_id", label: "Account ID", render: (transaction) => transaction.account_id },
  { key: "transaction_type", label: "Transaction Type", render: (transaction) => transaction.transaction_type },
  {
    key: "amount",
    label: "Amount",
    render: (transaction) =>
      new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(transaction.amount),
  },
  {
    key: "transaction_date",
    label: "Transaction Date",
    render: (transaction) => new Date(transaction.transaction_date).toLocaleString(),
  },
];

export default function Transactions() {
  const [transactions, setTransactions] = React.useState<Transaction[]>([]);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const loadTransactions = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      setTransactions(await getTransactions());
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Failed to load transactions");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void loadTransactions();
  }, [loadTransactions]);

  const displayedTransactions = transactions.filter((transaction) => {
    const search = searchQuery.trim().toLowerCase();
    if (!search) {
      return true;
    }

    return [
      transaction.transaction_id,
      transaction.account_id,
      transaction.transaction_type,
      String(transaction.amount),
      transaction.transaction_date,
    ].some((value) => value.toLowerCase().includes(search));
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="outline" className="rounded-xl" onClick={() => void loadTransactions()} disabled={isLoading}>
          <RefreshCcw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      <ReadOnlyRecordsPage
        badge="Transactions"
        title="Transaction Management"
        description="View transaction records fetched directly from the Flask backend."
        icon={ArrowRightLeft}
        totalRecords={transactions.length}
        displayedRecords={displayedTransactions}
        searchQuery={searchQuery}
        searchPlaceholder="Search by transaction ID, account ID, type, amount, or date"
        onSearchChange={setSearchQuery}
        columns={columns}
        isLoading={isLoading}
        error={error}
        onRetry={() => void loadTransactions()}
        emptyTitle="No transaction records available"
        emptyDescription="There are no rows in the Transactions table yet. Once records exist, they will appear here automatically."
        noResultsTitle="No matching transactions found"
        noResultsDescription="Try a different search term or clear the search box to see all transaction records."
        renderRowKey={(transaction) => transaction.transaction_id}
      />
    </div>
  );
}
