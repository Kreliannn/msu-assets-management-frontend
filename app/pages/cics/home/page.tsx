"use client"

import { useEffect, useMemo, useState } from "react"
import axiosInstance from "@/app/utils/axios"
import { assetsInterface } from "@/app/types/asset.type"
import { borrowInterface } from "@/app/types/borrow.type"
import { transferRequestInterface } from "@/app/types/transferRequest.type"
import { disposalRecordInterface } from "@/app/types/disposalRecord.type"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts"
import {
  Package,
  Circle,
  HandHelping,
  Wrench,
  AlertCircle,
  RefreshCw,
  LayoutDashboard,
  User,
  Clock,
  Trash2,
  Coins,
  Percent,
  Activity,
} from "lucide-react"
import type { ReactNode } from "react"

const STATUS_COLORS: Record<string, string> = {
  available: "#10b981",
  "in use": "#f59e0b",
  borrowed: "#3b82f6",
  underrepair: "#ea580c",
  disposed: "#ef4444",
}

const STATUS_LABELS: Record<string, string> = {
  available: "Available",
  "in use": "In Use",
  borrowed: "Borrowed",
  underrepair: "Under Repair",
  disposed: "Disposed",
}

const CONDITION_COLORS: Record<string, string> = {
  good: "#10b981",
  serviceable: "#f59e0b",
  unserviceable: "#ef4444",
}

const CONDITION_LABELS: Record<string, string> = {
  good: "Good",
  serviceable: "Serviceable",
  unserviceable: "Unserviceable",
}

const BORROW_STATUS_COLORS: Record<string, string> = {
  borrowed: "#3b82f6",
  returned: "#10b981",
}

const TRANSFER_STATUS_COLORS: Record<string, string> = {
  pending: "#f59e0b",
  approved: "#10b981",
  rejected: "#ef4444",
}

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
]

const formatPeso = (v: unknown) =>
  "₱" + Number(v ?? 0).toLocaleString("en-US", { maximumFractionDigits: 2 })

const monthLabel = (key: string) => {
  const [y, m] = key.split("-")
  const idx = Number(m) - 1
  return MONTH_NAMES[idx] ? `${MONTH_NAMES[idx]} ${y}` : key
}

const monthlySeries = (dates: string[], limit = 12) => {
  const counts: Record<string, number> = {}
  dates.forEach((d) => {
    if (!d || d.length < 7) return
    const key = d.slice(0, 7)
    counts[key] = (counts[key] || 0) + 1
  })
  return Object.entries(counts)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-limit)
    .map(([key, value]) => ({ name: monthLabel(key), value }))
}

function ChartCard({
  title,
  loading,
  empty,
  children,
}: {
  title: string
  loading?: boolean
  empty?: boolean
  children: ReactNode
}) {
  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <div className="px-4 py-3 border-b">
        <h2 className="font-semibold text-sm">{title}</h2>
      </div>
      <div className="p-4">
        {loading ? (
          <Skeleton className="h-[300px] w-full" />
        ) : empty ? (
          <p className="h-[300px] flex items-center justify-center text-sm text-muted-foreground">
            No data available.
          </p>
        ) : (
          children
        )}
      </div>
    </div>
  )
}

export default function Page() {
  const [assets, setAssets] = useState<assetsInterface[]>([])
  const [borrows, setBorrows] = useState<borrowInterface[]>([])
  const [transfers, setTransfers] = useState<transferRequestInterface[]>([])
  const [disposals, setDisposals] = useState<disposalRecordInterface[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const fetchData = async () => {
    setLoading(true)
    setError("")
    try {
      const [assetRes, borrowRes, transferRes, disposalRes] = await Promise.all([
        axiosInstance.get("/asset"),
        axiosInstance.get("/system/borrows"),
        axiosInstance.get("/system/transfer-requests"),
        axiosInstance.get("/system/disposal-records"),
      ])
      const allAssets = assetRes.data as assetsInterface[]
      const allTransfers = transferRes.data as transferRequestInterface[]
      const allDisposals = disposalRes.data as disposalRecordInterface[]
      setAssets(allAssets.filter((a) => a.location === "CICS"))
      setBorrows(borrowRes.data as borrowInterface[])
      setTransfers(allTransfers.filter((t) => t.college === "CICS"))
      setDisposals(allDisposals.filter((d) => d.college === "CICS"))
    } catch {
      setError("Failed to fetch dashboard data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const activeBorrows = useMemo(
    () => borrows.filter((b) => b.status === "borrowed"),
    [borrows]
  )

  const stats = useMemo(() => {
    const countByStatus = (s: string) =>
      assets.filter((a) => a.status.toLowerCase() === s).length
    const total = assets.length
    const disposed = countByStatus("disposed")
    const inUse = countByStatus("in use")
    const borrowedCount = countByStatus("borrowed")
    return {
      total,
      available: countByStatus("available"),
      inUse,
      borrowed: borrowedCount,
      underRepair: countByStatus("underrepair"),
      disposed,
      totalValue: assets.reduce((sum, a) => sum + (Number(a.value) || 0), 0),
      disposalRate: total > 0 ? (disposed / total) * 100 : 0,
      utilizationRate:
        total > 0 ? ((inUse + borrowedCount) / total) * 100 : 0,
    }
  }, [assets])

  const statusData = useMemo(() => {
    const counts: Record<string, number> = {}
    assets.forEach((a) => {
      const s = a.status.toLowerCase()
      counts[s] = (counts[s] || 0) + 1
    })
    return Object.entries(counts)
      .filter(([s]) => STATUS_COLORS[s])
      .map(([s, value]) => ({
        name: STATUS_LABELS[s] || s,
        value,
        fill: STATUS_COLORS[s],
      }))
  }, [assets])

  const conditionData = useMemo(() => {
    const counts: Record<string, number> = {}
    assets.forEach((a) => {
      const c = a.condition.toLowerCase()
      counts[c] = (counts[c] || 0) + 1
    })
    return Object.entries(counts)
      .filter(([c]) => CONDITION_COLORS[c])
      .map(([c, value]) => ({
        name: CONDITION_LABELS[c] || c,
        value,
        fill: CONDITION_COLORS[c],
      }))
  }, [assets])

  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {}
    assets.forEach((a) => {
      const cat = a.category.toLowerCase()
      counts[cat] = (counts[cat] || 0) + 1
    })
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([cat, value]) => ({
        name: cat.charAt(0).toUpperCase() + cat.slice(1),
        value,
      }))
  }, [assets])

  const borrowActivity = useMemo(() => {
    const counts: Record<string, number> = {}
    borrows.forEach((b) => {
      if (!b.borrowDate || b.borrowDate.length < 7) return
      counts[b.borrowDate] = (counts[b.borrowDate] || 0) + 1
    })
    return Object.entries(counts)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-10)
      .map(([date, value]) => ({ date, value }))
  }, [borrows])

  const borrowOutcomeData = useMemo(() => {
    const counts: Record<string, number> = {}
    borrows.forEach((b) => {
      const s = b.status.toLowerCase()
      counts[s] = (counts[s] || 0) + 1
    })
    return Object.entries(counts).map(([s, value]) => ({
      name: s.charAt(0).toUpperCase() + s.slice(1),
      value,
      fill: BORROW_STATUS_COLORS[s] || "#94a3b8",
    }))
  }, [borrows])

  const borrowsBySectionData = useMemo(() => {
    const counts: Record<string, number> = {}
    borrows.forEach((b) => {
      const sec = b.studentSection?.trim() || "Unknown"
      counts[sec] = (counts[sec] || 0) + 1
    })
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, value]) => ({ name, value }))
  }, [borrows])

  const topBorrowedAssetsData = useMemo(() => {
    const counts: Record<string, number> = {}
    borrows.forEach((b) => {
      counts[b.assetName] = (counts[b.assetName] || 0) + 1
    })
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, value]) => ({ name, value }))
  }, [borrows])

  const cicsTransferStatusData = useMemo(() => {
    const counts: Record<string, number> = {}
    transfers.forEach((t) => {
      counts[t.status] = (counts[t.status] || 0) + 1
    })
    return Object.entries(counts).map(([status, value]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value,
      fill: TRANSFER_STATUS_COLORS[status] || "#94a3b8",
    }))
  }, [transfers])

  const acquisitionTrend = useMemo(
    () => monthlySeries(assets.map((a) => a.date)),
    [assets]
  )

  const disposalsTrend = useMemo(
    () => monthlySeries(disposals.map((d) => d.date)),
    [disposals]
  )

  const valueByCategoryData = useMemo(() => {
    const sums: Record<string, number> = {}
    assets.forEach((a) => {
      const cat = a.category.toLowerCase()
      sums[cat] = (sums[cat] || 0) + (Number(a.value) || 0)
    })
    return Object.entries(sums)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([cat, value]) => ({
        name: cat.charAt(0).toUpperCase() + cat.slice(1),
        value,
      }))
  }, [assets])

  const recentActiveBorrows = useMemo(
    () => activeBorrows.slice(0, 5),
    [activeBorrows]
  )

  const formatDate = (d: string) => {
    const parts = d.split("-")
    return parts.length === 3 ? `${parts[1]}/${parts[2]}` : d
  }

  const statCards = [
    { label: "Total Assets", value: stats.total, icon: Package, color: "text-primary bg-primary/10" },
    { label: "In Use", value: stats.inUse, icon: Circle, color: "text-amber-600 bg-amber-500/10" },
    { label: "Borrowed", value: stats.borrowed, icon: HandHelping, color: "text-blue-600 bg-blue-500/10" },
    { label: "Under Repair", value: stats.underRepair, icon: Wrench, color: "text-orange-600 bg-orange-500/10" },
  ]

  const rateCards = [
    { label: "Total Asset Value", value: formatPeso(stats.totalValue), icon: Coins, color: "text-yellow-600 bg-yellow-500/10" },
    { label: "Utilization Rate", value: `${stats.utilizationRate.toFixed(1)}%`, icon: Activity, color: "text-sky-600 bg-sky-500/10" },
    { label: "Disposed Assets", value: stats.disposed, icon: Trash2, color: "text-red-600 bg-red-500/10" },
    { label: "Disposal Rate", value: `${stats.disposalRate.toFixed(1)}%`, icon: Percent, color: "text-orange-600 bg-orange-500/10" },
  ]

  return (
    <div className="w-full min-h-dvh p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <LayoutDashboard className="h-6 w-6 text-blue-500" />
            CICS Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Overview of CICS property assets and borrow activity.
          </p>
        </div>
        <Button variant="outline" size="icon" onClick={fetchData} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
          <Button variant="ghost" size="sm" className="ml-auto h-auto p-1" onClick={() => setError("")}>
            Dismiss
          </Button>
        </div>
      )}

      {/* Stat Cards */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {statCards.map((card) => {
              const Icon = card.icon
              return (
                <div
                  key={card.label}
                  className="rounded-lg border bg-card p-4 flex items-center gap-3"
                >
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full ${card.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground truncate">{card.label}</p>
                    <p className="text-2xl font-bold tabular-nums">{card.value}</p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Rate Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {rateCards.map((card) => {
              const Icon = card.icon
              return (
                <div
                  key={card.label}
                  className="rounded-lg border bg-card p-4 flex items-center gap-3"
                >
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full ${card.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground truncate">{card.label}</p>
                    <p className="text-xl font-bold tabular-nums truncate">{card.value}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* Charts Row 1: Status / Category */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Asset Status Distribution" loading={loading} empty={statusData.length === 0}>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={95} paddingAngle={2}>
                {statusData.map((entry, index) => (
                  <Cell key={index} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Assets by Category" loading={loading} empty={categoryData.length === 0}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
              <YAxis tickLine={false} axisLine={false} allowDecimals={false} width={30} />
              <Tooltip cursor={{ fill: "hsl(var(--muted))" }} />
              <Bar dataKey="value" name="Assets" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Charts Row 2: Borrow Activity / Condition */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Borrow Activity (Last 10 Days)" loading={loading} empty={borrowActivity.length === 0}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={borrowActivity}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12 }}
                tickFormatter={formatDate}
              />
              <YAxis tickLine={false} axisLine={false} allowDecimals={false} width={30} />
              <Tooltip
                cursor={{ fill: "hsl(var(--muted))" }}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Bar dataKey="value" name="Borrows" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Asset Condition Distribution" loading={loading} empty={conditionData.length === 0}>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={conditionData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={95} paddingAngle={2}>
                {conditionData.map((entry, index) => (
                  <Cell key={index} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Charts Row 3: Borrow Outcome / Borrows by Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Borrow Outcome" loading={loading} empty={borrowOutcomeData.length === 0}>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={borrowOutcomeData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={95} paddingAngle={2}>
                {borrowOutcomeData.map((entry, index) => (
                  <Cell key={index} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Borrows by Section (Top 8)" loading={loading} empty={borrowsBySectionData.length === 0}>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={borrowsBySectionData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
              <XAxis type="number" tickLine={false} axisLine={false} allowDecimals={false} tick={{ fontSize: 12 }} />
              <YAxis type="category" dataKey="name" width={110} tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
              <Tooltip cursor={{ fill: "hsl(var(--muted))" }} />
              <Bar dataKey="value" name="Borrows" fill="#14b8a6" radius={[0, 4, 4, 0]} barSize={18} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Charts Row 4: Top Borrowed Assets / Transfer Requests */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Most Borrowed Assets (Top 8)" loading={loading} empty={topBorrowedAssetsData.length === 0}>
          <ResponsiveContainer width="100%" height={Math.max(280, topBorrowedAssetsData.length * 36)}>
            <BarChart data={topBorrowedAssetsData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
              <XAxis type="number" tickLine={false} axisLine={false} allowDecimals={false} tick={{ fontSize: 12 }} />
              <YAxis type="category" dataKey="name" width={150} tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
              <Tooltip cursor={{ fill: "hsl(var(--muted))" }} />
              <Bar dataKey="value" name="Times Borrowed" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={16} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Transfer Requests Involving CICS" loading={loading} empty={cicsTransferStatusData.length === 0}>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={cicsTransferStatusData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={95} paddingAngle={2}>
                {cicsTransferStatusData.map((entry, index) => (
                  <Cell key={index} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Acquisitions Trend */}
      <ChartCard title="Asset Acquisitions Trend (Monthly)" loading={loading} empty={acquisitionTrend.length === 0}>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={acquisitionTrend}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
            <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
            <YAxis tickLine={false} axisLine={false} allowDecimals={false} width={30} />
            <Tooltip labelFormatter={(label) => `Month: ${label}`} />
            <Area type="monotone" dataKey="value" name="Acquired" stroke="#6366f1" fill="#6366f1" fillOpacity={0.15} strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Charts Row 5: Disposals / Value by Category */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Disposals per Month" loading={loading} empty={disposalsTrend.length === 0}>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={disposalsTrend}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
              <YAxis tickLine={false} axisLine={false} allowDecimals={false} width={30} />
              <Tooltip cursor={{ fill: "hsl(var(--muted))" }} labelFormatter={(label) => `Month: ${label}`} />
              <Bar dataKey="value" name="Disposals" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Asset Value by Category (Top 8)" loading={loading} empty={valueByCategoryData.length === 0}>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={valueByCategoryData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
              <XAxis type="number" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
              <YAxis type="category" dataKey="name" width={120} tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
              <Tooltip cursor={{ fill: "hsl(var(--muted))" }} formatter={(value) => [formatPeso(value), "Total Value"]} />
              <Bar dataKey="value" fill="#eab308" radius={[0, 4, 4, 0]} barSize={18} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Currently Borrowed */}
      <div className="rounded-lg border bg-card overflow-hidden">
        <div className="px-4 py-3 border-b flex items-center gap-2 bg-blue-500/5">
          <HandHelping className="h-4 w-4 text-blue-500" />
          <h2 className="font-semibold text-sm">Currently Borrowed</h2>
          <span className="ml-auto text-xs text-muted-foreground">
            {activeBorrows.length} active
          </span>
        </div>
        {loading ? (
          <div className="p-4 space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : recentActiveBorrows.length === 0 ? (
          <p className="p-4 text-sm text-muted-foreground text-center">
            No assets currently borrowed.
          </p>
        ) : (
          <div className="divide-y">
            {recentActiveBorrows.map((b) => (
              <div key={b._id} className="flex items-center gap-3 px-4 py-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-500/10">
                  <Package className="h-4 w-4 text-blue-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{b.assetName}</p>
                  <p className="text-xs text-muted-foreground truncate">{b.assetQr}</p>
                </div>
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium flex items-center gap-1 justify-end">
                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                    {b.studentName}
                  </p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                    <Clock className="h-3 w-3" />
                    {b.borrowDate} {b.borrowTime}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
