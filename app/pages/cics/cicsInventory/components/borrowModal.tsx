"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import axiosInstance from "@/app/utils/axios"
import { assetsInterface } from "@/app/types/asset.type"
import {
  AlertCircle,
  Loader2,
  Package,
  HandHelping,
  User,
  UserRound,
  BookOpen,
} from "lucide-react"
import { successAlert } from "@/app/utils/alert"

interface BorrowModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  asset: assetsInterface | null
  onSuccess?: () => void
}

export function BorrowModal({ open, onOpenChange, asset, onSuccess }: BorrowModalProps) {
  const [studentName, setStudentName] = useState("")
  const [studentd, setStudentd] = useState("")
  const [studentSection, setStudentSection] = useState("")
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState("")

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setStudentName("")
      setStudentd("")
      setStudentSection("")
      setSaveError("")
    }
  }, [open])

  if (!asset) return null

  const handleSubmit = async () => {
    if (!studentName.trim() || !studentd.trim() || !studentSection.trim()) {
      setSaveError("Please fill in all student details.")
      return
    }

    setSaving(true)
    setSaveError("")

    try {
      await axiosInstance.post("/system/borrow", {
        studentName,
        studentd,
        studentSection,
        assetId: asset._id,
        assetName: asset.name,
        assetQr: asset.qr,
      })

      successAlert("Asset borrowed successfully")
      onSuccess?.()
      onOpenChange(false)
    } catch {
      setSaveError("Failed to create borrow record. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <HandHelping className="h-5 w-5 text-blue-500" />
            Borrow Asset
          </DialogTitle>
          <DialogDescription>
            Record the borrowing of this asset by a student.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Asset Info Card */}
          <div className="rounded-lg border bg-muted/30 p-3.5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10">
                <Package className="h-5 w-5 text-blue-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{asset.name}</p>
                <p className="text-xs text-muted-foreground font-mono">{asset.qr}</p>
              </div>
            </div>
          </div>

          {/* Student Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="student-name" className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-muted-foreground" />
                Student Name
              </Label>
              <Input
                id="student-name"
                placeholder="Full name of student"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="student-id" className="flex items-center gap-1.5">
                <UserRound className="h-3.5 w-3.5 text-muted-foreground" />
                Student ID
              </Label>
              <Input
                id="student-id"
                placeholder="Student ID number"
                value={studentd}
                onChange={(e) => setStudentd(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="student-section" className="flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
              Section
            </Label>
            <Input
              id="student-section"
              placeholder="e.g., BSIT 2A"
              value={studentSection}
              onChange={(e) => setStudentSection(e.target.value)}
            />
          </div>

          {/* Error */}
          {saveError && (
            <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {saveError}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <HandHelping className="h-4 w-4" />
                Confirm Borrow
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
