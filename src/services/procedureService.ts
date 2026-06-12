const BASE_URL = "http://localhost:5002/api";

export type TransferFundsPayload = {
  from_account_id: string;
  to_account_id: string;
  amount: string;
};

export type TransferFundsTransaction = {
  transaction_id: number;
  account_id: number;
  transaction_type: "Withdrawal" | "Deposit" | "Transfer" | "Interest";
  amount: number;
  transaction_date: string;
};

export type TransferFundsAccount = {
  account_id: number;
  customer_id: number;
  branch_id: number;
  account_type: string;
  balance: number;
};

export type TransferFundsResult = {
  transfer_amount: number;
  sender_before: TransferFundsAccount;
  sender_after: TransferFundsAccount;
  receiver_before: TransferFundsAccount;
  receiver_after: TransferFundsAccount;
  transactions: TransferFundsTransaction[];
};

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

async function request<T>(path: string, options?: RequestInit): Promise<ApiResponse<T>> {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers ?? {}),
    },
    ...options,
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

export async function transferFunds(payload: TransferFundsPayload) {
  const response = await request<TransferFundsResult>("/procedures/transfer-funds", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return response.data;
}
