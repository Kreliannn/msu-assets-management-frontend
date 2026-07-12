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
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import axiosInstance from "@/app/utils/axios"
import { assetsInterface, assetsInterfaceInput } from "@/app/types/asset.type"
import { collegeInterface } from "@/app/types/college.type"
import {
  Loader2,
  Plus,
  Package,
  MapPin,
  User,
  Tag,
  Wrench,
} from "lucide-react"

const CATEGORIES = [
  "furniture",
  "it equipment",
  "audio-visual equipment",
  "library assets",
  "office equipment",
  "laboratory equipment",
  "sport equipment",
] as const

const CONDITIONS = ["good", "poor", "damaged"] as const

function generateQrCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  let result = ""
  for (let i = 0; i < 10; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

interface AddAssetModalProps {
  onSuccess: (assets: assetsInterface[]) => void
}

export function AddAssetModal({ onSuccess }: AddAssetModalProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [colleges, setColleges] = useState<collegeInterface[]>([])
  const [fetchingColleges, setFetchingColleges] = useState(false)
  const [error, setError] = useState("")

  // Form fields
  const [name, setName] = useState("")
  const [qr, setQr] = useState(generateQrCode())
  const [category, setCategory] = useState("")
  const [condition, setCondition] = useState("")
  const [location, setLocation] = useState<string | null>(null)
  const [custodian, setCustodian] = useState<string | null>(null)
  const [status, setStatus] = useState("available")

  // Fetch colleges when modal opens
  const loadColleges = async () => {
    setFetchingColleges(true)
    try {
      const response = await axiosInstance.get("/college")
      setColleges(response.data as collegeInterface[])
    } catch {
      // Silently fail — colleges are optional for the form
    } finally {
      setFetchingColleges(false)
    }
  }

  // Handle location change — auto-set custodian and status
  const handleLocationChange = (value: string) => {
    if (value === "none") {
      setLocation(null)
      setCustodian(null)
      setStatus("available")
    } else {
      const selected = colleges.find((c) => c.department === value)
      setLocation(value)
      setCustodian(selected?.custodian.name || null)
      setStatus("in use")
    }
  }

  const resetForm = () => {
    setName("")
    setQr(generateQrCode())
    setCategory("")
    setCondition("")
    setLocation(null)
    setCustodian(null)
    setStatus("available")
    setError("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!name.trim()) {
      setError("Asset name is required")
      return
    }
    if (!category) {
      setError("Category is required")
      return
    }
    if (!condition) {
      setError("Condition is required")
      return
    }

    setLoading(true)
    try {
      const response = await axiosInstance.post("/asset", {
        name,
        qr,
        category,
        location,
        condition,
        status,
        custodian,
      } as assetsInterfaceInput)
      const assets = response.data as assetsInterface[]
      onSuccess(assets)
      resetForm()
      setOpen(false)
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
        const axiosErr = err as { response?: { data?: { message?: string } } }
        setError(axiosErr.response?.data?.message || "Failed to create asset")
      } else {
        setError("Failed to create asset")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen)
        if (isOpen) {
          resetForm()
          loadColleges()
        }
      }}
    >
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Asset
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <Package className="h-5 w-5 text-primary" />
              Add New Asset
            </DialogTitle>
            <DialogDescription>
              Register a new property asset with its details.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-5 py-4">
            {/* Asset Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-1.5">
                <Package className="h-3.5 w-3.5 text-muted-foreground" />
                Asset Name
              </Label>
              <Input
                id="name"
                placeholder="e.g., Dell Optiplex 3090"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            {/* Category & Condition — same row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category" className="flex items-center gap-1.5">
                  <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                  Category
                </Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat} className="capitalize">
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="condition" className="flex items-center gap-1.5">
                  <Wrench className="h-3.5 w-3.5 text-muted-foreground" />
                  Condition
                </Label>
                <Select value={condition} onValueChange={setCondition}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                  <SelectContent>
                    {CONDITIONS.map((cond) => (
                      <SelectItem key={cond} value={cond} className="capitalize">
                        {cond}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location" className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                Location
              </Label>
              <Select
                value={location || "none"}
                onValueChange={handleLocationChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select location" />
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
              <p className="text-xs text-muted-foreground">
                Assign this asset to a college department. Leave as &quot;None&quot; for unassigned assets.
              </p>
            </div>

            {/* Custodian (auto-filled) */}
            <div className="space-y-2">
              <Label htmlFor="custodian" className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-muted-foreground" />
                Custodian
              </Label>
              <Input
                id="custodian"
                value={custodian || ""}
                readOnly
                placeholder="Auto-filled from selected college"
                className="bg-muted/50"
              />
              <p className="text-xs text-muted-foreground">
                Automatically set to the custodian of the selected college department.
              </p>
            </div>

            {/* Status (auto-filled) */}
            <div className="space-y-2">
              <Label htmlFor="status" className="flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                Status
              </Label>
              <Input
                id="status"
                value={status}
                readOnly
                className={`bg-muted/50 font-medium ${
                  status === "available"
                    ? "text-emerald-600"
                    : "text-amber-600"
                }`}
              />
              <p className="text-xs text-muted-foreground">
                Automatically set: &quot;Available&quot; if unassigned, &quot;In Use&quot; if assigned to a college.
              </p>
            </div>

            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetForm()
                setOpen(false)
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Asset"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}