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
} from "lucide-react"
import { successAlert } from "@/app/utils/alert"


interface AssignAssetModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  asset: assetsInterface | null
   onSuccess?: () => void
}

export function AssignAssetModal({ open, onOpenChange, asset , onSuccess}: AssignAssetModalProps) {
  const [colleges, setColleges] = useState<collegeInterface[]>([])
  const [fetchingColleges, setFetchingColleges] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState<string | null>(
    asset?.location || null
  )
  const [selectedCustodian, setSelectedCustodian] = useState<string | null>(
    asset?.custodian || null
  )
  const [loadError, setLoadError] = useState("")
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState("")
  const [saveSuccess, setSaveSuccess] = useState(false)

  const loadColleges = async () => {
    setFetchingColleges(true)
    setLoadError("")
    try {
      const response = await axiosInstance.get("/college")
        console.log("test", response.data)
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

  const handleSave = async () => {
    if (!asset) return

    setSaving(true)
    setSaveError("")
    setSaveSuccess(false)

    try {
      await axiosInstance.put("/asset/transfer", {
        assetId: asset._id,
        assetname : asset.name, 
        college: selectedLocation,
        custodian: selectedCustodian,
      })
      onOpenChange(false)
      onSuccess?.()
      successAlert("Transfer Submited")
    } catch {
      setSaveError("Failed to submit transfer request. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  // Use effect to react to dialog opening — more reliable than onOpenChange for controlled dialogs
  useEffect(() => {
    if (open && asset) {
      setSelectedLocation(asset.location || null)
      setSelectedCustodian(asset.custodian || null)
      loadColleges()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, asset?._id])

  if (!asset) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Building2 className="h-5 w-5 text-primary" />
            Assign Location &amp; Custodian
          </DialogTitle>
          <DialogDescription>
            Assign a college department and custodian to this asset.
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
              <div className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-600">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                {asset.status}
              </div>
            </div>
          </div>

          {/* Current Assignment Info */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border p-3">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1.5">
                <MapPin className="h-3 w-3" />
                Current Location
              </div>
              {asset.location ? (
                <span className="text-sm font-medium line-clamp-1">{asset.location}</span>
              ) : (
                <span className="text-sm text-muted-foreground italic">Unassigned</span>
              )}
            </div>
            <div className="rounded-lg border p-3">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1.5">
                <User className="h-3 w-3" />
                Current Custodian
              </div>
              {asset.custodian ? (
                <span className="text-sm font-medium line-clamp-1">{asset.custodian}</span>
              ) : (
                <span className="text-sm text-muted-foreground italic">None</span>
              )}
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
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              New Assignment
             
            </h4>

            {/* Location Select */}
            <div className="space-y-2">
              <Label htmlFor="assign-location" className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                Location (College Department)
              </Label>
              <Select
                value={selectedLocation || "none"}
                onValueChange={handleLocationChange}
              >
                <SelectTrigger id="assign-location" className="w-full">
                  <SelectValue placeholder="Select a location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None (Unassigned)</SelectItem>

                  <SelectItem key={"MSU Main Campus"} value={"MSU Main Campus"}>
                     MSU Main Campus
                  </SelectItem>

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

              {/* Error message when API fails */}
              {loadError && (
                <div className="flex items-center gap-1.5 rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  {loadError}
                </div>
              )}

              <p className="text-xs text-muted-foreground">
                Select a college department or choose &quot;None&quot; to leave unassigned.
              </p>
            </div>

            {/* Custodian (auto-filled) */}
            <div className="space-y-2">
              <Label htmlFor="assign-custodian" className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-muted-foreground" />
                Custodian
              </Label>
              <div className="relative">
                <Input
                  id="assign-custodian"
                  value={selectedCustodian || ""}
                  onChange={(e) => setSelectedCustodian(e.target.value)}
                  readOnly={selectedLocation !== "MSU Main Campus"}
                  placeholder={selectedLocation === "MSU Main Campus" ? "Enter custodian name" : "Auto-filled from selected department"}
                  className={selectedLocation !== "MSU Main Campus" ? "bg-muted/50" : ""}
                />
                {selectedCustodian && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="h-2 w-2 rounded-full bg-emerald-500" />
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {selectedLocation === "MSU Main Campus" ? "Manually enter the custodian name for the main campus." : "Automatically set to the custodian of the selected college department."}
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

          {/* Save success */}
          {saveSuccess && (
            <div className="rounded-md bg-emerald-500/10 border border-emerald-200/30 p-3 text-sm text-emerald-700 flex items-center gap-2">
              <BadgeCheck className="h-4 w-4" />
              Transfer request submitted! Closing...
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setSelectedLocation(asset?.location || null)
              setSelectedCustodian(asset?.custodian || null)
              onOpenChange(false)
            }}
          >
            Cancel
          </Button>
          <Button type="button" onClick={handleSave} disabled={saving} className="gap-2">
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Building2 className="h-4 w-4" />
                Submit Transfer Request
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


