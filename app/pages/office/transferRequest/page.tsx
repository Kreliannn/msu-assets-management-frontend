"use client"

import { useEffect, useState } from "react"
import axiosInstance from "@/app/utils/axios"
import { transferRequestInterface } from "@/app/types/transferRequest.type"
import { confirmAlert, successAlert, errorAlert } from "@/app/utils/alert";
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
  CheckCircle2,
  XCircle,
  Send,
  Loader2,
} from "lucide-react"

export default function Page() {
  const [requests, setRequests] = useState<transferRequestInterface[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [error, setError] = useState("")

  const fetchRequests = async () => {
    setLoading(true)
    setError("")
    try {
      const response = await axiosInstance.get("/system/transfer-requests")
      setRequests(response.data as transferRequestInterface[])
    } catch {
      setError("Failed to fetch transfer requests")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRequests()
  }, [])

  const pendingRequests = requests.filter((r) => r.status === "pending")

  const handleApprove = async (id: string) => {
    confirmAlert(
      "This will approve the transfer request and update the asset's location and custodian.",
      "Approve",
      async () => {
        setActionLoading(id)
        try {
          const response = await axiosInstance.put(`/system/transfer-request/approve/${id}`)
          setRequests(response.data as transferRequestInterface[])
          successAlert("Transfer request approved successfully")
        } catch {
          errorAlert("Failed to approve transfer request")
        } finally {
          setActionLoading(null)
        }
      }
    )
  }

  const handleReject = async (id: string) => {
    confirmAlert(
      "This will reject the transfer request.",
      "Reject",
      async () => {
        setActionLoading(id)
        try {
          const response = await axiosInstance.put(`/system/transfer-request/reject/${id}`)
          setRequests(response.data as transferRequestInterface[])
          successAlert("Transfer request rejected")
        } catch {
          errorAlert("Failed to reject transfer request")
        } finally {
          setActionLoading(null)
        }
      }
    )
  }

  return (
    <div className="w-full min-h-dvh p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Send className="h-6 w-6 text-primary" />
            Transfer Requests
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Review and manage pending asset transfer requests.
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
              {!loading && pendingRequests.length === 0
                ? "No pending transfer requests."
                : `${pendingRequests.length} pending request(s)`}
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
                    Requested Location
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
                    <TableCell><Skeleton className="h-5 w-28 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : pendingRequests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                    <div className="flex flex-col items-center gap-2">
                      <Send className="h-8 w-8 text-muted-foreground/40" />
                      <span>No pending transfer requests.</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                pendingRequests.map((req) => (
                  <TableRow key={req._id}>
                    <TableCell className="font-medium">{req.assetname}</TableCell>
                    <TableCell>
                      {req.college ? (
                        <span className="inline-flex items-center gap-1 text-sm">
                          <Building2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <span className="truncate max-w-[180px]">{req.college}</span>
                        </span>
                      ) : (
                        <span className="text-muted-foreground italic text-sm">Main Office</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {req.custodian ? (
                        <span className="inline-flex items-center gap-1 text-sm">
                          <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <span className="truncate max-w-[140px]">{req.custodian}</span>
                        </span>
                      ) : (
                        <span className="text-muted-foreground italic text-sm">Main Office</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{req.date}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1.5 text-emerald-600 border-emerald-600/30 hover:bg-emerald-500/10 hover:text-emerald-500"
                          onClick={() => handleApprove(req._id)}
                          disabled={actionLoading === req._id}
                        >
                          {actionLoading === req._id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          )}
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1.5 text-red-600 border-red-600/30 hover:bg-red-500/10 hover:text-red-500"
                          onClick={() => handleReject(req._id)}
                          disabled={actionLoading === req._id}
                        >
                          {actionLoading === req._id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <XCircle className="h-3.5 w-3.5" />
                          )}
                          Reject
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
    </div>
  )
}
