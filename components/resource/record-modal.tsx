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
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import type { ModalMode, ResourceRecord } from "@/types"

// ---------------------------------------------------------------------------
// Template helpers
// ---------------------------------------------------------------------------

function makeTemplate(record: ResourceRecord): ResourceRecord {
  const out: ResourceRecord = {}
  for (const [k, v] of Object.entries(record)) {
    if (k === "id") continue
    if (typeof v === "string") out[k] = ""
    else if (typeof v === "number") out[k] = 0
    else if (typeof v === "boolean") out[k] = false
    else if (v === null) out[k] = null
    else if (Array.isArray(v)) out[k] = []
    else if (typeof v === "object") out[k] = makeTemplate(v as ResourceRecord)
    else out[k] = ""
  }
  return out
}

// ---------------------------------------------------------------------------
// Form field renderer (recursive)
// ---------------------------------------------------------------------------

function FieldEditor({
  value,
  onChange,
  depth = 0,
}: {
  value: unknown
  onChange: (v: unknown) => void
  depth?: number
}) {
  if (typeof value === "boolean") {
    return (
      <Switch
        checked={value}
        onCheckedChange={onChange}
        className="data-[state=checked]:bg-primary"
      />
    )
  }

  if (typeof value === "number") {
    return (
      <Input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-8 text-sm font-mono"
      />
    )
  }

  if (Array.isArray(value)) {
    return (
      <textarea
        value={JSON.stringify(value, null, 2)}
        onChange={(e) => {
          try {
            onChange(JSON.parse(e.target.value))
          } catch {
            // keep editing
          }
        }}
        className="w-full h-24 font-mono text-xs p-2 border rounded-md resize-none bg-background focus:outline-none focus:ring-2 focus:ring-ring"
      />
    )
  }

  if (value !== null && typeof value === "object") {
    const obj = value as ResourceRecord
    return (
      <div
        className={`border rounded-lg divide-y ${depth > 0 ? "bg-muted/20" : "bg-background"}`}
      >
        {Object.entries(obj).map(([k, v]) => (
          <FormRow
            key={k}
            fieldKey={k}
            value={v}
            onChange={(newV) => onChange({ ...obj, [k]: newV })}
            depth={depth + 1}
          />
        ))}
      </div>
    )
  }

  return (
    <Input
      value={value === null || value === undefined ? "" : String(value)}
      onChange={(e) => onChange(e.target.value === "" ? null : e.target.value)}
      className="h-8 text-sm"
      placeholder="null"
    />
  )
}

function FormRow({
  fieldKey,
  value,
  onChange,
  depth = 0,
}: {
  fieldKey: string
  value: unknown
  onChange: (v: unknown) => void
  depth?: number
}) {
  const isObject =
    value !== null && typeof value === "object" && !Array.isArray(value)

  if (isObject) {
    return (
      <div className="space-y-2 py-3 px-3">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-semibold text-foreground/70">
            {fieldKey}
          </span>
          <div className="h-px flex-1 bg-border" />
        </div>
        <FieldEditor value={value} onChange={onChange} depth={depth} />
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3 py-2.5 px-3">
      <span
        className="font-mono text-xs text-muted-foreground flex-shrink-0"
        style={{ width: "38%" }}
        title={fieldKey}
      >
        {fieldKey}
      </span>
      <div className="flex-1 min-w-0">
        <FieldEditor value={value} onChange={onChange} depth={depth} />
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Modal
// ---------------------------------------------------------------------------

interface Props {
  open: boolean
  mode: ModalMode
  item: ResourceRecord | null
  templateRecord?: ResourceRecord
  onClose: () => void
  onSave: (body: ResourceRecord) => Promise<void>
}

const TITLES: Record<ModalMode, string> = {
  create: "Create record",
  edit: "Edit record",
  view: "View record",
}

export function RecordModal({ open, mode, item, templateRecord, onClose, onSave }: Props) {
  const [formData, setFormData] = useState<ResourceRecord>({})
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setSaveError(null)

    if (mode === "create") {
      setFormData(templateRecord ? makeTemplate(templateRecord) : {})
    } else if (item) {
      setFormData(item)
    }
  }, [open, mode, item, templateRecord])

  async function handleSave() {
    try {
      setSaving(true)
      await onSave(formData)
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Error saving")
    } finally {
      setSaving(false)
    }
  }

  const isEmpty = Object.keys(formData).length === 0

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-xl max-h-[85vh] flex flex-col" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>{TITLES[mode]}</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-2 min-h-0">
          {mode === "view" ? (
            <pre className="font-mono text-xs p-4 rounded-lg border bg-muted/40 overflow-x-auto whitespace-pre-wrap break-words">
              {JSON.stringify(item, null, 2)}
            </pre>
          ) : isEmpty ? (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">
                No existing records to derive structure from. Paste raw JSON:
              </p>
              <textarea
                className="w-full h-64 font-mono text-sm p-4 rounded-lg border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder={'{\n  "name": "example"\n}'}
                onChange={(e) => {
                  try {
                    setFormData(JSON.parse(e.target.value))
                  } catch {
                    // keep typing
                  }
                }}
              />
            </div>
          ) : (
            <div className="border rounded-lg divide-y">
              {Object.entries(formData).map(([k, v]) => (
                <FormRow
                  key={k}
                  fieldKey={k}
                  value={v}
                  onChange={(newV) => setFormData((prev) => ({ ...prev, [k]: newV }))}
                />
              ))}
            </div>
          )}
        </div>

        {saveError && (
          <p className="text-xs text-destructive font-mono px-1">{saveError}</p>
        )}

        {mode !== "view" && (
          <DialogFooter className="pt-2">
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
