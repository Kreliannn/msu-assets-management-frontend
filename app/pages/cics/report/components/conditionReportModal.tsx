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
import axiosInstance from "@/app/utils/axios"
import { assetsInterface } from "@/app/types/asset.type"
import { ReportPaper } from "@/app/pages/office/report/components/reportPaper"
import { generateReportPdf, PdfColumn } from "@/app/pages/office/report/components/reportPdf"
import {
  formatMoney,
  newReportNo,
  formatGeneratedAt,
} from "@/app/pages/office/report/components/reportUtils"
import { AlertCircle, Download, Loader2 } from "lucide-react"

const COLUMNS: PdfColumn[] = [
  {
    key: "condition",
    label: "Condition",
    format: (v) => String(v).charAt(0).toUpperCase() + String(v).slice(1),
  },
  { key: "count", label: "Count" },
  { key: "value", label: "Total Value", format: formatMoney },
]

interface ConditionReportModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ConditionReportModal({ open, onOpenChange }: ConditionReportModalProps) {
  const [rows, setRows] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [downloading, setDownloading] = useState(false)
  const [reportNo] = useState(newReportNo)
  const generatedDate = formatGeneratedAt()

  const load = async () => {
    setLoading(true)
    setError("")
    try {
      const res = await axiosInstance.get("/asset")
      const data = res.data as assetsInterface[]
      const cicsAssets = data.filter((a) => a.location === "CICS")
      const groups: Record<string, { count: number; value: number }> = {}
      cicsAssets.forEach((a) => {
        const key = a.condition.toLowerCase()
        groups[key] = groups[key] || { count: 0, value: 0 }
        groups[key].count++
        groups[key].value += a.value
      })
      setRows(
        Object.entries(groups).map(([condition, g]) => ({
          condition,
          count: g.count,
          value: g.value,
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
      setError("")
      load()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const totalCount = useMemo(
    () => rows.reduce((sum, r) => sum + (Number(r.count) || 0), 0),
    [rows]
  )
  const totalValue = useMemo(
    () => rows.reduce((sum, r) => sum + (Number(r.value) || 0), 0),
    [rows]
  )

  const handleDownload = () => {
    setDownloading(true)
    try {
      generateReportPdf({
        title: "Asset Condition Report",
        reportNo,
        generatedDate,
        columns: COLUMNS,
        rows,
        pdfName: "cics-asset-condition-report",
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
    return v === null || v === undefined || v === "" ? "—" : String(v)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between gap-4 shrink-0">
          <DialogHeader className="p-0">
            <DialogTitle>Asset Condition Report</DialogTitle>
          </DialogHeader>
          <Button onClick={handleDownload} disabled={downloading || rows.length === 0}>
            {downloading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            {downloading ? "Generating..." : "Download PDF"}
          </Button>
        </div>

        <div className="flex-1 overflow-auto p-4 sm:p-8 bg-slate-100">
          <ReportPaper title="Asset Condition Report">
            <div className="flex flex-wrap justify-between gap-2 text-xs text-slate-600 mb-4">
              <span>Report No.: {reportNo}</span>
              <span>Date Generated: {generatedDate}</span>
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
                  {Array.from({ length: 4 }).map((_, i) => (
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
                    {rows.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={COLUMNS.length}
                          className="h-24 text-center text-slate-500 border border-slate-300"
                        >
                          No records found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      rows.map((row, i) => (
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

            {!loading && rows.length > 0 && (
              <div className="mt-4 flex justify-end gap-8 text-sm font-medium">
                <span>Total Assets: {totalCount}</span>
                <span>Total Value: {formatMoney(totalValue)}</span>
              </div>
            )}
          </ReportPaper>
        </div>
      </DialogContent>
    </Dialog>
  )
}
