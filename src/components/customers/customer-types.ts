export type Customer = {
  id: string;
  name: string;
  phone: string;
  address: string;
};

export type CustomerFormValues = Pick<Customer, "id" | "name" | "phone" | "address">;

export type CustomerFormErrors = Partial<Record<keyof CustomerFormValues, string>>;

export type CustomerSortKey = keyof CustomerFormValues;

export type SortDirection = "asc" | "desc";
