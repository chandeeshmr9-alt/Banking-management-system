import * as React from "react";
import { RefreshCcw, UserRound } from "lucide-react";
import ReadOnlyRecordsPage, { type ReadOnlyColumn } from "@/components/read-only/ReadOnlyRecordsPage";
import { Button } from "@/components/ui/button";
import { getEmployees, type Employee } from "@/services/employeeService";

const columns: ReadOnlyColumn<Employee>[] = [
  { key: "employee_id", label: "Employee ID", render: (employee) => employee.employee_id },
  { key: "name", label: "Name", render: (employee) => employee.name },
  { key: "branch_id", label: "Branch ID", render: (employee) => employee.branch_id },
  { key: "role", label: "Role", render: (employee) => employee.role },
];

export default function Employees() {
  const [employees, setEmployees] = React.useState<Employee[]>([]);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const loadEmployees = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      setEmployees(await getEmployees());
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Failed to load employees");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void loadEmployees();
  }, [loadEmployees]);

  const displayedEmployees = employees.filter((employee) => {
    const search = searchQuery.trim().toLowerCase();
    if (!search) {
      return true;
    }

    return [employee.employee_id, employee.name, employee.branch_id, employee.role].some((value) =>
      value.toLowerCase().includes(search),
    );
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="outline" className="rounded-xl" onClick={() => void loadEmployees()} disabled={isLoading}>
          <RefreshCcw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      <ReadOnlyRecordsPage
        badge="Employees"
        title="Employee Management"
        description="View employee records fetched directly from the Flask backend."
        icon={UserRound}
        totalRecords={employees.length}
        displayedRecords={displayedEmployees}
        searchQuery={searchQuery}
        searchPlaceholder="Search by employee ID, name, branch ID, or role"
        onSearchChange={setSearchQuery}
        columns={columns}
        isLoading={isLoading}
        error={error}
        onRetry={() => void loadEmployees()}
        emptyTitle="No employee records available"
        emptyDescription="There are no rows in the Employee table yet. Once records exist, they will appear here automatically."
        noResultsTitle="No matching employees found"
        noResultsDescription="Try a different search term or clear the search box to see all employee records."
        renderRowKey={(employee) => employee.employee_id}
      />
    </div>
  );
}
