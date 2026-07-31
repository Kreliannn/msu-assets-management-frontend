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
import { disposalRecordInterface } from "@/app/types/disposalRecord.type"
import { ReportPaper } from "./reportPaper"
import { MonthFilter } from "./monthFilter"
import { generateReportPdf, PdfColumn } from "./reportPdf"
import {
  formatOrDash,
  newReportNo,
  formatGeneratedAt,
  monthFilterText,
  deriveYears,
} from "./reportUtils"
import { AlertCircle, Download, Loader2 } from "lucide-react"

const DATE_FIELD = "date"

const COLUMNS: PdfColumn[] = [
  { key: "assetname", label: "Asset Name" },
  { key: "message", label: "Message" },
  { key: "college", label: "College" },
  { key: "recordedBy", label: "Recorded By" },
  { key: "date", label: "Date" },
]

interface DisposalReportModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DisposalReportModal({ open, onOpenChange }: DisposalReportModalProps) {
  const [rows, setRows] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [downloading, setDownloading] = useState(false)
  const [year, setYear] = useState("all")
  const [month, setMonth] = useState("all")
  const [reportNo] = useState(newReportNo)
  const generatedDate = formatGeneratedAt()

  const load = async () => {
    setLoading(true)
    setError("")
    try {
      const res = await axiosInstance.get("/system/disposal-records")
      const data = res.data as disposalRecordInterface[]
      setRows(
        data.map((d) => ({
          assetname: d.assetname,
          message: d.message,
          college: d.college || "—",
          recordedBy: d.recordedBy || "—",
          date: d.date,
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
      setYear("all")
      setMonth("all")
      setError("")
      load()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const years = useMemo(() => deriveYears(rows, DATE_FIELD), [rows])

  const filteredRows = useMemo(() => {
    if (year === "all" && month === "all") return rows
    return rows.filter((r) => {
      const d = String(r[DATE_FIELD] ?? "")
      if (year !== "all" && !d.startsWith(year)) return false
      if (month !== "all" && !d.includes(`-${month}-`)) return false
      return true
    })
  }, [rows, year, month])

  const handleDownload = () => {
    setDownloading(true)
    try {
      generateReportPdf({
        title: "Disposal Report",
        reportNo,
        generatedDate,
        filterText: monthFilterText(year, month),
        columns: COLUMNS,
        rows: filteredRows,
        pdfName: "disposal-report",
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
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between gap-4 shrink-0">
          <DialogHeader className="p-0">
            <DialogTitle>Disposal Report</DialogTitle>
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
          <ReportPaper title="Disposal Report">
            <div className="flex flex-wrap justify-between gap-2 text-xs text-slate-600 mb-3">
              <span>Report No.: {reportNo}</span>
              <span>Date Generated: {generatedDate}</span>
            </div>

            <div className="mb-4">
              <MonthFilter
                years={years}
                year={year}
                month={month}
                onYearChange={setYear}
                onMonthChange={setMonth}
              />
              {(year !== "all" || month !== "all") && (
                <span className="text-xs text-slate-500">
                  {filteredRows.length} record(s)
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
              </div>
            )}
          </ReportPaper>
        </div>
      </DialogContent>
    </Dialog>
  )
}
