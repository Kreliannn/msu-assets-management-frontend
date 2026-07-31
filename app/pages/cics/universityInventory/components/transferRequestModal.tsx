"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import axiosInstance from "@/app/utils/axios"
import { assetsInterface } from "@/app/types/asset.type"
import { collegeInterface } from "@/app/types/college.type"
import { successAlert } from "@/app/utils/alert"
import {
  AlertCircle,
  Building2,
  Loader2,
  Package,
  Send,
  User,
} from "lucide-react"

interface TransferRequestModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  asset: assetsInterface | null
  onSuccess?: () => void
}

export function TransferRequestModal({
  open,
  onOpenChange,
  asset,
  onSuccess,
}: TransferRequestModalProps) {

  const [selectedCollege, setSelectedCollege] = useState<string | null>(null)

  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState("")

  

 

  const handleSubmit = async () => {
    if (!asset) return
    setSaving(true)
    setSaveError("")
    try {
      await axiosInstance.post("/system/transfer-request", {
        assetId: asset._id,
        assetname: asset.name,
      })
      successAlert("Transfer request submitted successfully")
      onOpenChange(false)
      onSuccess?.()
    } catch {
      setSaveError("Failed to submit transfer request. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    if (open) {
      setSelectedCollege(null)
     
      setSaveError("")
    
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Send className="h-5 w-5 text-primary" />
            Transfer Request
          </DialogTitle>
          <DialogDescription>
            Request to transfer &quot;{asset?.name}&quot; to a new department.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Asset Summary */}
          <div className="rounded-lg border bg-muted/30 p-3.5">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-sm font-medium truncate">{asset?.name}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1 font-mono">{asset?.qr}</p>
          </div>

       

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
           
            className="gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Submit Request
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
