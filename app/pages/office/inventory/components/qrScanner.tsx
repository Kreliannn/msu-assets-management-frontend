"use client"

import { useEffect, useRef, useState } from "react"
import { Html5Qrcode } from "html5-qrcode"
import { assetsInterface } from "@/app/types/asset.type"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  Camera,
  CameraOff,
  Loader2,
  Scan,
  Package,
  MapPin,
  Tag,
  Wrench,
  User,
  BadgeCheck,
  AlertTriangle,
  XCircle,
  AlertCircle,
  Calendar,
  DollarSign,
} from "lucide-react"

interface QrScannerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  assets: assetsInterface[]
}

const STATUS_VARIANTS: Record<string, { label: string; color: string; bg: string }> = {
  available: { label: "Available", color: "text-emerald-600", bg: "bg-emerald-500/10" },
  "in use": { label: "In Use", color: "text-amber-600", bg: "bg-amber-500/10" },
  "damaged": { label: "Damaged", color: "text-red-600", bg: "bg-red-500/10" },
  "borrowed": { label: "Borrowed", color: "text-purple-600", bg: "bg-purple-500/10" },
}

const CONDITION_VARIANTS: Record<string, { label: string; color: string; bg: string }> = {
  good: { label: "Good", color: "text-emerald-600", bg: "bg-emerald-500/10" },
  poor: { label: "Poor", color: "text-orange-600", bg: "bg-orange-500/10" },
  damaged: { label: "Damaged", color: "text-red-600", bg: "bg-red-500/10" },
}

export function QrScanner({ open, onOpenChange, assets }: QrScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const [scanning, setScanning] = useState(false)
  const [error, setError] = useState("")
  const [scannedAsset, setScannedAsset] = useState<assetsInterface | null>(null)
  const [cameraStarted, setCameraStarted] = useState(false)

  // Stop scanner on unmount or dialog close
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const startScanning = async () => {
    setError("")
    setScannedAsset(null)
    setScanning(true)

    try {
      const scanner = new Html5Qrcode("qr-reader")
      scannerRef.current = scanner

      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          // Find matching asset
          const match = assets.find((a) => a.qr === decodedText)
          if (match) {
            setScannedAsset(match)
            stopScanner()
          } else {
            setError("No asset found with this QR code")
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
      setScannedAsset(null)
      setError("")
    }
    onOpenChange(isOpen)
  }

  const resetScan = async () => {
    setScannedAsset(null)
    setError("")
    await stopScanner()
    startScanning()
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Scan className="h-5 w-5 text-primary" />
            Scan QR Code
          </DialogTitle>
          <DialogDescription>
            Point your camera at an asset&apos;s QR code to look up its details.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Scanner viewport */}
          {!scannedAsset && (
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
          {!scannedAsset && (
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

          {/* Scanned asset details */}
          {scannedAsset && (
            <div className="rounded-lg border bg-card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-base flex items-center gap-2">
                  <Package className="h-4 w-4 text-primary" />
                  {scannedAsset.name}
                </h3>
                <span className="text-xs text-muted-foreground font-mono bg-muted px-2 py-0.5 rounded">
                  {scannedAsset.qr}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-1.5">
                  <Tag className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span className="capitalize">{scannedAsset.category}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  {scannedAsset.location ? (
                    <span>{scannedAsset.location}</span>
                  ) : (
                    <span className="italic text-muted-foreground">Unassigned</span>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span>
                    {new Date(scannedAsset.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <DollarSign className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span>
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "PHP",
                    }).format(scannedAsset.value)}
                  </span>
                </div>
                <div>
                  {(CONDITION_VARIANTS[scannedAsset.condition.toLowerCase()] && (
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                        CONDITION_VARIANTS[scannedAsset.condition.toLowerCase()]?.color
                      } ${
                        CONDITION_VARIANTS[scannedAsset.condition.toLowerCase()]?.bg
                      }`}
                    >
                      {scannedAsset.condition.toLowerCase() === "good" && (
                        <BadgeCheck className="h-3 w-3" />
                      )}
                      {scannedAsset.condition.toLowerCase() === "poor" && (
                        <AlertTriangle className="h-3 w-3" />
                      )}
                      {scannedAsset.condition.toLowerCase() === "damaged" && (
                        <XCircle className="h-3 w-3" />
                      )}
                      {CONDITION_VARIANTS[scannedAsset.condition.toLowerCase()]?.label}
                    </span>
                  )) || <span className="capitalize">{scannedAsset.condition}</span>}
                </div>
                <div>
                  {(STATUS_VARIANTS[scannedAsset.status.toLowerCase()] && (
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                        STATUS_VARIANTS[scannedAsset.status.toLowerCase()]?.color
                      } ${
                        STATUS_VARIANTS[scannedAsset.status.toLowerCase()]?.bg
                      }`}
                    >
                      <BadgeCheck className="h-3 w-3" />
                      {STATUS_VARIANTS[scannedAsset.status.toLowerCase()]?.label}
                    </span>
                  )) || <span className="capitalize">{scannedAsset.status}</span>}
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-sm text-muted-foreground border-t pt-3">
                <User className="h-3.5 w-3.5 shrink-0" />
                <span>Custodian: </span>
                <span className="text-foreground">
                  {scannedAsset.custodian || (
                    <span className="italic text-muted-foreground">None</span>
                  )}
                </span>
              </div>

              <div className="flex gap-2 pt-1">
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
