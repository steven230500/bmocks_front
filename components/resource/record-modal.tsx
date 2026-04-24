"use client"

import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type { ModalMode, ResourceRecord } from "@/types"

interface Props {
  open: boolean
  mode: ModalMode
  item: ResourceRecord | null
  onClose: () => void
  onSave: (body: ResourceRecord) => Promise<void>
}

const TITLES: Record<ModalMode, string> = {
  create: "Create record",
  edit: "Edit record",
  view: "View record",
}

export function RecordModal({ open, mode, item, onClose, onSave }: Props) {
  const [json, setJson] = useState("")
  const [saving, setSaving] = useState(false)
  const [parseError, setParseError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setJson(item ? JSON.stringify(item, null, 2) : "{\n  \n}")
      setParseError(null)
    }
  }, [open, item])

  async function handleSave() {
    try {
      const body = JSON.parse(json)
      setSaving(true)
      await onSave(body)
    } catch (err) {
      setParseError(err instanceof Error ? err.message : "Invalid JSON")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{TITLES[mode]}</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-2">
          <textarea
            className="w-full h-80 font-mono text-sm p-4 rounded-lg border border-input bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring"
            value={json}
            onChange={(e) => {
              setJson(e.target.value)
              setParseError(null)
            }}
            readOnly={mode === "view"}
          />
          {parseError && (
            <p className="text-xs text-destructive font-mono">{parseError}</p>
          )}
        </div>
        {mode !== "view" && (
          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving…" : mode === "create" ? "Create" : "Save"}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}
