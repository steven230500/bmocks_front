export function buildUrl(baseUrl: string, resource: string, id?: string | number): string {
  const base = baseUrl.replace(/\/$/, "")
  return id !== undefined ? `${base}/${resource}/${id}` : `${base}/${resource}`
}

function isExternal(baseUrl: string): boolean {
  return /^https?:\/\//.test(baseUrl)
}

function proxyUrl(baseUrl: string, resource: string, id?: string | number): string {
  const path = id !== undefined ? `${resource}/${id}` : resource
  return `/api/proxy/${path}`
}

export async function apiFetch(
  url: string,
  options?: RequestInit,
  authHeader?: string,
  baseUrl?: string
): Promise<Response> {
  const headers: Record<string, string> = { "Content-Type": "application/json" }
  if (authHeader) headers["Authorization"] = authHeader

  if (baseUrl && isExternal(baseUrl)) {
    headers["x-proxy-target"] = baseUrl.replace(/\/$/, "")
    const path = url.replace(/^https?:\/\/[^/]+\//, "")
    const proxied = `/api/proxy/${path}`
    return fetch(proxied, { ...options, headers: { ...headers, ...(options?.headers ?? {}) } })
  }

  return fetch(url, { ...options, headers: { ...headers, ...(options?.headers ?? {}) } })
}
