"use client"

import useSWR from "swr"
import { useConfigStore } from "@/lib/config-store"
import { buildUrl, apiFetch } from "@/lib/api-client"
import type { ResourceRecord } from "@/types"

function normalizeResponse(json: unknown, resource?: string): ResourceRecord[] {
  if (Array.isArray(json)) return json
  if (json && typeof json === "object") {
    const obj = json as Record<string, unknown>
    const candidates = ["data", "items", "results", ...(resource ? [resource] : [])]
    for (const key of candidates) {
      if (Array.isArray(obj[key])) return obj[key] as ResourceRecord[]
    }
    return [obj]
  }
  return []
}

export function useResource(resource: string) {
  const { baseUrl, authHeader, idField } = useConfigStore()

  const fetchUrl = baseUrl ? buildUrl(baseUrl, resource) : null

  const { data, error, isLoading, mutate } = useSWR<ResourceRecord[]>(
    fetchUrl,
    async (url: string) => {
      const res = await apiFetch(url, undefined, authHeader)
      if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`)
      return normalizeResponse(await res.json(), resource)
    }
  )

  function getItemId(item: ResourceRecord): string | number {
    return (item[idField] ?? item["id"] ?? item["_id"] ?? item["ID"]) as string | number
  }

  async function create(body: ResourceRecord) {
    if (!baseUrl) throw new Error("No base URL configured")
    const res = await apiFetch(
      buildUrl(baseUrl, resource),
      { method: "POST", body: JSON.stringify(body) },
      authHeader
    )
    if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`)
    await mutate()
  }

  async function update(item: ResourceRecord, body: ResourceRecord) {
    if (!baseUrl) throw new Error("No base URL configured")
    const id = getItemId(item)
    const url = buildUrl(baseUrl, resource, id)
    const payload = { body: JSON.stringify(body) }

    let res = await apiFetch(url, { method: "PUT", ...payload }, authHeader)
    // fall back to PATCH if server doesn't support PUT
    if (res.status === 405) {
      res = await apiFetch(url, { method: "PATCH", ...payload }, authHeader)
    }
    if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`)
    await mutate()
  }

  async function remove(id: string | number) {
    if (!baseUrl) throw new Error("No base URL configured")
    const res = await apiFetch(
      buildUrl(baseUrl, resource, id),
      { method: "DELETE" },
      authHeader
    )
    if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`)
    await mutate()
  }

  return {
    data: data ?? [],
    error: error?.message ?? (!baseUrl ? "No base URL configured" : null),
    loading: isLoading,
    refresh: () => mutate(),
    getItemId,
    create,
    update,
    remove,
  }
}
