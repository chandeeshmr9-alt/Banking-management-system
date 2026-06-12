const BASE_URL = "http://localhost:5002/api";

export type TriggerPayload = {
  account_id: string;
  amount: string;
};

export type TriggerTransaction = {
  transaction_id: number;
  account_id: number;
  transaction_type: "Deposit" | "Withdrawal" | "Transfer" | "Interest";
  amount: number;
  transaction_date: string;
};

export type TriggerResult = {
  account_id: number;
  transaction_type: "Deposit" | "Withdrawal";
  transaction_status: "Success" | "Failed";
  amount: number;
  old_balance: number;
  new_balance: number;
  transaction: TriggerTransaction | null;
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

export async function depositFunds(payload: TriggerPayload) {
  return request<TriggerResult>("/triggers/deposit", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function withdrawFunds(payload: TriggerPayload) {
  return request<TriggerResult>("/triggers/withdraw", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
