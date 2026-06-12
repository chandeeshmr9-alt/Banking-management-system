export type Card = {
  card_id: number;
  account_id: number;
  card_number: string;
  card_type: "Debit" | "Credit";
  expiry_date: string;
  cvv: string;
  status: "Active" | "Blocked" | "Expired";
};

export type CardPayload = {
  account_id: number;
  card_number: string;
  card_type: "Debit" | "Credit";
  expiry_date: string;
  cvv: string;
  status?: "Active" | "Blocked" | "Expired";
};

const BASE_URL = "http://localhost:5002/api/cards";

export type CardServiceResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

async function request<T>(path: string = "", options?: RequestInit): Promise<CardServiceResponse<T>> {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers ?? {}),
    },
    ...options,
  });

  let body: CardServiceResponse<T> | null = null;
  try {
    body = (await response.json()) as CardServiceResponse<T>;
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

export async function getCards() {
  const response = await request<Card[]>();
  return response.data;
}

export async function createCard(payload: CardPayload) {
  const response = await request<Card>("", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return response.data;
}

export async function updateCard(cardId: number, payload: Partial<CardPayload>) {
  const response = await request<Card>(`/${cardId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return response.data;
}

export async function deleteCard(cardId: number) {
  const response = await request<Card>(`/${cardId}`, {
    method: "DELETE",
  });
  return response.data;
}
