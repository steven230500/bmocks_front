export interface MockItem {
  id: string
  data: Record<string, unknown>
}

interface MockResource {
  items: Map<string, MockItem>
}

class MockStore {
  private resources = new Map<string, MockResource>()

  getResource(name: string) {
    return this.resources.get(name)
  }

  createResource(name: string) {
    if (!this.resources.has(name)) {
      this.resources.set(name, { items: new Map() })
    }
    return this.resources.get(name)!
  }

  listResources(): string[] {
    return Array.from(this.resources.keys())
  }

  getItems(resourceName: string): MockItem[] {
    return Array.from(this.resources.get(resourceName)?.items.values() ?? [])
  }

  getItem(resourceName: string, id: string): MockItem | null {
    return this.resources.get(resourceName)?.items.get(id) ?? null
  }

  addItem(resourceName: string, data: Record<string, unknown>): MockItem {
    const resource = this.createResource(resourceName)
    const id = data.id ? String(data.id) : crypto.randomUUID()
    const item: MockItem = { id, data: { ...data, id } }
    resource.items.set(id, item)
    return item
  }

  importItems(resourceName: string, items: Record<string, unknown>[]): MockItem[] {
    return items.map((item) => this.addItem(resourceName, item))
  }

  updateItem(resourceName: string, id: string, data: Record<string, unknown>): MockItem | null {
    const resource = this.resources.get(resourceName)
    if (!resource?.items.has(id)) return null
    const item: MockItem = { id, data: { ...data, id } }
    resource.items.set(id, item)
    return item
  }

  deleteItem(resourceName: string, id: string): boolean {
    return this.resources.get(resourceName)?.items.delete(id) ?? false
  }

  clearItems(resourceName: string) {
    this.resources.get(resourceName)?.items.clear()
  }
}

// Singleton that survives Next.js hot-reload in dev
const g = globalThis as unknown as { __mockStore: MockStore }
export const mockStore = g.__mockStore ?? new MockStore()
if (process.env.NODE_ENV !== "production") g.__mockStore = mockStore
