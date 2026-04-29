"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Checkbox } from "@/components/ui/checkbox"
import { ClipboardCopy, Check, Copy, Eye, Pencil, Plus, Trash2, X } from "lucide-react"
import type { ResourceRecord } from "@/types"

interface Props {
  data: ResourceRecord[]
  loading: boolean
  getItemId: (item: ResourceRecord) => string | number
  onView: (item: ResourceRecord) => void
  onEdit: (item: ResourceRecord) => void
  onDelete: (item: ResourceRecord) => void
  onDuplicate: (item: ResourceRecord) => void
  onCreateFirst: () => void
}

function CellValue({ value }: { value: unknown }) {
  if (value === null || value === undefined) {
    return <span className="text-muted-foreground/40 text-xs">—</span>
  }
  if (typeof value === "boolean") {
    return (
      <Badge variant={value ? "default" : "secondary"} className="text-xs font-mono">
        {value ? "true" : "false"}
      </Badge>
    )
  }
  if (typeof value === "object") {
    return (
      <span className="text-xs font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
        {"{…}"}
      </span>
    )
  }
  const str = String(value)

  if (/^\d{4}-\d{2}-\d{2}T/.test(str)) {
    const d = new Date(str)
    return (
      <span className="text-xs tabular-nums text-muted-foreground">
        {d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
      </span>
    )
  }

  if (str.length > 40) {
    return (
      <span className="text-sm" title={str}>
        {str.slice(0, 38)}
        <span className="text-muted-foreground">…</span>
      </span>
    )
  }

  return <span className="text-sm">{str}</span>
}

function ColumnHeader({ name }: { name: string }) {
  return (
    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
      {name.replace(/_/g, " ")}
    </span>
  )
}

export function ResourceTable({
  data,
  loading,
  getItemId,
  onView,
  onEdit,
  onDelete,
  onDuplicate,
  onCreateFirst,
}: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [copied, setCopied] = useState(false)

  const toggleOne = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }, [])

  const toggleAll = useCallback(() => {
    setSelected((prev) =>
      prev.size === data.length
        ? new Set()
        : new Set(data.map((item) => String(getItemId(item))))
    )
  }, [data, getItemId])

  const clearSelection = useCallback(() => setSelected(new Set()), [])

  const copyAsJson = useCallback(() => {
    const items = data.filter((item) => selected.has(String(getItemId(item))))
    const text = JSON.stringify(items.length === 1 ? items[0] : items, null, 2)
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [data, selected, getItemId])

  if (loading) {
    return (
      <Card>
        <CardContent className="p-0">
          <div className="px-6 py-4 border-b">
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="divide-y">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="px-6 py-4 flex gap-4">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardContent className="py-20 text-center space-y-3">
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto">
            <Plus className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground text-sm">No records yet</p>
          <Button onClick={onCreateFirst} size="sm">
            Create first record
          </Button>
        </CardContent>
      </Card>
    )
  }

  const allKeys = Object.keys(data[0])
  const primitiveKeys = allKeys.filter((k) => typeof data[0][k] !== "object")
  const objectKeys = allKeys.filter((k) => typeof data[0][k] === "object")
  const columns = [...primitiveKeys, ...objectKeys].slice(0, 7)

  const allSelected = selected.size === data.length
  const someSelected = selected.size > 0 && !allSelected

  return (
    <div className="space-y-2">
      {/* Selection toolbar */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 px-4 py-2.5 bg-primary/5 border border-primary/20 rounded-lg">
          <span className="text-sm font-medium text-foreground">
            {selected.size} selected
          </span>
          <div className="flex-1" />
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-2"
            onClick={copyAsJson}
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-green-600" />
                <span className="text-green-600">Copied!</span>
              </>
            ) : (
              <>
                <ClipboardCopy className="h-3.5 w-3.5" />
                Copy as JSON
              </>
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground"
            onClick={clearSelection}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}

      <Card className="overflow-hidden">
        <div className="px-4 sm:px-6 py-3 border-b bg-muted/30 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{data.length}</span>{" "}
            record{data.length !== 1 && "s"}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="px-3 sm:px-5 py-3 w-10">
                  <Checkbox
                    checked={allSelected}
                    ref={(el) => {
                      if (el) (el as HTMLButtonElement & { indeterminate?: boolean }).indeterminate = someSelected
                    }}
                    onCheckedChange={toggleAll}
                    aria-label="Select all"
                  />
                </th>
                {columns.map((col) => (
                  <th key={col} className="px-3 sm:px-5 py-3 text-left font-normal">
                    <ColumnHeader name={col} />
                  </th>
                ))}
                <th className="px-3 sm:px-5 py-3 text-right">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Actions
                  </span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {data.map((item, idx) => {
                const id = String(getItemId(item))
                const isSelected = selected.has(id)
                return (
                  <tr
                    key={id || idx}
                    className={`transition-colors group ${isSelected ? "bg-primary/5" : "hover:bg-muted/40"}`}
                  >
                    <td className="px-3 sm:px-5 py-3 sm:py-3.5 w-10">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleOne(id)}
                        aria-label={`Select record ${id}`}
                      />
                    </td>
                    {columns.map((col) => (
                      <td key={col} className="px-3 sm:px-5 py-3 sm:py-3.5 max-w-[140px] sm:max-w-[220px]">
                        <CellValue value={item[col]} />
                      </td>
                    ))}
                    <td className="px-3 sm:px-5 py-3 sm:py-3.5">
                      <div className="flex gap-0.5 justify-end sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => onView(item)}
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => onEdit(item)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => onDuplicate(item)}
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => onDelete(item)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
