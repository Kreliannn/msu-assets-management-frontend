"use client"

import { useEffect, useState } from "react"
import axiosInstance from "@/app/utils/axios"
import { borrowInterface } from "@/app/types/borrow.type"
import { confirmAlert, successAlert, errorAlert } from "@/app/utils/alert"
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
  HandHelping,
  History,
  RefreshCw,
  AlertCircle,
  Eye,
  Undo2,
  Loader2,
  Package,
  User,
  UserRound,
  BookOpen,
  Clock,
  Scan,
} from "lucide-react"
import { ViewBorrowModal } from "./components/viewBorrowModal"
import { ReturnQrScanner } from "./components/returnQrScanner"

export default function Page() {
  const [borrows, setBorrows] = useState<borrowInterface[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [viewBorrow, setViewBorrow] = useState<borrowInterface | null>(null)
  const [viewOpen, setViewOpen] = useState(false)
  const [scannerOpen, setScannerOpen] = useState(false)

  const fetchBorrows = async () => {
    setLoading(true)
    setError("")
    try {
      const response = await axiosInstance.get("/system/borrows")
      setBorrows(response.data as borrowInterface[])
    } catch {
      setError("Failed to fetch borrow records")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBorrows()
  }, [])

  const activeBorrows = borrows.filter((b) => b.status === "borrowed")
  const returnedBorrows = borrows.filter((b) => b.status === "returned")

  const handleReturn = async (id: string) => {
    confirmAlert(
      "This will mark the asset as returned and set its status to 'in use'.",
      "Return",
      async () => {
        setActionLoading(id)
        try {
          await axiosInstance.put(`/system/borrow/return/${id}`)
          successAlert("Asset returned successfully")
          fetchBorrows()
        } catch {
          errorAlert("Failed to return asset")
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
            <HandHelping className="h-6 w-6 text-blue-500" />
            Borrow Records
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track assets currently borrowed and their return history.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setScannerOpen(true)}
            title="Scan QR Code to Return"
          >
            <Scan className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={fetchBorrows} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
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

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Currently Borrowed */}
        <div className="rounded-lg border bg-card overflow-hidden">
          <div className="px-4 py-3 border-b bg-blue-500/5 flex items-center gap-2">
            <HandHelping className="h-4 w-4 text-blue-500" />
            <h2 className="font-semibold text-sm">Currently Borrowed</h2>
            <span className="ml-auto text-xs text-muted-foreground">{activeBorrows.length} record(s)</span>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableCaption className="py-3">
                {!loading && activeBorrows.length === 0
                  ? "No assets currently borrowed."
                  : ""}
              </TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[140px]">
                    <div className="flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-muted-foreground" />
                      Student
                    </div>
                  </TableHead>
                  <TableHead className="min-w-[140px]">
                    <div className="flex items-center gap-1.5">
                      <Package className="h-3.5 w-3.5 text-muted-foreground" />
                      Asset
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                      Borrowed
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
                      <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-28 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : activeBorrows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <HandHelping className="h-8 w-8 text-muted-foreground/40" />
                        <span>No assets currently borrowed.</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  activeBorrows.map((b) => (
                    <TableRow key={b._id}>
                      <TableCell className="font-medium">{b.studentName}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{b.assetName}</TableCell>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        {b.borrowDate} <span className="text-xs">{b.borrowTime}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1.5"
                            onClick={() => {
                              setViewBorrow(b)
                              setViewOpen(true)
                            }}
                          >
                            <Eye className="h-3.5 w-3.5" />
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1.5 text-emerald-600 border-emerald-600/30 hover:bg-emerald-500/10 hover:text-emerald-500"
                            onClick={() => handleReturn(b._id)}
                            disabled={actionLoading === b._id}
                          >
                            {actionLoading === b._id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Undo2 className="h-3.5 w-3.5" />
                            )}
                            Return
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

        {/* Borrow History */}
        <div className="rounded-lg border bg-card overflow-hidden">
          <div className="px-4 py-3 border-b bg-muted/50 flex items-center gap-2">
            <History className="h-4 w-4 text-muted-foreground" />
            <h2 className="font-semibold text-sm">Borrow History</h2>
            <span className="ml-auto text-xs text-muted-foreground">{returnedBorrows.length} record(s)</span>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableCaption className="py-3">
                {!loading && returnedBorrows.length === 0
                  ? "No returned records yet."
                  : ""}
              </TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[140px]">
                    <div className="flex items-center gap-1.5">
                      <UserRound className="h-3.5 w-3.5 text-muted-foreground" />
                      Student
                    </div>
                  </TableHead>
                  <TableHead className="min-w-[100px]">
                    <div className="flex items-center gap-1.5">
                      <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
                      Section
                    </div>
                  </TableHead>
                  <TableHead className="min-w-[140px]">
                    <div className="flex items-center gap-1.5">
                      <Package className="h-3.5 w-3.5 text-muted-foreground" />
                      Asset
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                      Returned
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    </TableRow>
                  ))
                ) : returnedBorrows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <History className="h-8 w-8 text-muted-foreground/40" />
                        <span>No returned records yet.</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  returnedBorrows.map((b) => (
                    <TableRow key={b._id}>
                      <TableCell className="font-medium">{b.studentName}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{b.studentSection}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{b.assetName}</TableCell>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        {b.returnDate} <span className="text-xs">{b.returnTime}</span>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* View Borrow Dialog */}
      <ViewBorrowModal
        open={viewOpen}
        onOpenChange={setViewOpen}
        borrow={viewBorrow}
      />

      {/* Return QR Scanner Dialog */}
      <ReturnQrScanner
        open={scannerOpen}
        onOpenChange={setScannerOpen}
        borrows={borrows}
        onSuccess={fetchBorrows}
      />
    </div>
  )
}
