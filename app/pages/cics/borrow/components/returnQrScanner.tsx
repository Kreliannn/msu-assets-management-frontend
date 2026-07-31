"use client"

import { useEffect, useRef, useState } from "react"
import { Html5Qrcode } from "html5-qrcode"
import { borrowInterface } from "@/app/types/borrow.type"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import axiosInstance from "@/app/utils/axios"
import { confirmAlert, successAlert } from "@/app/utils/alert"
import {
  Camera,
  CameraOff,
  Loader2,
  Scan,
  Package,
  User,
  UserRound,
  BookOpen,
  Calendar,
  AlertCircle,
  Undo2,
} from "lucide-react"

interface ReturnQrScannerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  borrows: borrowInterface[]
  onSuccess?: () => void
}

export function ReturnQrScanner({ open, onOpenChange, borrows, onSuccess }: ReturnQrScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const [scanning, setScanning] = useState(false)
  const [error, setError] = useState("")
  const [scannedBorrow, setScannedBorrow] = useState<borrowInterface | null>(null)
  const [cameraStarted, setCameraStarted] = useState(false)
  const [returning, setReturning] = useState(false)

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop()
      } catch {
        // Ignore stop errors
      }
      scannerRef.current = null
    }
    setCameraStarted(false)
    setScanning(false)
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopScanner()
    }
  }, [])

  const startScanning = async () => {
    setError("")
    setScannedBorrow(null)
    setScanning(true)

    try {
      const scanner = new Html5Qrcode("qr-reader")
      scannerRef.current = scanner

      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          const match = borrows.find((b) => b.assetQr === decodedText)
          if (match) {
            if (match.status !== "borrowed") {
              setError("Item is not borrowed")
            } else {
              setScannedBorrow(match)
              stopScanner()
            }
          } else {
            setError("No borrow record found with this QR code")
          }
        },
        () => {
          // Ignore scan errors (no QR detected)
        }
      )
      setCameraStarted(true)
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to access camera. Please ensure camera permissions are granted."
      setError(message)
      setScanning(false)
    }
  }

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      stopScanner()
      setScannedBorrow(null)
      setError("")
    }
    onOpenChange(isOpen)
  }

  const resetScan = async () => {
    setScannedBorrow(null)
    setError("")
    await stopScanner()
    startScanning()
  }

  const handleReturn = async () => {
    if (!scannedBorrow) return
    handleOpenChange(false)
    confirmAlert(
      `This will mark "${scannedBorrow.assetName}" as returned and set the asset status to 'in use'.`,
      "Return",
      async () => {
        setReturning(true)
        try {
          await axiosInstance.put(`/system/borrow/return/${scannedBorrow._id}`)
          successAlert("Asset returned successfully")
          onSuccess?.()
          handleOpenChange(false)
        } catch {
          setError("Failed to return asset. Please try again.")
          setReturning(false)
        }
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Scan className="h-5 w-5 text-primary" />
            Scan QR to Return
          </DialogTitle>
          <DialogDescription>
            Point your camera at the asset&apos;s QR code to mark it as returned.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Scanner viewport */}
          {!scannedBorrow && (
            <div className="relative">
              <div
                id="qr-reader"
                className={`rounded-lg overflow-hidden ${
                  cameraStarted ? "ring-2 ring-primary/20" : ""
                }`}
              />
              {!cameraStarted && scanning && (
                <div className="absolute inset-0 flex items-center justify-center bg-muted/50 rounded-lg">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              )}
            </div>
          )}

          {/* Action buttons */}
          {!scannedBorrow && (
            <div className="flex justify-center">
              {cameraStarted ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={stopScanner}
                  className="gap-2"
                >
                  <CameraOff className="h-4 w-4" />
                  Stop Camera
                </Button>
              ) : (
                <Button
                  onClick={startScanning}
                  disabled={scanning}
                  className="gap-2"
                >
                  {scanning ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Starting...
                    </>
                  ) : (
                    <>
                      <Camera className="h-4 w-4" />
                      Start Camera
                    </>
                  )}
                </Button>
              )}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Scanned borrow details */}
          {scannedBorrow && (
            <div className="rounded-lg border bg-card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-base flex items-center gap-2">
                  <Package className="h-4 w-4 text-blue-500" />
                  {scannedBorrow.assetName}
                </h3>
                <span className="text-xs text-muted-foreground font-mono bg-muted px-2 py-0.5 rounded">
                  {scannedBorrow.assetQr}
                </span>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <User className="h-3.5 w-3.5 shrink-0" />
                    Student
                  </span>
                  <span className="font-medium">{scannedBorrow.studentName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <UserRound className="h-3.5 w-3.5 shrink-0" />
                    Student ID
                  </span>
                  <span className="font-medium">{scannedBorrow.studentd}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <BookOpen className="h-3.5 w-3.5 shrink-0" />
                    Section
                  </span>
                  <span className="font-medium">{scannedBorrow.studentSection}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5 shrink-0" />
                    Borrowed
                  </span>
                  <span className="font-medium">
                    {scannedBorrow.borrowDate} {scannedBorrow.borrowTime}
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetScan}
                  className="gap-1.5"
                >
                  <Scan className="h-4 w-4" />
                  Scan Another
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleReturn}
                  disabled={returning}
                  className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {returning ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Undo2 className="h-4 w-4" />
                  )}
                  Mark as Returned
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleOpenChange(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
