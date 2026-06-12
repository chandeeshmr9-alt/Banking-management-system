const BASE_URL = "http://localhost:5002/api";

export type TransactionApiRecord = {
  transaction_id: number | string;
  account_id: number | string;
  transaction_type: string;
  amount: number | string;
  transaction_date: string;
};

export type Transaction = {
  transaction_id: string;
  account_id: string;
  transaction_type: string;
  amount: number;
  transaction_date: string;
};

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

async function request<T>(path: string): Promise<ApiResponse<T>> {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  let body: ApiResponse<T> | null = null;

  try {
    body = (await response.json()) as ApiResponse<T>;
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

function normalizeAmount(value: number | string): number {
  return Number(value);
}

export function normalizeTransaction(record: TransactionApiRecord): Transaction {
  return {
    transaction_id: normalizeId(record.transaction_id),
    account_id: normalizeId(record.account_id),
    transaction_type: record.transaction_type,
    amount: normalizeAmount(record.amount),
    transaction_date: record.transaction_date,
  };
}

export async function getTransactions() {
  const response = await request<TransactionApiRecord[]>("/transactions");
  return response.data.map(normalizeTransaction);
}
