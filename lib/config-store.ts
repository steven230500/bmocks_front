"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

interface ConfigState {
  baseUrl: string
  authHeader: string
  idField: string
  setBaseUrl: (url: string) => void
  setAuthHeader: (header: string) => void
  setIdField: (field: string) => void
}

export const useConfigStore = create<ConfigState>()(
  persist(
    (set) => ({
      baseUrl: "https://bmocks.com",
      authHeader: "",
      idField: "id",
      setBaseUrl: (url) => set({ baseUrl: url.replace(/\/$/, "") }),
      setAuthHeader: (header) => set({ authHeader: header }),
      setIdField: (field) => set({ idField: field }),
    }),
    {
      name: "api-config",
      version: 1,
      migrate(persisted) {
        const s = (persisted ?? {}) as Partial<ConfigState>
        return {
          baseUrl: s.baseUrl ?? "https://bmocks.com",
          authHeader: s.authHeader ?? "",
          idField: s.idField ?? "id",
        }
      },
    }
  )
)
