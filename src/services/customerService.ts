export type CustomerApiRecord = {
  customer_id: number | string;
  name: string;
  phone: string;
  address: string;
};

export type CustomerPayload = {
  customer_id?: string;
  name: string;
  phone: string;
  address: string;
};

const BASE_URL = "http://localhost:5002/api";

export type CustomerServiceResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

async function request<T>(path: string, options?: RequestInit): Promise<CustomerServiceResponse<T>> {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers ?? {}),
    },
    ...options,
  });

  let body: CustomerServiceResponse<T> | null = null;

  try {
    body = (await response.json()) as CustomerServiceResponse<T>;
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

function formatCustomerId(customerId: number | string): string {
  const rawValue = String(customerId).trim();
  const numericPart = rawValue.replace(/\D/g, "");
  const numberValue = Number(numericPart || rawValue);

  if (Number.isFinite(numberValue) && numberValue > 0) {
    return `C${String(numberValue).padStart(3, "0")}`;
  }

  return rawValue.toUpperCase();
}

export function normalizeCustomer(record: CustomerApiRecord) {
  return {
    id: formatCustomerId(record.customer_id),
    name: record.name,
    phone: record.phone,
    address: record.address,
  };
}

export async function getCustomers() {
  const response = await request<CustomerApiRecord[]>("/customers");
  return response.data.map(normalizeCustomer);
}

export async function createCustomer(payload: CustomerPayload) {
  const response = await request<CustomerApiRecord>("/customers", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return normalizeCustomer(response.data);
}

export async function updateCustomer(customerId: string, payload: CustomerPayload) {
  const response = await request<CustomerApiRecord>(`/customers/${encodeURIComponent(customerId)}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });

  return normalizeCustomer(response.data);
}

export async function deleteCustomer(customerId: string) {
  const response = await request<CustomerApiRecord>(`/customers/${encodeURIComponent(customerId)}`, {
    method: "DELETE",
  });

  return normalizeCustomer(response.data);
}
