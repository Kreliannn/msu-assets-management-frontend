"use client"

import { useEffect, useMemo, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import axiosInstance from "@/app/utils/axios"
import { assetsInterface } from "@/app/types/asset.type"
import { ReportPaper } from "./reportPaper"
import { generateReportPdf, PdfColumn } from "./reportPdf"
import {
  formatMoney,
  formatOrDash,
  newReportNo,
  formatGeneratedAt,
} from "./reportUtils"
import { AlertCircle, Building2, Download, Loader2 } from "lucide-react"

const COLUMNS: PdfColumn[] = [
  { key: "location", label: "Location" },
  { key: "name", label: "Asset Name" },
  { key: "category", label: "Category" },
  { key: "value", label: "Value", format: formatMoney },
  { key: "condition", label: "Condition" },
  { key: "status", label: "Status" },
  { key: "custodian", label: "Custodian" },
]

interface CollegeInventoryReportModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CollegeInventoryReportModal({
  open,
  onOpenChange,
}: CollegeInventoryReportModalProps) {
  const [rows, setRows] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [downloading, setDownloading] = useState(false)
  const [locationFilter, setLocationFilter] = useState("all")
  const [reportNo] = useState(newReportNo)
  const generatedDate = formatGeneratedAt()

  const load = async () => {
    setLoading(true)
    setError("")
    try {
      const res = await axiosInstance.get("/asset")
      const data = res.data as assetsInterface[]
      setRows(
        data
          .filter((a) => a.location)
          .sort((a, b) => (a.location! > b.location! ? 1 : -1))
          .map((a) => ({
            location: a.location,
            name: a.name,
            category: a.category,
            value: a.value,
            condition: a.condition,
            status: a.status,
            custodian: a.custodian || "—",
          }))
      )
    } catch {
      setError("Failed to load report data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open) {
      setLocationFilter("all")
      setError("")
      load()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const locations = useMemo(
    () =>
      [...new Set(rows.map((r) => String(r.location)).filter(Boolean))].sort(),
    [rows]
  )

  const filteredRows = useMemo(
    () =>
      locationFilter === "all"
        ? rows
        : rows.filter((r) => r.location === locationFilter),
    [rows, locationFilter]
  )

  const totalValue = useMemo(
    () => filteredRows.reduce((sum, r) => sum + (Number(r.value) || 0), 0),
    [filteredRows]
  )

  const handleDownload = () => {
    setDownloading(true)
    try {
      generateReportPdf({
        title: "College Inventory",
        reportNo,
        generatedDate,
        filterText:
          locationFilter === "all" ? "" : `Location: ${locationFilter}`,
        columns: COLUMNS,
        rows: filteredRows,
        pdfName: "college-inventory",
      })
    } catch {
      setError("Failed to generate PDF")
    } finally {
      setDownloading(false)
    }
  }

  const cellValue = (row: Record<string, unknown>, col: PdfColumn) => {
    const v = row[col.key]
    if (col.format) return col.format(v)
    return formatOrDash(v)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[1000px] max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between gap-4 shrink-0">
          <DialogHeader className="p-0">
            <DialogTitle>College Inventory</DialogTitle>
          </DialogHeader>
          <Button
            onClick={handleDownload}
            disabled={downloading || filteredRows.length === 0}
          >
            {downloading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            {downloading ? "Generating..." : "Download PDF"}
          </Button>
        </div>

        <div className="flex-1 overflow-auto p-4 sm:p-8 bg-slate-100">
          <ReportPaper title="College Inventory">
            <div className="flex flex-wrap justify-between gap-2 text-xs text-slate-600 mb-3">
              <span>Report No.: {reportNo}</span>
              <span>Date Generated: {generatedDate}</span>
            </div>

            {/* Location filter */}
            <div className="flex items-center gap-2 flex-wrap mb-4">
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-700">
                <Building2 className="h-4 w-4" />
                College:
              </span>
              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger className="w-[220px] h-9 bg-white border-slate-400">
                  <SelectValue placeholder="College" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {locations.map((l) => (
                    <SelectItem key={l} value={l}>
                      {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {locationFilter !== "all" && (
                <span className="text-xs text-slate-500">
                  {filteredRows.length} asset(s)
                </span>
              )}
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-600 mb-4">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="overflow-auto rounded border border-slate-300">
              {loading ? (
                <div className="p-4 space-y-2">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-8 w-full" />
                  ))}
                </div>
              ) : (
                <Table className="border-collapse">
                  <TableHeader>
                    <TableRow className="bg-slate-100 hover:bg-slate-100">
                      {COLUMNS.map((c) => (
                        <TableHead
                          key={c.key}
                          className="whitespace-nowrap text-slate-800 font-semibold border border-slate-300"
                        >
                          {c.label}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRows.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={COLUMNS.length}
                          className="h-24 text-center text-slate-500 border border-slate-300"
                        >
                          No records found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredRows.map((row, i) => (
                        <TableRow key={i}>
                          {COLUMNS.map((c) => (
                            <TableCell
                              key={c.key}
                              className="whitespace-nowrap text-sm border border-slate-300"
                            >
                              {cellValue(row, c)}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </div>

            {!loading && filteredRows.length > 0 && (
              <div className="mt-4 flex justify-end gap-8 text-sm font-medium">
                <span>Total Records: {filteredRows.length}</span>
                <span>Total Value: {formatMoney(totalValue)}</span>
              </div>
            )}
          </ReportPaper>
        </div>
      </DialogContent>
    </Dialog>
  )
}
