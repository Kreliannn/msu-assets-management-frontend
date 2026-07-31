"use client"

import { useRef } from "react"
import { QRCodeSVG } from "qrcode.react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Download, QrCode } from "lucide-react"

interface DisplayQrProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  qrValue: string
  assetName: string
}

export function DisplayQr({ open, onOpenChange, qrValue, assetName }: DisplayQrProps) {
  const qrRef = useRef<HTMLDivElement>(null)

  const handleDownload = () => {
    const svg = qrRef.current?.querySelector("svg")
    if (!svg) return

    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const img = new window.Image()

    img.onload = () => {
      // Original SVG size (before scaling)
      const svgSize = img.width
      const padding = 40
      const textHeight = 32
      const textPadding = 8
      const totalWidth = svgSize + padding * 2
      const totalHeight = svgSize + padding * 2 + textHeight + textPadding * 2

      // Scale up 4x for high-resolution PNG
      const scale = 4
      canvas.width = totalWidth * scale
      canvas.height = totalHeight * scale
      ctx.scale(scale, scale)

      // White background
      ctx.fillStyle = "#ffffff"
      ctx.fillRect(0, 0, totalWidth, totalHeight)

      // Draw rounded rectangle background
      const radius = 12
      ctx.beginPath()
      ctx.moveTo(radius, 0)
      ctx.lineTo(totalWidth - radius, 0)
      ctx.quadraticCurveTo(totalWidth, 0, totalWidth, radius)
      ctx.lineTo(totalWidth, totalHeight - radius)
      ctx.quadraticCurveTo(totalWidth, totalHeight, totalWidth - radius, totalHeight)
      ctx.lineTo(radius, totalHeight)
      ctx.quadraticCurveTo(0, totalHeight, 0, totalHeight - radius)
      ctx.lineTo(0, radius)
      ctx.quadraticCurveTo(0, 0, radius, 0)
      ctx.closePath()
      ctx.fill()

      // Draw the QR code centered in the top portion
      const qrX = (totalWidth - svgSize) / 2
      const qrY = padding
      ctx.drawImage(img, qrX, qrY)

      // Draw the asset name text below the QR code
      ctx.fillStyle = "#111827"
      ctx.font = "bold 14px 'Inter', 'Segoe UI', system-ui, sans-serif"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"

      const textY = svgSize + padding * 2 + textPadding + textHeight / 2

      // Truncate name if too long
      const maxWidth = totalWidth - padding * 2
      let displayName = assetName
      if (ctx.measureText(displayName).width > maxWidth) {
        while (ctx.measureText(displayName + "...").width > maxWidth) {
          displayName = displayName.slice(0, -1)
        }
        displayName += "..."
      }
      ctx.fillText(displayName, totalWidth / 2, textY)

      // Export as PNG
      const png = canvas.toDataURL("image/png")
      const link = document.createElement("a")
      link.download = `qr-${assetName.replace(/\s+/g, "-").toLowerCase()}.png`
      link.href = png
      link.click()
    }

    // Handle SVG loading error for btoa
    try {
      img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)))
    } catch {
      img.src = "data:image/svg+xml," + encodeURIComponent(svgData)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[380px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5 text-primary" />
            Asset QR Code
          </DialogTitle>
          <DialogDescription>
            Scan this QR code to view {assetName}&apos;s details.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-4">
          {/* QR Code with asset name */}
          <div
            ref={qrRef}
            className="flex flex-col items-center rounded-xl border bg-white p-5 shadow-sm"
          >
            <QRCodeSVG
              value={qrValue}
              size={200}
              level="M"
              includeMargin
            />
            <span className="mt-3 text-sm font-semibold text-gray-800 text-center max-w-[200px] truncate">
              {assetName}
            </span>
          </div>

          {/* Download button */}
          <Button onClick={handleDownload} className="w-full gap-2">
            <Download className="h-4 w-4" />
            Download QR Code
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
