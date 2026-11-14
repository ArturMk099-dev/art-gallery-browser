import type { DepartmentsResponse } from "../types/department";
export async function getDepartments(signal?: AbortSignal) {
  const url = new URL("https://api.artic.edu/api/v1/departments");
  url.searchParams.set("limit", "100");
  url.searchParams.set("fields", "id,title");
  const response = await fetch(url, {
    referrerPolicy: "no-referrer",
    signal: signal,
  });
  if (!response.ok) throw new Error("Failed to load departments");
  const result: DepartmentsResponse = await response.json();
  return result;
}
