"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { borrowInterface } from "@/app/types/borrow.type"
import {
  HandHelping,
  Package,
  User,
  UserRound,
  BookOpen,
  Calendar,
  Clock,
} from "lucide-react"

interface ViewBorrowModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  borrow: borrowInterface | null
}

export function ViewBorrowModal({ open, onOpenChange, borrow }: ViewBorrowModalProps) {
  if (!borrow) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <HandHelping className="h-5 w-5 text-blue-500" />
            Borrow Details
          </DialogTitle>
          <DialogDescription>
            Information about this borrow record.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Asset Info Card */}
          <div className="rounded-lg border bg-muted/30 p-3.5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10">
                <Package className="h-5 w-5 text-blue-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{borrow.assetName}</p>
                <p className="text-xs text-muted-foreground font-mono">{borrow.assetQr}</p>
              </div>
            </div>
          </div>

          {/* Student Info */}
          <div className="rounded-lg border divide-y">
            <div className="flex items-center justify-between px-3.5 py-2.5">
              <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" />
                Student Name
              </span>
              <span className="text-sm font-medium">{borrow.studentName}</span>
            </div>
            <div className="flex items-center justify-between px-3.5 py-2.5">
              <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                <UserRound className="h-3.5 w-3.5" />
                Student ID
              </span>
              <span className="text-sm font-medium">{borrow.studentd}</span>
            </div>
            <div className="flex items-center justify-between px-3.5 py-2.5">
              <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5" />
                Section
              </span>
              <span className="text-sm font-medium">{borrow.studentSection}</span>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border p-3">
              <div className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                <Calendar className="h-3 w-3" />
                Borrowed
              </div>
              <p className="text-sm font-medium">{borrow.borrowDate}</p>
              <p className="text-xs text-muted-foreground">{borrow.borrowTime}</p>
            </div>
            <div className="rounded-lg border p-3">
              <div className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                <Clock className="h-3 w-3" />
                Returned
              </div>
              {borrow.returnDate ? (
                <>
                  <p className="text-sm font-medium">{borrow.returnDate}</p>
                  <p className="text-xs text-muted-foreground">{borrow.returnTime}</p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground italic">Not returned</p>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
