"use client"

import { useRef, useState, useCallback } from "react"
import { QRCodeSVG } from "qrcode.react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { assetsInterface } from "@/app/types/asset.type"
import {
  QrCode,
  Download,
  Loader2,
  Check,
  FileDown,
  LayoutGrid,
  Package,
  AlertCircle,
} from "lucide-react"
import { Separator } from "@/components/ui/separator"

interface BulkQrModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  assets: assetsInterface[]
  selectedIds: string[]
}

const QR_SIZE = 180
const PADDING = 24
const TEXT_HEIGHT = 28
const CELL_PADDING = 16
const CARD_RADIUS = 10

async function svgToImage(svgElement: SVGSVGElement): Promise<HTMLImageElement> {
  const svgData = new XMLSerializer().serializeToString(svgElement)
  const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" })
  const url = URL.createObjectURL(blob)

  return new Promise((resolve, reject) => {
    const img = new window.Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error("Failed to load SVG image"))
    }
    img.src = url
  })
}

function roundRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

function drawSingleQrCanvas(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  name: string,
  x: number,
  y: number,
  cellWidth: number
) {
  const svgSize = img.width
  const qrX = x + (cellWidth - svgSize) / 2
  const qrY = y + PADDING

  // White rounded card background
  const cardWidth = cellWidth - CELL_PADDING
  const cardHeight = svgSize + PADDING * 2 + TEXT_HEIGHT + 8
  roundRectPath(ctx, x + CELL_PADDING / 2, y, cardWidth, cardHeight, CARD_RADIUS)
  ctx.fillStyle = "#ffffff"
  ctx.fill()

  // Shadow
  ctx.shadowColor = "rgba(0,0,0,0.08)"
  ctx.shadowBlur = 4
  ctx.shadowOffsetY = 2
  roundRectPath(ctx, x + CELL_PADDING / 2, y, cardWidth, cardHeight, CARD_RADIUS)
  ctx.fill()
  ctx.shadowColor = "transparent"
  ctx.shadowBlur = 0
  ctx.shadowOffsetY = 0

  // Draw the QR code
  ctx.drawImage(img, qrX, qrY)

  // Draw the asset name text below the QR code
  ctx.fillStyle = "#111827"
  ctx.font = "bold 13px 'Inter', 'Segoe UI', system-ui, sans-serif"
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"

  const textY = y + PADDING + svgSize + TEXT_HEIGHT / 2 + 4
  const maxWidth = cardWidth - 16

  let displayName = name
  if (ctx.measureText(displayName).width > maxWidth) {
    while (ctx.measureText(displayName + "...").width > maxWidth) {
      displayName = displayName.slice(0, -1)
    }
    displayName += "..."
  }
  ctx.fillText(displayName, x + cellWidth / 2, textY)
}

function downloadCanvas(canvas: HTMLCanvasElement, filename: string) {
  const png = canvas.toDataURL("image/png")
  const link = document.createElement("a")
  link.download = filename
  link.href = png
  link.click()
}

export function BulkQrModal({ open, onOpenChange, assets, selectedIds }: BulkQrModalProps) {
  const qrContainerRef = useRef<HTMLDivElement>(null)
  const [individualDownloading, setIndividualDownloading] = useState(false)
  const [compositeDownloading, setCompositeDownloading] = useState(false)
  const [individualDone, setIndividualDone] = useState(false)
  const [compositeDone, setCompositeDone] = useState(false)
  const [downloadError, setDownloadError] = useState("")

  const selectedAssets = assets.filter((a) => selectedIds.includes(a._id))

  const downloadIndividual = useCallback(async () => {
    if (!qrContainerRef.current || selectedAssets.length === 0) return
    setIndividualDownloading(true)
    setDownloadError("")
    setIndividualDone(false)

    try {
      const svgElements = qrContainerRef.current.querySelectorAll<SVGSVGElement>("svg")
      const svgArray = Array.from(svgElements)

      for (let i = 0; i < selectedAssets.length; i++) {
        const svg = svgArray[i]
        if (!svg) continue
        const asset = selectedAssets[i]

        const img = await svgToImage(svg)
        const svgSize = img.width
        const totalWidth = svgSize + PADDING * 2
        const totalHeight = svgSize + PADDING * 2 + TEXT_HEIGHT + 12

        const scale = 3
        const canvas = document.createElement("canvas")
        canvas.width = totalWidth * scale
        canvas.height = totalHeight * scale
        const ctx = canvas.getContext("2d")!
        ctx.scale(scale, scale)

        // White background
        ctx.fillStyle = "#ffffff"
        roundRectPath(ctx, 0, 0, totalWidth, totalHeight, 12)
        ctx.fill()

        // QR code centered
        const qrX = (totalWidth - svgSize) / 2
        ctx.drawImage(img, qrX, PADDING)

        // Asset name
        ctx.fillStyle = "#111827"
        ctx.font = "bold 14px 'Inter', 'Segoe UI', system-ui, sans-serif"
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"

        const textY = svgSize + PADDING * 2 + 6
        let displayName = asset.name
        const maxW = totalWidth - PADDING * 2
        if (ctx.measureText(displayName).width > maxW) {
          while (ctx.measureText(displayName + "...").width > maxW) {
            displayName = displayName.slice(0, -1)
          }
          displayName += "..."
        }
        ctx.fillText(displayName, totalWidth / 2, textY)

        const filename = `qr-${asset.name.replace(/\s+/g, "-").toLowerCase()}.png`
        downloadCanvas(canvas, filename)

        // Small delay between downloads for browser to handle multiple files
        if (i < selectedAssets.length - 1) {
          await new Promise((r) => setTimeout(r, 500))
        }
      }

      setIndividualDone(true)
    } catch {
      setDownloadError("Failed to generate QR code images. Please try again.")
    } finally {
      setIndividualDownloading(false)
    }
  }, [selectedAssets])

  const downloadComposite = useCallback(async () => {
    if (!qrContainerRef.current || selectedAssets.length === 0) return
    setCompositeDownloading(true)
    setDownloadError("")
    setCompositeDone(false)

    try {
      const svgElements = qrContainerRef.current.querySelectorAll<SVGSVGElement>("svg")
      const svgArray = Array.from(svgElements)

      const svgSize = 180
      const columns = Math.min(selectedAssets.length, 3)
      const rows = Math.ceil(selectedAssets.length / columns)

      const cellWidth = svgSize + CELL_PADDING + PADDING * 2
      const cellHeight = svgSize + PADDING * 2 + TEXT_HEIGHT + 16
      const gridPadding = 32

      const totalWidth = columns * cellWidth + gridPadding * 2
      const totalHeight = rows * cellHeight + gridPadding * 2

      const scale = 3
      const canvas = document.createElement("canvas")
      canvas.width = totalWidth * scale
      canvas.height = totalHeight * scale
      const ctx = canvas.getContext("2d")!
      ctx.scale(scale, scale)

      // White background
      ctx.fillStyle = "#f8f9fa"
      ctx.fillRect(0, 0, totalWidth, totalHeight)

      // Title
      ctx.fillStyle = "#111827"
      ctx.font = "bold 16px 'Inter', 'Segoe UI', system-ui, sans-serif"
      ctx.textAlign = "center"
      ctx.textBaseline = "top"
      ctx.fillText("Asset QR Codes", totalWidth / 2, 10)

      for (let i = 0; i < selectedAssets.length && i < svgArray.length; i++) {
        const svg = svgArray[i]
        if (!svg) continue
        const asset = selectedAssets[i]

        const img = await svgToImage(svg)
        const col = i % columns
        const row = Math.floor(i / columns)
        const x = gridPadding + col * cellWidth
        const y = gridPadding + 24 + row * cellHeight

        drawSingleQrCanvas(ctx, img, asset.name, x, y, cellWidth)
      }

      const filename = `all-qr-codes.png`
      downloadCanvas(canvas, filename)

      setCompositeDone(true)
    } catch {
      setDownloadError("Failed to generate composite QR image. Please try again.")
    } finally {
      setCompositeDownloading(false)
    }
  }, [selectedAssets])

  if (selectedIds.length === 0) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <QrCode className="h-5 w-5 text-primary" />
            Download QR Codes
          </DialogTitle>
          <DialogDescription>
            Download QR codes for {selectedIds.length} selected asset(s).
          </DialogDescription>
        </DialogHeader>

        {/* Hidden QR code container for rendering */}
        <div ref={qrContainerRef} className="hidden" aria-hidden="true">
          {selectedAssets.map((asset) => (
            <div key={asset._id} data-qr={asset._id}>
              <QRCodeSVG value={asset.qr} size={QR_SIZE} level="M" includeMargin />
            </div>
          ))}
        </div>

        <div className="space-y-4 py-2">
          {/* Selected assets summary */}
          <div className="rounded-lg border bg-muted/30 p-3.5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Selected Assets
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                <Check className="h-3 w-3" />
                {selectedIds.length} selected
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {selectedAssets.slice(0, 8).map((asset) => (
                <span
                  key={asset._id}
                  className="inline-flex items-center gap-1 rounded-md bg-background px-2 py-1 text-xs"
                >
                  <Package className="h-3 w-3 text-muted-foreground shrink-0" />
                  <span className="truncate max-w-[100px]">{asset.name}</span>
                </span>
              ))}
              {selectedAssets.length > 8 && (
                <span className="text-xs text-muted-foreground px-1 self-center">
                  +{selectedAssets.length - 8} more
                </span>
              )}
            </div>
          </div>

          <Separator />

          {/* Option 1: Individual Downloads */}
          <div className="rounded-lg border p-4 space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-500/10">
                <FileDown className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold">Individual QR Codes</h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Download one QR code per image — each saved as a separate PNG with the asset name.
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-2"
              onClick={downloadIndividual}
              disabled={individualDownloading}
            >
              {individualDownloading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Downloading {selectedIds.length} files...
                </>
              ) : individualDone ? (
                <>
                  <Check className="h-4 w-4 text-emerald-500" />
                  Downloaded Successfully
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Download {selectedIds.length} QR Codes (Individual)
                </>
              )}
            </Button>
          </div>

          {/* Option 2: Composite Download */}
          <div className="rounded-lg border p-4 space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-500/10">
                <LayoutGrid className="h-5 w-5 text-purple-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold">All-in-One Sheet</h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Download all QR codes arranged on a single page in a grid layout — one image with all assets.
                </p>
              </div>
            </div>
            <Button
              size="sm"
              className="w-full gap-2"
              onClick={downloadComposite}
              disabled={compositeDownloading}
            >
              {compositeDownloading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating composite image...
                </>
              ) : compositeDone ? (
                <>
                  <Check className="h-4 w-4 text-emerald-500" />
                  Downloaded Successfully
                </>
              ) : (
                <>
                  <LayoutGrid className="h-4 w-4" />
                  Download All-in-One Sheet (1 Image)
                </>
              )}
            </Button>
          </div>

          {/* Error */}
          {downloadError && (
            <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {downloadError}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setIndividualDone(false)
              setCompositeDone(false)
              setDownloadError("")
              onOpenChange(false)
            }}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
