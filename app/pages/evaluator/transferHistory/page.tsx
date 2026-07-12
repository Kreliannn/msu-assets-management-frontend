"use client"

import { useEffect, useState } from "react"
import axiosInstance from "@/app/utils/axios"
import { transferRequestInterface } from "@/app/types/transferRequest.type"
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
  History,
  BadgeCheck,
  Ban,
} from "lucide-react"

const STATUS_VARIANTS: Record<string, { label: string; icon: typeof BadgeCheck; color: string; bg: string }> = {
  approved: {
    label: "Approved",
    icon: BadgeCheck,
    color: "text-emerald-600",
    bg: "bg-emerald-500/10",
  },
  rejected: {
    label: "Rejected",
    icon: Ban,
    color: "text-red-600",
    bg: "bg-red-500/10",
  },
}

export default function Page() {
  const [requests, setRequests] = useState<transferRequestInterface[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const fetchRequests = async () => {
    setLoading(true)
    setError("")
    try {
      const response = await axiosInstance.get("/system/transfer-requests")
      setRequests(response.data as transferRequestInterface[])
    } catch {
      setError("Failed to fetch transfer history")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRequests()
  }, [])

  const historyRequests = requests.filter((r) => r.status !== "pending")

  const StatusBadge = ({ status }: { status: string }) => {
    const variant = STATUS_VARIANTS[status]
    if (!variant) return <span className="capitalize">{status}</span>
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
            <History className="h-6 w-6 text-primary" />
            Transfer History
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            View all approved and rejected transfer requests.
          </p>
        </div>
        <Button variant="outline" size="icon" onClick={fetchRequests} disabled={loading}>
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
              {!loading && historyRequests.length === 0
                ? "No transfer history yet."
                : `${historyRequests.length} completed request(s)`}
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
                    Custodian
                  </div>
                </TableHead>
                <TableHead>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    Date
                  </div>
                </TableHead>
                <TableHead>Status</TableHead>
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
                    <TableCell><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
                  </TableRow>
                ))
              ) : historyRequests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                    <div className="flex flex-col items-center gap-2">
                      <History className="h-8 w-8 text-muted-foreground/40" />
                      <span>No transfer history available.</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                historyRequests.map((req) => (
                  <TableRow key={req._id}>
                    <TableCell className="font-medium">{req.assetname}</TableCell>
                    <TableCell>
                      {req.college ? (
                        <span className="inline-flex items-center gap-1 text-sm">
                          <Building2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <span className="truncate max-w-[180px]">{req.college}</span>
                        </span>
                      ) : (
                        <span className="text-muted-foreground italic text-sm">None</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {req.custodian ? (
                        <span className="inline-flex items-center gap-1 text-sm">
                          <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <span className="truncate max-w-[140px]">{req.custodian}</span>
                        </span>
                      ) : (
                        <span className="text-muted-foreground italic text-sm">None</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{req.date}</TableCell>
                    <TableCell>
                      <StatusBadge status={req.status} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
