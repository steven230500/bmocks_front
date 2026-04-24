"use client"

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface Props {
  id: string | null
  onClose: () => void
  onConfirm: (id: string) => Promise<void>
}

export function DeleteConfirm({ id, onClose, onConfirm }: Props) {
  return (
    <Dialog open={!!id} onOpenChange={onClose}>
      <DialogContent aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Delete record</DialogTitle>
        </DialogHeader>
        <p className="text-muted-foreground py-4">
          Delete record <strong className="font-mono">{id}</strong>? This cannot be undone.
        </p>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={() => id && onConfirm(id)}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
