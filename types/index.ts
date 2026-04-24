export type ResourceRecord = Record<string, unknown>

export type ModalMode = "create" | "edit" | "view"

export interface ApiConfig {
  baseUrl: string
  authHeader: string
  idField: string
}
