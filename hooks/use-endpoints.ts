"use client"

import useSWR from "swr"
import { useConfigStore } from "@/lib/config-store"
import { apiFetch } from "@/lib/api-client"

export interface Endpoint {
  method: string
  path: string
}

export interface EndpointGroup {
  resource: string
  endpoints: Endpoint[]
}

export function useEndpoints() {
  const { baseUrl, authHeader } = useConfigStore()

  const { data, error, isLoading } = useSWR<Endpoint[]>(
    baseUrl ? `${baseUrl.replace(/\/$/, "")}/endpoints` : null,
    async (url: string) => {
      const res = await apiFetch(url, undefined, authHeader, baseUrl)
      if (!res.ok) return []
      const json = await res.json()
      return Array.isArray(json) ? json : (json.endpoints ?? [])
    },
    { revalidateOnFocus: false }
  )

  const endpoints = data ?? []

  const groups: EndpointGroup[] = Object.values(
    endpoints.reduce<Record<string, EndpointGroup>>((acc, ep) => {
      const segment = ep.path.replace(/^\//, "").split("/")[0] || "root"
      if (!acc[segment]) acc[segment] = { resource: segment, endpoints: [] }
      acc[segment].endpoints.push(ep)
      return acc
    }, {})
  ).sort((a, b) => a.resource.localeCompare(b.resource))

  return {
    endpoints,
    groups,
    loading: isLoading,
    hasEndpoints: endpoints.length > 0,
    error: error?.message ?? null,
  }
}
