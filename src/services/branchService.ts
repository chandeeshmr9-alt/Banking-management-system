const BASE_URL = "http://localhost:5002/api";

export type BranchApiRecord = {
  branch_id: number | string;
  branch_name: string;
  location: string;
};

export type Branch = {
  branch_id: string;
  branch_name: string;
  location: string;
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

export function normalizeBranch(record: BranchApiRecord): Branch {
  return {
    branch_id: normalizeId(record.branch_id),
    branch_name: record.branch_name,
    location: record.location,
  };
}

export async function getBranches() {
  const response = await request<BranchApiRecord[]>("/branches");
  return response.data.map(normalizeBranch);
}
