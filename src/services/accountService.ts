import type { AccountType } from "@/components/accounts/account-types";

export type AccountApiRecord = {
  account_id: number | string;
  customer_id: number | string;
  branch_id: number | string;
  account_type: string;
  balance: number | string;
};

export type AccountPayload = {
  account_id?: string;
  customer_id: string;
  branch_id: string;
  account_type: string;
  balance: string;
};

const BASE_URL = "http://localhost:5002/api";

export type AccountServiceResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type AccountRecord = {
  account_id: string;
  customer_id: string;
  branch_id: string;
  account_type: AccountType;
  balance: number;
};

async function request<T>(path: string, options?: RequestInit): Promise<AccountServiceResponse<T>> {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers ?? {}),
    },
    ...options,
  });

  let body: AccountServiceResponse<T> | null = null;

  try {
    body = (await response.json()) as AccountServiceResponse<T>;
  } catch {
    body = null;
  }

  if (!response.ok) {
    throw new Error(body?.message ?? `Request failed with status ${response.status}`);
  }

  if (!body) {
    throw new Error("The server returned an empty response");
  }

  return body;
}

function normalizeId(value: number | string): string {
  return String(value).trim();
}

function normalizeBalance(value: number | string): number {
  return Number(value);
}

export function normalizeAccount(record: AccountApiRecord): AccountRecord {
  return {
    account_id: normalizeId(record.account_id),
    customer_id: normalizeId(record.customer_id),
    branch_id: normalizeId(record.branch_id),
    account_type: record.account_type as AccountType,
    balance: normalizeBalance(record.balance),
  };
}

export async function getAccounts() {
  const response = await request<AccountApiRecord[]>("/accounts");
  return response.data.map(normalizeAccount);
}

export async function createAccount(payload: AccountPayload) {
  const response = await request<AccountApiRecord>("/accounts", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return normalizeAccount(response.data);
}

export async function updateAccount(accountId: string, payload: AccountPayload) {
  const response = await request<AccountApiRecord>(`/accounts/${encodeURIComponent(accountId)}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });

  return normalizeAccount(response.data);
}

export async function deleteAccount(accountId: string) {
  const response = await request<AccountApiRecord>(`/accounts/${encodeURIComponent(accountId)}`, {
    method: "DELETE",
  });

  return normalizeAccount(response.data);
}
