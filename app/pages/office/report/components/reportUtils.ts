export const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

export const formatMoney = (v: unknown) => {
  const num = Number(v)
  return isNaN(num)
    ? "—"
    : "₱" +
        num.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
}

export const formatOrDash = (v: unknown) =>
  v === null || v === undefined || v === "" ? "—" : String(v)

export const newReportNo = () => {
  const d = new Date()
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(
    d.getDate()
  ).padStart(2, "0")}`
  return `RPT-${ymd}-${String(Math.floor(1000 + Math.random() * 9000))}`
}

export const formatGeneratedAt = () =>
  new Date().toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })

export const monthFilterText = (year: string, month: string) => {
  if (year !== "all" && month !== "all") return `${MONTHS[Number(month) - 1]} ${year}`
  if (year !== "all") return `Year ${year}`
  if (month !== "all") return MONTHS[Number(month) - 1]
  return ""
}

export const deriveYears = (rows: Record<string, unknown>[], dateField: string) =>
  [
    ...new Set(
      rows
        .map((r) => String(r[dateField] ?? "").slice(0, 4))
        .filter(Boolean)
    ),
  ].sort()
