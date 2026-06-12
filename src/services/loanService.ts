const BASE_URL = "http://localhost:5002/api";

export type LoanApiRecord = {
  loan_id: number | string;
  customer_id: number | string;
  amount: number | string;
  loan_type: string;
  status: string;
};

export type Loan = {
  loan_id: string;
  customer_id: string;
  amount: number;
  loan_type: string;
  status: string;
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

export function normalizeLoan(record: LoanApiRecord): Loan {
  return {
    loan_id: normalizeId(record.loan_id),
    customer_id: normalizeId(record.customer_id),
    amount: normalizeAmount(record.amount),
    loan_type: record.loan_type,
    status: record.status,
  };
}

export async function getLoans() {
  const response = await request<LoanApiRecord[]>("/loans");
  return response.data.map(normalizeLoan);
}

export async function approveLoan(loanId: string) {
  const response = await fetch(`${BASE_URL}/loans/${loanId}/approve`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Approval failed");
  return data;
}
