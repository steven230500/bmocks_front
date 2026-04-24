"use client"

import { useParams, useRouter } from "next/navigation"
import { useState } from "react"
import { useResource } from "@/hooks/use-resource"
import { useConfigStore } from "@/lib/config-store"
import { ResourceTable } from "@/components/resource/resource-table"
import { RecordModal } from "@/components/resource/record-modal"
import { DeleteConfirm } from "@/components/resource/delete-confirm"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Plus, RefreshCw } from "lucide-react"
import type { ModalMode, ResourceRecord } from "@/types"

export default function ResourcePage() {
  const params = useParams()
  const router = useRouter()
  const resource = params.resource as string
  const { baseUrl } = useConfigStore()

  const { data, error, loading, refresh, getItemId, create, update, remove } =
    useResource(resource)

  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<ModalMode>("create")
  const [currentItem, setCurrentItem] = useState<ResourceRecord | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  function openCreate() {
    setModalMode("create")
    setCurrentItem(null)
    setModalOpen(true)
  }

  function openEdit(item: ResourceRecord) {
    setModalMode("edit")
    setCurrentItem(item)
    setModalOpen(true)
  }

  function openView(item: ResourceRecord) {
    setModalMode("view")
    setCurrentItem(item)
    setModalOpen(true)
  }

  async function handleSave(body: ResourceRecord) {
    if (modalMode === "create") await create(body)
    else if (modalMode === "edit" && currentItem) await update(currentItem, body)
    setModalOpen(false)
  }

  async function handleDelete(id: string) {
    await remove(id)
    setDeleteId(null)
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-semibold">/{resource}</h1>
            <p className="text-sm text-muted-foreground font-mono">
              {baseUrl}/{resource}
            </p>
          </div>
          <Button variant="outline" size="icon" onClick={refresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Create
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {error ? (
          <Card className="border-destructive">
            <CardContent className="py-8 text-center space-y-4">
              <p className="text-destructive font-mono text-sm">{error}</p>
              <Button variant="outline" onClick={() => router.push("/")}>
                Configure API
              </Button>
            </CardContent>
          </Card>
        ) : (
          <ResourceTable
            data={data}
            loading={loading}
            getItemId={getItemId}
            onView={openView}
            onEdit={openEdit}
            onDelete={(item) => setDeleteId(String(getItemId(item)))}
            onCreateFirst={openCreate}
          />
        )}
      </main>

      <RecordModal
        open={modalOpen}
        mode={modalMode}
        item={currentItem}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
      />

      <DeleteConfirm
        id={deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
      />
    </div>
  )
}
