"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Eye, Pencil, Plus, RefreshCw, Trash2 } from "lucide-react"
import type { ResourceRecord } from "@/types"

interface Props {
  data: ResourceRecord[]
  loading: boolean
  getItemId: (item: ResourceRecord) => string | number
  onView: (item: ResourceRecord) => void
  onEdit: (item: ResourceRecord) => void
  onDelete: (item: ResourceRecord) => void
  onCreateFirst: () => void
}

export function ResourceTable({
  data,
  loading,
  getItemId,
  onView,
  onEdit,
  onDelete,
  onCreateFirst,
}: Props) {
  if (loading) {
    return (
      <Card>
        <CardContent className="py-16 text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
          <p className="mt-4 text-muted-foreground">Loading…</p>
        </CardContent>
      </Card>
    )
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardContent className="py-16 text-center">
          <p className="text-muted-foreground">No records found</p>
          <Button className="mt-4" onClick={onCreateFirst}>
            <Plus className="h-4 w-4 mr-2" />
            Create first record
          </Button>
        </CardContent>
      </Card>
    )
  }

  const columns = Object.keys(data[0]).slice(0, 6)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-medium">
          {data.length} record{data.length !== 1 && "s"}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((col) => (
                  <TableHead key={col}>{col}</TableHead>
                ))}
                <TableHead className="w-[120px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item, idx) => (
                <TableRow key={String(getItemId(item)) || idx}>
                  {columns.map((col) => (
                    <TableCell key={col} className="max-w-[200px] truncate">
                      {typeof item[col] === "object"
                        ? JSON.stringify(item[col])
                        : String(item[col] ?? "-")}
                    </TableCell>
                  ))}
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => onView(item)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => onEdit(item)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => onDelete(item)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
