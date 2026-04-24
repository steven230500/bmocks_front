export function buildUrl(baseUrl: string, resource: string, id?: string | number): string {
  const base = baseUrl.replace(/\/$/, "")
  return id !== undefined ? `${base}/${resource}/${id}` : `${base}/${resource}`
}

export async function apiFetch(
  url: string,
  options?: RequestInit,
  authHeader?: string
): Promise<Response> {
  const headers: HeadersInit = { "Content-Type": "application/json" }
  if (authHeader) headers["Authorization"] = authHeader

  return fetch(url, {
    ...options,
    headers: { ...headers, ...(options?.headers ?? {}) },
  })
}
