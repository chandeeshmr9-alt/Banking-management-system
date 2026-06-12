import * as React from "react";
import { Building2, RefreshCcw } from "lucide-react";
import ReadOnlyRecordsPage, { type ReadOnlyColumn } from "@/components/read-only/ReadOnlyRecordsPage";
import { Button } from "@/components/ui/button";
import { getBranches, type Branch } from "@/services/branchService";

const columns: ReadOnlyColumn<Branch>[] = [
  { key: "branch_id", label: "Branch ID", render: (branch) => branch.branch_id },
  { key: "branch_name", label: "Branch Name", render: (branch) => branch.branch_name },
  { key: "location", label: "Location", render: (branch) => branch.location },
];

export default function Branches() {
  const [branches, setBranches] = React.useState<Branch[]>([]);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const loadBranches = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      setBranches(await getBranches());
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Failed to load branches");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void loadBranches();
  }, [loadBranches]);

  const displayedBranches = branches.filter((branch) => {
    const search = searchQuery.trim().toLowerCase();
    if (!search) {
      return true;
    }

    return [branch.branch_id, branch.branch_name, branch.location].some((value) =>
      value.toLowerCase().includes(search),
    );
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="outline" className="rounded-xl" onClick={() => void loadBranches()} disabled={isLoading}>
          <RefreshCcw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      <ReadOnlyRecordsPage
        badge="Branches"
        title="Branch Management"
        description="View bank branch records fetched directly from the Flask backend."
        icon={Building2}
        totalRecords={branches.length}
        displayedRecords={displayedBranches}
        searchQuery={searchQuery}
        searchPlaceholder="Search by branch ID, branch name, or location"
        onSearchChange={setSearchQuery}
        columns={columns}
        isLoading={isLoading}
        error={error}
        onRetry={() => void loadBranches()}
        emptyTitle="No branch records available"
        emptyDescription="There are no rows in the Branch table yet. Once records exist, they will appear here automatically."
        noResultsTitle="No matching branches found"
        noResultsDescription="Try a different search term or clear the search box to see all branch records."
        renderRowKey={(branch) => branch.branch_id}
      />
    </div>
  );
}
