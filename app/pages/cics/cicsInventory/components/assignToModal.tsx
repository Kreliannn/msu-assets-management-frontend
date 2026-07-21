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
  User,
  Package,
  UserX,
  BadgeCheck,
  UserCheck,
} from "lucide-react"
import { successAlert } from "@/app/utils/alert"

interface AssignToModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  asset: assetsInterface | null
  onSuccess?: () => void
}

export function AssignToModal({ open, onOpenChange, asset, onSuccess }: AssignToModalProps) {
  const [assignTo, setAssignTo] = useState("")
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState("")

  // Reset state when dialog opens with a new asset
  useEffect(() => {
    if (open && asset) {
      setAssignTo(asset.assignTo || "")
      setSaveError("")
    }
  }, [open, asset?._id])

  if (!asset) return null

  const handleSave = async (value: string | null) => {
    setSaving(true)
    setSaveError("")

    try {
      await axiosInstance.put(`/asset/${asset._id}/assign`, { assignTo: value })
      onOpenChange(false)
      successAlert(value ? `Assigned to ${value}` : "Unassigned successfully")
      onSuccess?.()
    } catch {
      setSaveError("Failed to update assignment. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  const isCurrentlyAssigned = !!asset.assignTo

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <UserCheck className="h-5 w-5 text-primary" />
            {isCurrentlyAssigned ? "Reassign / Unassign Person" : "Assign Person"}
          </DialogTitle>
          <DialogDescription>
            Assign a person responsible for this asset, or remove the current assignment.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Current Asset Info */}
          <div className="rounded-lg border bg-muted/30 p-3.5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{asset.name}</p>
                <p className="text-xs text-muted-foreground font-mono">{asset.qr}</p>
              </div>
            </div>
          </div>

          {/* Current Assignment */}
          <div className="rounded-lg border p-3">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1.5">
              <User className="h-3 w-3" />
              Current Assignment
            </div>
            {asset.assignTo ? (
              <span className="inline-flex items-center gap-1.5 text-sm font-medium">
                <UserCheck className="h-4 w-4 text-primary" />
                {asset.assignTo}
              </span>
            ) : (
              <span className="text-sm text-muted-foreground italic flex items-center gap-1.5">
                <UserX className="h-4 w-4" />
                No one assigned
              </span>
            )}
          </div>

          {/* Assign Input */}
          <div className="space-y-2">
            <Label htmlFor="assign-to" className="flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-muted-foreground" />
              Assign to Person
            </Label>
            <Input
              id="assign-to"
              placeholder="Enter name of person to assign..."
              value={assignTo}
              onChange={(e) => setAssignTo(e.target.value)}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Enter the name of the person responsible for this asset.
            </p>
          </div>

          {/* Save error */}
          {saveError && (
            <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {saveError}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          {isCurrentlyAssigned && (
            <Button
              type="button"
              variant="outline"
              className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 gap-2"
              onClick={() => handleSave(null)}
              disabled={saving}
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <UserX className="h-4 w-4" />
              )}
              Unassign
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setAssignTo(asset?.assignTo || "")
              onOpenChange(false)
            }}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => handleSave(assignTo.trim() || null)}
            disabled={saving || !assignTo.trim()}
            className="gap-2"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <UserCheck className="h-4 w-4" />
            )}
            {isCurrentlyAssigned ? "Update" : "Assign"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
