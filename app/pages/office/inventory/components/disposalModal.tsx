"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useState, useEffect, useRef } from "react"
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
  MapPin,
  User,
  Calendar,
  MessageSquare,
  Image,
  Trash2,
  Upload,
  X,
  Building2,
} from "lucide-react"
import { successAlert } from "@/app/utils/alert"

interface DisposalModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  asset: assetsInterface | null
}

export function DisposalModal({ open, onOpenChange, asset }: DisposalModalProps) {
  const [message, setMessage] = useState("")
  const [recordedBy, setRecordedBy] = useState( "Main Office")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [date] = useState(new Date().toISOString().split("T")[0])

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setMessage("")
      setRecordedBy("")
      setSelectedFile(null)
      setPreview(null)
      setSaveError("")
    }
  }, [open])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeFile = () => {
    setSelectedFile(null)
    setPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleSubmit = async () => {
    if (!asset) return
    if (!message.trim()) {
      setSaveError("Please provide a disposal reason/message.")
      return
    }
    if (!recordedBy.trim()) {
      setSaveError("Please enter the name of the person recording this disposal.")
      return
    }
    if (!selectedFile) {
      setSaveError("Please upload a proof image for the disposal.")
      return
    }

    setSaving(true)
    setSaveError("")

    try {
      const formData = new FormData()
      formData.append("assetname", asset.name)
      formData.append("message", message)
      formData.append("date", date)
      formData.append("college", asset.location || "Main Office")
      formData.append("recordedBy", recordedBy)
      formData.append("proof", selectedFile)
      formData.append("assetId", asset._id)
      

      await axiosInstance.post("/system/disposal-record", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      successAlert("Asset disposed successfully")
      onOpenChange(false)
    } catch {
      setSaveError("Failed to submit disposal record. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  if (!asset) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Trash2 className="h-5 w-5 text-red-500" />
            Record Asset Disposal
          </DialogTitle>
          <DialogDescription>
            Record the disposal of this asset with details and proof images.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Asset Info Card */}
          <div className="rounded-lg border bg-muted/30 p-3.5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/10">
                <Package className="h-5 w-5 text-red-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{asset.name}</p>
                <p className="text-xs text-muted-foreground font-mono">{asset.qr}</p>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                <span>{asset.location || "Unassigned"}</span>
              </div>
              <div className="flex items-center gap-1">
                <Building2 className="h-3 w-3" />
                <span className="capitalize">{asset.category}</span>
              </div>
            </div>
          </div>

          {/* Date (auto) */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              Date
            </Label>
            <Input value={date} readOnly className="bg-muted/50" />
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="disposal-message" className="flex items-center gap-1.5">
              <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
              Disposal Reason / Message
            </Label>
            <Textarea
              id="disposal-message"
              placeholder="Describe the reason for disposal (e.g., damaged beyond repair, obsolete, etc.)"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              required
            />
          </div>

          {/* Recorded By */}
          <div className="space-y-2">
            <Label htmlFor="recorded-by" className="flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-muted-foreground" />
              Recorded By
            </Label>
            <Input
              id="recorded-by"
              placeholder="Name of person recording the disposal"
              value={recordedBy}
              onChange={(e) => setRecordedBy(e.target.value)}
              required
            />
          </div>

          {/* Proof Image Upload */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5">
              <Image className="h-3.5 w-3.5 text-muted-foreground" />
              Proof Image
            </Label>
            {preview ? (
              <div className="relative rounded-lg border overflow-hidden">
                <img
                  src={preview}
                  alt="Disposal proof preview"
                  className="w-full h-48 object-cover"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-7 w-7"
                  onClick={removeFile}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div
                className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 p-8 cursor-pointer hover:border-muted-foreground/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-8 w-8 text-muted-foreground/50 mb-2" />
                <p className="text-sm font-medium text-muted-foreground">
                  Click to upload proof image
                </p>
                <p className="text-xs text-muted-foreground/50 mt-1">
                  JPG, PNG or WEBP
                </p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
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
            className="gap-2 bg-red-600 hover:bg-red-700 text-white"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Recording...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                Record Disposal
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
