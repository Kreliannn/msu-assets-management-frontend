import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"

export interface PdfColumn {
  key: string
  label: string
  format?: (value: unknown) => string
}

interface GenerateReportPdfOptions {
  title: string
  reportNo: string
  generatedDate: string
  filterText?: string
  columns: PdfColumn[]
  rows: Record<string, unknown>[]
  pdfName: string
}

export function generateReportPdf({
  title,
  reportNo,
  generatedDate,
  filterText,
  columns,
  rows,
  pdfName,
}: GenerateReportPdfOptions) {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()

  // Letterhead
  doc.setFontSize(13)
  doc.text("School Property Inventory System", pageWidth / 2, 15, { align: "center" })
  doc.setFontSize(9)
  doc.text("Office of the Property Custodian", pageWidth / 2, 20, { align: "center" })
  doc.setDrawColor(20)
  doc.setLineWidth(0.6)
  doc.line(14, 24, pageWidth - 14, 24)

  // Report title
  doc.setFontSize(14)
  doc.text(title, pageWidth / 2, 32, { align: "center" })

  // Meta
  doc.setFontSize(9)
  doc.text(`Report No.: ${reportNo}`, 14, 39)
  doc.text(`Date Generated: ${generatedDate}`, pageWidth - 14, 39, { align: "right" })

  let startY = 44
  if (filterText) {
    doc.text(`Filter: ${filterText}`, 14, 44)
    startY = 49
  }

  // Table
  let finalY = startY
  autoTable(doc, {
    head: [columns.map((c) => c.label)],
    body: rows.map((r) =>
      columns.map((c) => {
        const v = r[c.key]
        const s = c.format ? c.format(v) : v === null || v === undefined || v === "" ? "—" : String(v)
        return s.replace(/₱/g, "PHP ")
      })
    ),
    startY,
    styles: { fontSize: 8, cellPadding: 2 },
    theme: "grid",
    didDrawPage: (data) => {
      if (data.cursor) finalY = data.cursor.y
    },
  })

  // Signature area on the last page
  doc.setPage(doc.getNumberOfPages())
  let sigY = finalY + 14
  if (sigY > 275) {
    doc.addPage()
    sigY = 40
  }
  doc.setDrawColor(120)
  doc.setLineWidth(0.3)
  const colW = (pageWidth - 28) / 2
  doc.line(14, sigY, 14 + colW, sigY)
  doc.line(14 + colW + 14, sigY, pageWidth - 14, sigY)
  doc.setFontSize(9)
  doc.text("Prepared by (Signature over Printed Name)", 14 + colW / 2, sigY + 5, { align: "center" })
  doc.text("Noted by (Signature over Printed Name)", pageWidth / 2 + colW / 2, sigY + 5, { align: "center" })

  doc.save(`${pdfName}.pdf`)
}
