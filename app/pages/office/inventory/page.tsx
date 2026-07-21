"use client"

import { useEffect, useState, useMemo } from "react"
import { AddAssetModal } from "./components/addAssetModal"
import { AssignAssetModal } from "./components/assignAssetModal"
import { DisposalModal } from "./components/disposalModal"
import { DisplayQr } from "./components/displayQr"
import { QrScanner } from "./components/qrScanner"
import axiosInstance from "@/app/utils/axios"
import { assetsInterface } from "@/app/types/asset.type"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Search,
  X,
  Filter,
  Package,
  MapPin,
  Tag,
  Wrench,
  RefreshCw,
  AlertCircle,
  Trash2,
  QrCode,
  Scan,
  User,
  BadgeCheck,
  AlertTriangle,
  XCircle,
  Circle,
  Building2,
  Calendar,
  Coins,
  FileDown,
  HandHelping,
  ArrowRightFromLine,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { Checkbox } from "@/components/ui/checkbox"
import { BulkTransferModal } from "./components/BulkTransferModal"
import { BulkQrModal } from "@/components/BulkQrModal"
import { ImportExcelModal } from "@/components/ImportExcelModal"

const STATUS_VARIANTS: Record<
  string,
  {
    label: string;
    icon: typeof Circle;
    color: string;
    bg: string;
  }
> = {
  available: {
    label: "Available",
    icon: BadgeCheck,
    color: "text-emerald-600",
    bg: "bg-emerald-500/10",
  },
  "in use": {
    label: "In Use",
    icon: Circle,
    color: "text-amber-600",
    bg: "bg-amber-500/10",
  },
  disposed: {
    label: "Disposed",
    icon: Trash2,
    color: "text-red-600",
    bg: "bg-red-500/10",
  },
  borrowed: {
    label: "Borrowed",
    icon: HandHelping,
    color: "text-blue-600",
    bg: "bg-blue-500/10",
  },
  underrepair: {
    label: "Under Repair",
    icon: Wrench,
    color: "text-orange-600",
    bg: "bg-orange-500/10",
  },
};




const CONDITION_VARIANTS: Record<string, { label: string; icon: typeof Circle; color: string; bg: string }> = {
  good: {
    label: "good condition",
    icon: BadgeCheck,
    color: "text-emerald-600",
    bg: "bg-emerald-500/10",
  },
  serviceable: {
    label: "serviceable",
    icon: AlertTriangle,
    color: "text-orange-600",
    bg: "bg-orange-500/10",
  },
  unserviceable: {
    label: "Unserviceable",
    icon: XCircle,
    color: "text-red-600",
    bg: "bg-red-500/10",
  },
}



export default function Page() {
  const [assets, setAssets] = useState<assetsInterface[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // QR display & scanner state
  const [qrAsset, setQrAsset] = useState<assetsInterface | null>(null)
  const [qrDialogOpen, setQrDialogOpen] = useState(false)
  const [scannerOpen, setScannerOpen] = useState(false)

  // Assign modal state
  const [assignAsset, setAssignAsset] = useState<assetsInterface | null>(null)
  const [assignDialogOpen, setAssignDialogOpen] = useState(false)

  // Disposal modal state
  const [disposalAsset, setDisposalAsset] = useState<assetsInterface | null>(null)
  const [disposalDialogOpen, setDisposalDialogOpen] = useState(false)

  // Bulk transfer state
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [bulkTransferOpen, setBulkTransferOpen] = useState(false)
  const [bulkQrOpen, setBulkQrOpen] = useState(false)
  const [importExcelOpen, setImportExcelOpen] = useState(false)

  // Filter state
  const [searchName, setSearchName] = useState("")
  const [filterCategory, setFilterCategory] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterCondition, setFilterCondition] = useState("all")
  const [filterLocation, setFilterLocation] = useState("all")

  const fetchAssets = async () => {
    setLoading(true)
    setError("")
    try {
      const response = await axiosInstance.get("/asset")
      setAssets(response.data as assetsInterface[])
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
        const axiosErr = err as { response?: { data?: { message?: string } } }
        setError(axiosErr.response?.data?.message || "Failed to fetch assets")
      } else {
        setError("Failed to fetch assets")
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAssets()
  }, [])

  // Derive unique filter options from assets
  const categories = useMemo(
    () => [...new Set(assets.map((a) => a.category))],
    [assets]
  )
  const statuses = useMemo(
    () => [...new Set(assets.map((a) => a.status.toLowerCase()))],
    [assets]
  )
  const conditions = useMemo(
    () => [...new Set(assets.map((a) => a.condition.toLowerCase()))],
    [assets]
  )
  const locations = useMemo(
    () => [
      ...new Set(
        assets.map((a) =>
          a.location ? a.location.toLowerCase() : "unassigned"
        )
      ),
    ],
    [assets]
  )

  // Filtered list
  const filteredAssets = useMemo(() => {
    const query = searchName.toLowerCase().trim()
    return assets.filter((asset) => {
      if (query && !asset.name.toLowerCase().includes(query)) return false
      if (filterCategory !== "all" && asset.category !== filterCategory)
        return false
      if (filterStatus !== "all" && asset.status.toLowerCase() !== filterStatus)
        return false
      if (
        filterCondition !== "all" &&
        asset.condition.toLowerCase() !== filterCondition
      )
        return false
      if (filterLocation === "unassigned" && asset.location !== null)
        return false
      if (
        filterLocation !== "all" &&
        filterLocation !== "unassigned" &&
        (!asset.location ||
          asset.location.toLowerCase() !== filterLocation)
      )
        return false
      return true
    })
  }, [assets, searchName, filterCategory, filterStatus, filterCondition, filterLocation])

  const hasActiveFilters =
    searchName ||
    filterCategory !== "all" ||
    filterStatus !== "all" ||
    filterCondition !== "all" ||
    filterLocation !== "all"

  const toggleSelectAsset = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredAssets.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(filteredAssets.map((a) => a._id))
    }
  }

  const clearFilters = () => {
    setSearchName("")
    setFilterCategory("all")
    setFilterStatus("all")
    setFilterCondition("all")
    setFilterLocation("all")
  }

  const handleAddSuccess = (newAssets: assetsInterface[]) => {
    setAssets(newAssets)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this asset?")) return
    setDeletingId(id)
    try {
      await axiosInstance.delete(`/asset/${id}`)
      setAssets((prev) => prev.filter((a) => a._id !== id))
    } catch {
      setError("Failed to delete asset")
    } finally {
      setDeletingId(null)
    }
  }

  const handleToggleRepair = async (id: string) => {
    try {
      const response = await axiosInstance.put(`/asset/${id}/repair-toggle`)
      const updated = response.data as assetsInterface
      setAssets((prev) => prev.map((a) => (a._id === id ? updated : a)))
    } catch {
      setError("Failed to toggle repair status")
    }
  }

  const StatusBadge = ({ status }: { status: string }) => {
    const variant = STATUS_VARIANTS[status.toLowerCase()]
    if (!variant) return <span className="capitalize">{status}</span>
    const Icon = variant.icon
    return (
      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${variant.color} ${variant.bg}`}>
        <Icon className="h-3 w-3" />
        {variant.label}
      </span>
    )
  }

  const ConditionBadge = ({ condition }: { condition: string }) => {
    const variant = CONDITION_VARIANTS[condition.toLowerCase()]
    if (!variant) return <span className="capitalize">{condition}</span>
    const Icon = variant.icon
    return (
      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${variant.color} ${variant.bg}`}>
        <Icon className="h-3 w-3" />
        {variant.label}
      </span>
    )
  }

  return (
    <div className="w-full min-h-dvh p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Package className="h-6 w-6 text-primary" />
            Property Inventory
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track and manage all property assets across departments.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={fetchAssets} disabled={loading} title="Refresh">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setScannerOpen(true)}
            title="Scan QR Code"
          >
            <Scan className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setBulkQrOpen(true)}
            disabled={selectedIds.length === 0}
            className={`gap-1.5 ${selectedIds.length > 0 ? "border-primary/50 text-primary" : ""}`}
            title="Download QR Codes"
          >
            <QrCode className="h-4 w-4" />
            QR{selectedIds.length > 0 ? ` (${selectedIds.length})` : ""}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setBulkTransferOpen(true)}
            disabled={selectedIds.length === 0}
            className={`gap-1.5 ${selectedIds.length > 0 ? "border-primary/50 text-primary" : ""}`}
            title="Transfer selected assets"
          >
            <ArrowRightFromLine className="h-4 w-4" />
            Transfer{selectedIds.length > 0 ? ` (${selectedIds.length})` : ""}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setImportExcelOpen(true)}
            title="Import from Excel"
          >
            <FileDown className="h-4 w-4" />
          </Button>
          <AddAssetModal onSuccess={handleAddSuccess} />
        </div>
      </div>

      {/* Filter Bar */}
      <div className="rounded-lg border bg-card overflow-hidden">
        <div className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:flex-wrap">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name..."
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              className="pl-8 h-9"
            />
            {searchName && (
              <button
                onClick={() => setSearchName("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-[160px] h-9">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat} className="capitalize">
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[140px] h-9">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {statuses.map((s) => (
                <SelectItem key={s} value={s} className="capitalize">
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filterCondition}
            onValueChange={setFilterCondition}
          >
            <SelectTrigger className="w-[150px] h-9">
              <SelectValue placeholder="Condition" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Conditions</SelectItem>
              {conditions.map((c) => (
                <SelectItem key={c} value={c} className="capitalize">
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterLocation} onValueChange={setFilterLocation}>
            <SelectTrigger className="w-[170px] h-9">
              <SelectValue placeholder="Location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              <SelectItem value="unassigned">Unassigned</SelectItem>
              {locations
                .filter((l) => l !== "unassigned")
                .map((loc) => (
                  <SelectItem key={loc} value={loc} className="capitalize">
                    {loc}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-9 gap-1.5 text-muted-foreground"
            >
              <X className="h-4 w-4" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto h-auto p-1 text-destructive hover:text-destructive"
            onClick={() => setError("")}
          >
            Dismiss
          </Button>
        </div>
      )}

      {/* Table */}
      <div className="rounded-lg border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableCaption className="py-3">
              {!loading && assets.length === 0
                ? "No assets registered yet. Click 'Add Asset' to get started."
                : `A total of ${filteredAssets.length} registered asset(s)${
                    hasActiveFilters ? " (filtered)" : ""
                  }`}
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox
                    checked={
                      filteredAssets.length > 0 &&
                      selectedIds.length === filteredAssets.length
                    }
                    onCheckedChange={toggleSelectAll}
                    aria-label="Select all"
                  />
                </TableHead>
                <TableHead className="min-w-[180px]">
                  <div className="flex items-center gap-1.5">
                    <Package className="h-3.5 w-3.5 text-muted-foreground" />
                    Asset Name
                  </div>
                </TableHead>
                <TableHead>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    Date
                  </div>
                </TableHead>
                <TableHead>
                  <div className="flex items-center gap-1.5">
                    <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                    Category
                  </div>
                </TableHead>
                <TableHead>
                  <div className="flex items-center gap-1.5">
                    <Coins className="h-3.5 w-3.5 text-muted-foreground" />
                    Value
                  </div>
                </TableHead>
                <TableHead>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                    Location
                  </div>
                </TableHead>
                <TableHead>
                  <div className="flex items-center gap-1.5">
                    <Wrench className="h-3.5 w-3.5 text-muted-foreground" />
                    Condition
                  </div>
                </TableHead>
                <TableHead>Status</TableHead>
                <TableHead>
                  <div className="flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                    Custodian
                  </div>
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-36" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : filteredAssets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="h-32 text-center text-muted-foreground">
                    <div className="flex flex-col items-center gap-2">
                      <Filter className="h-8 w-8 text-muted-foreground/40" />
                      <span>No assets match your filters</span>
                      {hasActiveFilters && (
                        <Button
                          variant="link"
                          size="sm"
                          onClick={clearFilters}
                          className="text-xs"
                        >
                          Clear all filters
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredAssets.map((asset) => (
                  <TableRow
                    key={asset._id}
                    className={selectedIds.includes(asset._id) ? "bg-primary/5" : ""}
                  >
                    <TableCell className="w-10">
                      <Checkbox
                        checked={selectedIds.includes(asset._id)}
                        onCheckedChange={() => toggleSelectAsset(asset._id)}
                        aria-label={`Select ${asset.name}`}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{asset.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">{asset.date}</TableCell>
                    <TableCell className="capitalize">{asset.category}</TableCell>
                    <TableCell className="text-sm font-medium tabular-nums">
                      ₱{asset.value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell>
                      {asset.location ? (
                        <span className="inline-flex items-center gap-1 text-sm">
                          <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <span className="truncate max-w-[140px]">{asset.location}</span>
                        </span>
                      ) : (
                        <span className="text-muted-foreground italic text-sm">Unassigned</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <ConditionBadge condition={asset.condition} />
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={asset.status} />
                    </TableCell>
                    <TableCell>
                      {asset.custodian ? (
                        <span className="inline-flex items-center gap-1 text-sm">
                          <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <span className="truncate max-w-[120px]">{asset.custodian}</span>
                        </span>
                      ) : (
                        <span className="text-muted-foreground italic text-sm">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className={`h-8 w-8 ${
                            asset.status.toLowerCase() === "underrepair"
                              ? "text-orange-500 bg-orange-500/10 hover:bg-orange-500/20"
                              : "text-muted-foreground hover:text-orange-500"
                          }`}
                          onClick={() => handleToggleRepair(asset._id)}
                          title={
                            asset.status.toLowerCase() === "underrepair"
                              ? "Mark as repaired"
                              : "Mark as under repair"
                          }
                        >
                          <Wrench className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-amber-600"
                          onClick={() => {
                            setAssignAsset(asset)
                            setAssignDialogOpen(true)
                          }}
                          title="Assign Location &amp; Custodian"
                        >
                          <Building2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-primary"
                          onClick={() => {
                            setQrAsset(asset)
                            setQrDialogOpen(true)
                          }}
                          title="Show QR Code"
                        >
                          <QrCode className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-red-500"
                          onClick={() => {
                            setDisposalAsset(asset)
                            setDisposalDialogOpen(true)
                          }}
                          title="Record Disposal"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* QR Code Display Dialog */}
      {qrAsset && (
        <DisplayQr
          open={qrDialogOpen}
          onOpenChange={setQrDialogOpen}
          qrValue={qrAsset.qr}
          assetName={qrAsset.name}
        />
      )}

      {/* Assign Location & Custodian Dialog */}
      <AssignAssetModal
        open={assignDialogOpen}
        onOpenChange={setAssignDialogOpen}
        asset={assignAsset}
      />

      {/* Disposal Dialog */}
      <DisposalModal
        open={disposalDialogOpen}
        onOpenChange={setDisposalDialogOpen}
        asset={disposalAsset}
        onSuccess={fetchAssets}
      />

      {/* Import Excel Dialog */}
      <ImportExcelModal
        open={importExcelOpen}
        onOpenChange={setImportExcelOpen}
        onSuccess={(newAssets) => {
          setAssets(newAssets)
        }}
      />

      {/* Bulk QR Download Dialog */}
      <BulkQrModal
        open={bulkQrOpen}
        onOpenChange={setBulkQrOpen}
        assets={assets}
        selectedIds={selectedIds}
      />

      {/* Bulk Transfer Dialog */}
      <BulkTransferModal
        open={bulkTransferOpen}
        onOpenChange={setBulkTransferOpen}
        assets={assets}
        selectedIds={selectedIds}
        onSuccess={() => {
          setSelectedIds([])
          fetchAssets()
        }}
      />

      {/* QR Scanner Dialog */}
      <QrScanner
        open={scannerOpen}
        onOpenChange={setScannerOpen}
        assets={assets}
      />
    </div>
  )
}
