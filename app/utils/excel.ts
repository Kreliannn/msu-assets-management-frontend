import ExcelJS from "exceljs"
import { saveAs } from "file-saver"

const CATEGORIES_LIST = [
  "property",
  "plant",
  "equipment",
]

const CONDITIONS_LIST = [
  "good",
  "serviceable",
  "unserviceable",
]

const EMPTY_ROWS = 25

export const downloadBlankExcelForm = async () => {
  const workbook = new ExcelJS.Workbook()

  workbook.creator = "Property Inventory System"
  workbook.created = new Date()

  const worksheet = workbook.addWorksheet("Property Inventory")

  // ── Get current date in Philippine timezone ──
  const TODAY = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Manila",
  }).format(new Date())

  // ── Column widths ──
  worksheet.columns = [
    { header: "Property Name", key: "name", width: 32 },
    { header: "Date", key: "date", width: 14 },
    { header: "Value (₱)", key: "value", width: 14 },
    { header: "Category", key: "category", width: 24 },
    { header: "Condition", key: "condition", width: 18 },
  ]

  // ── Title ──
  const titleRow = worksheet.addRow([
    "Property Inventory - Blank Form",
  ])

  worksheet.mergeCells(
    `A${titleRow.number}:E${titleRow.number}`
  )

  const titleCell = titleRow.getCell(1)

  titleCell.font = {
    bold: true,
    size: 16,
    color: { argb: "FF1F2937" },
  }

  titleCell.alignment = {
    horizontal: "center",
    vertical: "middle",
  }

  titleRow.height = 32

  // ── Subtitle ──
  const subtitleRow = worksheet.addRow([
    `Printed on: ${TODAY}`,
  ])

  worksheet.mergeCells(
    `A${subtitleRow.number}:E${subtitleRow.number}`
  )

  const subtitleCell = subtitleRow.getCell(1)

  subtitleCell.font = {
    size: 10,
    color: { argb: "FF6B7280" },
  }

  subtitleCell.alignment = {
    horizontal: "center",
  }

  // ── Blank spacer ──
  worksheet.addRow([])

  // ── Table header ──
  const headerRow = worksheet.addRow([
    "Property Name",
    "Date",
    "Value (₱)",
    "Category",
    "Condition",
  ])

  headerRow.eachCell((cell) => {
    cell.font = {
      bold: true,
      color: { argb: "FFFFFFFF" },
      size: 11,
    }

    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF3B82F6" },
    }

    cell.alignment = {
      horizontal: "center",
      vertical: "middle",
    }

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

  for (
    let i = firstDataRow;
    i <= lastDataRow;
    i++
  ) {
    const row = worksheet.addRow([
      "",
      "",
      "",
      "",
      "",
    ])

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

  // ── Data validation ──
  for (
    let i = firstDataRow;
    i <= lastDataRow;
    i++
  ) {
    // ── Date dropdown (current date only) ──
    worksheet.getCell(`B${i}`).dataValidation = {
      type: "list",
      formulae: [`"${TODAY}"`],
      showErrorMessage: true,
      errorTitle: "Invalid Date",
      error: "Please select today's date only.",
    }

    worksheet.getCell(`B${i}`).numFmt = "YYYY-MM-DD"

    // ── Category dropdown ──
    worksheet.getCell(`D${i}`).dataValidation = {
      type: "list",
      formulae: [
        `"${CATEGORIES_LIST.join(",")}"`,
      ],
      showErrorMessage: true,
      errorTitle: "Invalid Category",
      error:
        "Please select a valid category from the available list.",
    }

    // ── Condition dropdown ──
    worksheet.getCell(`E${i}`).dataValidation = {
      type: "list",
      formulae: [
        `"${CONDITIONS_LIST.join(",")}"`,
      ],
      showErrorMessage: true,
      errorTitle: "Invalid Condition",
      error:
        "Please select a valid condition from the available list.",
    }

    // ── Currency formatting ──
    worksheet.getCell(`C${i}`).numFmt =
      "₱#,##0.00"
  }

  // ── Generate file and trigger download ──
  const buffer = await workbook.xlsx.writeBuffer()

  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  })

  saveAs(
    blob,
    "property-inventory-blank-form.xlsx"
  )
}