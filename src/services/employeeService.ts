const BASE_URL = "http://localhost:5002/api";

export type EmployeeApiRecord = {
  employee_id: number | string;
  name: string;
  branch_id: number | string;
  role: string;
};

export type Employee = {
  employee_id: string;
  name: string;
  branch_id: string;
  role: string;
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

export function normalizeEmployee(record: EmployeeApiRecord): Employee {
  return {
    employee_id: normalizeId(record.employee_id),
    name: record.name,
    branch_id: normalizeId(record.branch_id),
    role: record.role,
  };
}

export async function getEmployees() {
  const response = await request<EmployeeApiRecord[]>("/employees");
  return response.data.map(normalizeEmployee);
}
