"use client"

import { useEffect, useState } from "react"
import axiosInstance from "@/app/utils/axios"
import { disposalRecordInterface } from "@/app/types/disposalRecord.type"
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
  Package,
  User,
  Building2,
  RefreshCw,
  AlertCircle,
  Clock,
  Trash2,
  Eye,
  Image,
  MessageSquare,
  X,
  Calendar,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function Page() {
  const [records, setRecords] = useState<disposalRecordInterface[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [viewRecord, setViewRecord] = useState<disposalRecordInterface | null>(null)
  const [viewOpen, setViewOpen] = useState(false)

  const fetchRecords = async () => {
    setLoading(true)
    setError("")
    try {
      const response = await axiosInstance.get("/system/disposal-records")
      setRecords(response.data as disposalRecordInterface[])
    } catch {
      setError("Failed to fetch disposal records")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRecords()
  }, [])

  return (
    <div className="w-full min-h-dvh p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Trash2 className="h-6 w-6 text-red-500" />
            Disposal Records
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            View all recorded asset disposals with proof images and details.
          </p>
        </div>
        <Button variant="outline" size="icon" onClick={fetchRecords} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
          <Button variant="ghost" size="sm" className="ml-auto h-auto p-1" onClick={() => setError("")}>
            Dismiss
          </Button>
        </div>
      )}

      {/* Table */}
      <div className="rounded-lg border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableCaption className="py-3">
              {!loading && records.length === 0
                ? "No disposal records yet."
                : `${records.length} disposal record(s)`}
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[160px]">
                  <div className="flex items-center gap-1.5">
                    <Package className="h-3.5 w-3.5 text-muted-foreground" />
                    Asset Name
                  </div>
                </TableHead>
                <TableHead>
                  <div className="flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                    Location
                  </div>
                </TableHead>
                <TableHead>
                  <div className="flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                    Recorded By
                  </div>
                </TableHead>
                <TableHead>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    Date
                  </div>
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-16 ml-auto rounded-md" /></TableCell>
                  </TableRow>
                ))
              ) : records.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                    <div className="flex flex-col items-center gap-2">
                      <Trash2 className="h-8 w-8 text-muted-foreground/40" />
                      <span>No disposal records available.</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                records.map((record) => (
                  <TableRow key={record._id}>
                    <TableCell className="font-medium">{record.assetname}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1 text-sm">
                        <Building2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span className="truncate max-w-[180px]">{record.college}</span>
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1 text-sm">
                        <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span className="truncate max-w-[140px]">{record.recordedBy}</span>
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{record.date}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5"
                        onClick={() => {
                          setViewRecord(record)
                          setViewOpen(true)
                        }}
                      >
                        <Eye className="h-3.5 w-3.5" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* View Details Dialog */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <Trash2 className="h-5 w-5 text-red-500" />
              Disposal Record Details
            </DialogTitle>
            <DialogDescription>
              Full information about the disposed asset.
            </DialogDescription>
          </DialogHeader>

          {viewRecord && (
            <div className="space-y-5 py-2">
              {/* Asset Info */}
              <div className="rounded-lg border bg-muted/30 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/10">
                    <Package className="h-5 w-5 text-red-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{viewRecord.assetname}</p>
                    <p className="text-xs text-muted-foreground">ID: {viewRecord._id}</p>
                  </div>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border p-3">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                    <Building2 className="h-3 w-3" />
                    Location
                  </div>
                  <p className="text-sm font-medium">{viewRecord.college}</p>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                    <User className="h-3 w-3" />
                    Recorded By
                  </div>
                  <p className="text-sm font-medium">{viewRecord.recordedBy}</p>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                    <Calendar className="h-3 w-3" />
                    Date
                  </div>
                  <p className="text-sm font-medium">{viewRecord.date}</p>
                </div>
              </div>

              {/* Message */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <MessageSquare className="h-3 w-3" />
                  Disposal Reason
                </div>
                <div className="rounded-lg border bg-muted/20 p-3 text-sm">
                  {viewRecord.message}
                </div>
              </div>

              {/* Proof Image */}
              {viewRecord.proof && (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Image className="h-3 w-3" />
                    Proof Image
                  </div>
                  <div className="rounded-lg border overflow-hidden">
                    <img
                      src={viewRecord.proof}
                      alt="Disposal proof"
                      className="w-full h-auto max-h-80 object-contain bg-black/5"
                    />
                  </div>
                </div>
              )}

              {!viewRecord.proof && (
                <div className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
                  No proof image available.
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end pt-2">
            <Button variant="outline" onClick={() => setViewOpen(false)} className="gap-2">
              <X className="h-4 w-4" />
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
