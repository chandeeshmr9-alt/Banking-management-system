export type AccountType = "Savings" | "Current" | "Salary" | "Fixed Deposit";

export type Account = {
  account_id: string;
  customer_id: string;
  branch_id: string;
  account_type: AccountType;
  balance: number;
};

export type AccountFormValues = {
  account_id: string;
  customer_id: string;
  branch_id: string;
  account_type: AccountType | "";
  balance: string;
};

export type AccountFormErrors = Partial<Record<keyof AccountFormValues, string>>;

export type AccountSortKey = keyof AccountFormValues;

export type SortDirection = "asc" | "desc";
