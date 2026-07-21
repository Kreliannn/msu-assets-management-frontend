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
import {
  AlertCircle,
  Loader2,
  MapPin,
  User,
  Package,
  Building2,
  ArrowRight,
  BadgeCheck,
  Check,
  ChevronRight,
  Pencil,
  Building,
} from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { successAlert } from "@/app/utils/alert"

interface BulkTransferModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  assets: assetsInterface[]
  selectedIds: string[]
  onSuccess?: () => void
}

export function BulkTransferModal({
  open,
  onOpenChange,
  assets,
  selectedIds,
  onSuccess,
}: BulkTransferModalProps) {
  const [colleges, setColleges] = useState<collegeInterface[]>([])
  const [fetchingColleges, setFetchingColleges] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null)
  const [selectedCustodian, setSelectedCustodian] = useState<string | null>(null)
  const [manualMode, setManualMode] = useState(false)
  const [loadError, setLoadError] = useState("")
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState("")

  const selectedAssets = assets.filter((a) => selectedIds.includes(a._id))

  const loadColleges = async () => {
    setFetchingColleges(true)
    setLoadError("")
    try {
      const response = await axiosInstance.get("/college")
      setColleges(response.data as collegeInterface[])
    } catch {
      setLoadError("Could not load colleges. Make sure the backend server is running.")
    } finally {
      setFetchingColleges(false)
    }
  }

  const handleLocationChange = (value: string) => {
    if (value === "none") {
      setSelectedLocation(null)
      setSelectedCustodian(null)
    } else {
      const selected = colleges.find((c) => c.department === value)
      setSelectedLocation(value)
      setSelectedCustodian(selected?.custodian.name || null)
    }
  }

  const handleTransfer = async () => {
    if (selectedIds.length === 0) return

    setSaving(true)
    setSaveError("")

    try {
      await axiosInstance.put("/asset/bulk-transfer", {
        ids: selectedIds,
        location: selectedLocation,
        custodian: selectedCustodian,
      })
      successAlert(`Successfully transferred ${selectedIds.length} asset(s)`)
      onOpenChange(false)
      onSuccess?.()
    } catch {
      setSaveError("Failed to transfer assets. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    if (open) {
      setSelectedLocation(null)
      setSelectedCustodian(null)
      setManualMode(false)
      loadColleges()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  if (selectedIds.length === 0) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Building2 className="h-5 w-5 text-primary" />
            Bulk Transfer Assets
          </DialogTitle>
          <DialogDescription>
            Transfer {selectedIds.length} selected asset(s) to a new department and custodian.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Selected Assets Summary */}
          <div className="rounded-lg border bg-muted/30 p-3.5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Selected Assets
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                <Check className="h-3 w-3" />
                {selectedIds.length} selected
              </span>
            </div>
            <div className="max-h-[140px] overflow-y-auto space-y-1.5 pr-1">
              {selectedAssets.slice(0, 10).map((asset) => (
                <div
                  key={asset._id}
                  className="flex items-center gap-2 rounded-md bg-background px-2.5 py-1.5 text-sm"
                >
                  <Package className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span className="flex-1 truncate">{asset.name}</span>
                  <span className="text-xs text-muted-foreground font-mono">{asset.qr}</span>
                  <ChevronRight className="h-3 w-3 text-muted-foreground/50" />
                </div>
              ))}
              {selectedAssets.length > 10 && (
                <p className="text-xs text-center text-muted-foreground pt-1">
                  +{selectedAssets.length - 10} more asset(s)
                </p>
              )}
            </div>
          </div>

          {/* Current Distribution Summary */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border p-3">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1.5">
                <MapPin className="h-3 w-3" />
                Current Locations
              </div>
              <span className="text-sm font-medium">
                {(() => {
                  const locs = new Set(selectedAssets.map((a) => a.location || "Unassigned"))
                  if (locs.size > 2) return `${locs.size} different locations`
                  return [...locs].join(", ")
                })()}
              </span>
            </div>
            <div className="rounded-lg border p-3">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1.5">
                <User className="h-3 w-3" />
                Current Custodians
              </div>
              <span className="text-sm font-medium">
                {(() => {
                  const custs = new Set(selectedAssets.map((a) => a.custodian || "None"))
                  if (custs.size > 2) return `${custs.size} different custodians`
                  return [...custs].join(", ")
                })()}
              </span>
            </div>
          </div>

          {/* Arrow indicating changes */}
          <div className="flex justify-center">
            <div className="flex h-7 w-7 items-center justify-center rounded-full border bg-background">
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
          </div>

          {/* New Assignment Form */}
          <div className="rounded-lg border bg-card p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                New Assignment for All Selected
              </h4>
              <div className="flex items-center gap-2">
                <Building className="h-3.5 w-3.5 text-muted-foreground" />
                <label
                  htmlFor="bulk-manual-mode-toggle"
                  className="text-xs text-muted-foreground cursor-pointer select-none"
                >
                  Building
                </label>
                <Switch
                  id="bulk-manual-mode-toggle"
                  checked={manualMode}
                  onCheckedChange={setManualMode}
                  size="sm"
                />
              </div>
            </div>

            {/* Location - Select or Input based on mode */}
            {manualMode ? (
              <div className="space-y-2">
                <Label htmlFor="bulk-manual-location" className="flex items-center gap-1.5">
                  <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                  Building Name
                </Label>
                <Input
                  id="bulk-manual-location"
                  value={selectedLocation || ""}
                  onChange={(e) => setSelectedLocation(e.target.value || null)}
                  placeholder="e.g., Engineering Building, Room 202"
                />
                <p className="text-xs text-muted-foreground">
                  Enter the building or room name for these assets.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="bulk-location" className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                  Location (College Department)
                </Label>
                <Select
                  value={selectedLocation || "none"}
                  onValueChange={handleLocationChange}
                >
                  <SelectTrigger id="bulk-location" className="w-full">
                    <SelectValue placeholder="Select a location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None (Unassigned)</SelectItem>
                    {fetchingColleges ? (
                      <SelectItem value="loading" disabled>
                        Loading colleges...
                      </SelectItem>
                    ) : (
                      colleges.map((college) => (
                        <SelectItem key={college._id} value={college.department}>
                          {college.department}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>

                {loadError && (
                  <div className="flex items-center gap-1.5 rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    {loadError}
                  </div>
                )}

                <p className="text-xs text-muted-foreground">
                  All selected assets will be assigned to this department.
                </p>
              </div>
            )}

            {/* Custodian - readonly or editable based on mode */}
            <div className="space-y-2">
              <Label htmlFor="bulk-custodian" className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-muted-foreground" />
                Custodian
              </Label>
              <div className="relative">
                <Input
                  id="bulk-custodian"
                  value={selectedCustodian || ""}
                  readOnly={!manualMode}
                  onChange={
                    manualMode
                      ? (e) => setSelectedCustodian(e.target.value || null)
                      : undefined
                  }
                  placeholder={
                    manualMode
                      ? "Enter custodian name"
                      : "Auto-filled from selected department"
                  }
                  className={!manualMode ? "bg-muted/50" : ""}
                />
                {selectedCustodian && !manualMode && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="h-2 w-2 rounded-full bg-emerald-500" />
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {manualMode
                  ? "Manually enter the custodian for these assets."
                  : "Automatically set to the custodian of the selected department."}
              </p>
            </div>
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
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleTransfer}
            disabled={saving || !selectedLocation}
            className="gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Transferring {selectedIds.length} asset(s)...
              </>
            ) : (
              <>
                <Building2 className="h-4 w-4" />
                Transfer {selectedIds.length} Asset(s)
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
