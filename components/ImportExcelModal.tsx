"use client"

import { useState, useRef } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { downloadBlankExcelForm } from "@/app/utils/excel"
import { assetsInterface } from "@/app/types/asset.type"
import axiosInstance from "@/app/utils/axios"
import {
  Upload,
  FileSpreadsheet,
  Download,
  Loader2,
  AlertCircle,
  CheckCircle2,
  FileDown,
  X,
  AlertTriangle,
} from "lucide-react"
import { successAlert } from "@/app/utils/alert"

interface ImportExcelModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: (assets: assetsInterface[]) => void
}

interface ImportResult {
  created: number
  errors?: { row: number; message: string }[]
}

export function ImportExcelModal({ open, onOpenChange, onSuccess }: ImportExcelModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState("")
  const [importResult, setImportResult] = useState<ImportResult | null>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      const validTypes = [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel",
      ]
      if (!validTypes.includes(file.type) && !file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
        setUploadError("Please select a valid Excel file (.xlsx or .xls).")
        setSelectedFile(null)
        return
      }
      setSelectedFile(file)
      setUploadError("")
      setImportResult(null)
    }
  }

  const removeFile = () => {
    setSelectedFile(null)
    setUploadError("")
    setImportResult(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setUploading(true)
    setUploadError("")
    setImportResult(null)

    try {
      const formData = new FormData()
      formData.append("file", selectedFile)

      const response = await axiosInstance.post("/asset/import-excel", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      const result = response.data as ImportResult & { assets: assetsInterface[] }
      setImportResult({ created: result.created, errors: result.errors })

      if (result.created > 0) {
        successAlert(`Successfully imported ${result.created} asset(s)!`)
        onSuccess?.(result.assets)
      }
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
        const axiosErr = err as { response?: { data?: { message?: string; errors?: { row: number; message: string }[] } } }
        const data = axiosErr.response?.data
        setUploadError(data?.message || "Failed to import Excel file.")
        if (data?.errors && Array.isArray(data.errors) && data.errors.length > 0) {
          setImportResult({ created: 0, errors: data.errors })
        }
      } else {
        setUploadError("Failed to import Excel file. Please try again.")
      }
    } finally {
      setUploading(false)
    }
  }

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      // Reset state when closing
      setSelectedFile(null)
      setUploadError("")
      setImportResult(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
    onOpenChange(isOpen)
  }

  const handleDownloadTemplate = () => {
    downloadBlankExcelForm().catch(() => {})
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <FileSpreadsheet className="h-5 w-5 text-emerald-600" />
            Import from Excel
          </DialogTitle>
          <DialogDescription>
            Download the template, fill it with your asset data, then upload it here.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Step 1: Download Template */}
          <div className="rounded-lg border bg-card p-4 space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-500/10">
                <FileDown className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold">Step 1: Download Template</h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Get the blank Excel form with the correct format and dropdowns.
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-2"
              onClick={handleDownloadTemplate}
            >
              <Download className="h-4 w-4" />
              Download Excel Template
            </Button>
          </div>

          {/* Step 2: Upload Filled File */}
          <div className="rounded-lg border bg-card p-4 space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/10">
                <Upload className="h-5 w-5 text-emerald-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold">Step 2: Upload Filled Excel</h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Upload your completed Excel file with all asset data filled in.
                </p>
              </div>
            </div>

            {/* File Upload Area */}
            {selectedFile ? (
              <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
                  <FileSpreadsheet className="h-5 w-5 text-emerald-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
                  onClick={removeFile}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div
                className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 p-8 cursor-pointer hover:border-muted-foreground/50 hover:bg-muted/20 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-8 w-8 text-muted-foreground/50 mb-2" />
                <p className="text-sm font-medium text-muted-foreground">
                  Click to select your Excel file
                </p>
                <p className="text-xs text-muted-foreground/50 mt-1">
                  .xlsx or .xls files only
                </p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* Error */}
          {uploadError && (
            <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}

          {/* Import Result */}
          {importResult && (
            <div className="space-y-2">
              {importResult.created > 0 && (
                <div className="flex items-center gap-2 rounded-md bg-emerald-500/10 border border-emerald-200/30 p-3 text-sm text-emerald-700">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>
                    Successfully imported <strong>{importResult.created}</strong> asset(s)!
                  </span>
                </div>
              )}
              {importResult.errors && importResult.errors.length > 0 && (
                <div className="rounded-md border border-amber-200/30 bg-amber-500/10 p-3">
                  <div className="flex items-center gap-2 text-sm text-amber-700 mb-2">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    <span className="font-medium">
                      {importResult.errors.length} row(s) had errors:
                    </span>
                  </div>
                  <div className="max-h-[120px] overflow-y-auto space-y-1">
                    {importResult.errors.map((err, idx) => (
                      <p key={idx} className="text-xs text-amber-700">
                        Row {err.row}: {err.message}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
          >
            Close
          </Button>
          <Button
            type="button"
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
            className="gap-2"
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Import Assets
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
