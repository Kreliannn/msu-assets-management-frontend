import ExcelJS from "exceljs"
import { saveAs } from "file-saver"

const CATEGORIES_LIST = [
  "furniture",
  "it equipment",
  "audio-visual equipment",
  "library assets",
  "office equipment",
  "laboratory equipment",
  "sport equipment",
]

const CONDITIONS_LIST = ["good", "poor", "damaged"]

const EMPTY_ROWS = 25

/**
 * Downloads a blank Property Inventory form (.xlsx) with:
 *  - Title and print date at the top
 *  - A styled header row (Property Name, Date, Value, Category, Condition)
 *  - 25 empty rows for manual entry
 *  - Date picker on the Date column
 *  - Dropdown data validation on Category and Condition columns
 *  - Currency formatting on the Value column
 */
export const downloadBlankExcelForm = async () => {
  const workbook = new ExcelJS.Workbook()
  workbook.creator = "Property Inventory System"
  workbook.created = new Date()

  const worksheet = workbook.addWorksheet("Property Inventory")

  // ── Column widths ──
  worksheet.columns = [
    { header: "Property Name", key: "name", width: 32 },
    { header: "Date", key: "date", width: 14 },
    { header: "Value (₱)", key: "value", width: 14 },
    { header: "Category", key: "category", width: 24 },
    { header: "Condition", key: "condition", width: 14 },
  ]

  // ── Title ──
  const titleRow = worksheet.addRow(["Property Inventory - Blank Form"])
  worksheet.mergeCells(`A${titleRow.number}:E${titleRow.number}`)
  const titleCell = titleRow.getCell(1)
  titleCell.font = { bold: true, size: 16, color: { argb: "FF1F2937" } }
  titleCell.alignment = { horizontal: "center", vertical: "middle" }
  titleRow.height = 32

  // ── Subtitle ──
  const subtitleRow = worksheet.addRow([`Printed on: ${new Date().toLocaleDateString()}`])
  worksheet.mergeCells(`A${subtitleRow.number}:E${subtitleRow.number}`)
  const subtitleCell = subtitleRow.getCell(1)
  subtitleCell.font = { size: 10, color: { argb: "FF6B7280" } }
  subtitleCell.alignment = { horizontal: "center" }

  // Blank spacer
  worksheet.addRow([])

  // ── Table header ──
  const headerRow = worksheet.addRow(["Property Name", "Date", "Value (₱)", "Category", "Condition"])
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 }
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF3B82F6" },
    }
    cell.alignment = { horizontal: "center", vertical: "middle" }
    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    }
  })
  headerRow.height = 24

  // ── Empty rows ──
  const firstDataRow = headerRow.number + 1
  const lastDataRow = headerRow.number + EMPTY_ROWS

  for (let i = firstDataRow; i <= lastDataRow; i++) {
    const row = worksheet.addRow(["", "", "", "", ""])
    row.eachCell((cell) => {
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      }
    })
    row.height = 20
  }

  for (let i = firstDataRow; i <= lastDataRow; i++) {
    // ── Date picker (column B) ──
    worksheet.getCell(`B${i}`).dataValidation = {
      type: "date",
      formulae: [new Date(2020, 0, 1), new Date(2030, 11, 31)],
      showErrorMessage: true,
      errorTitle: "Invalid Date",
      error: "Please select a valid date.",
    }
    worksheet.getCell(`B${i}`).numFmt = "YYYY-MM-DD"

    // ── Category dropdown (column D) ──
    worksheet.getCell(`D${i}`).dataValidation = {
      type: "list",
      formulae: [`"${CATEGORIES_LIST.join(",")}"`],
      showErrorMessage: true,
      errorTitle: "Invalid Category",
      error: "Please select a valid category from the available list.",
    }

    // ── Condition dropdown (column E) ──
    worksheet.getCell(`E${i}`).dataValidation = {
      type: "list",
      formulae: [`"${CONDITIONS_LIST.join(",")}"`],
      showErrorMessage: true,
      errorTitle: "Invalid Condition",
      error: "Please select a valid condition from the available list.",
    }

    // ── Currency formatting on Value column ──
    worksheet.getCell(`C${i}`).numFmt = '₱#,##0.00'
  }

  // ── Generate file and trigger download ──
  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  })
  saveAs(blob, "property-inventory-blank-form.xlsx")
}
