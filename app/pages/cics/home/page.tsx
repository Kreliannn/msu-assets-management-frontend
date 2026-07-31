"use client"

import { useEffect, useMemo, useState } from "react"
import axiosInstance from "@/app/utils/axios"
import { assetsInterface } from "@/app/types/asset.type"
import { borrowInterface } from "@/app/types/borrow.type"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts"
import {
  Package,
  BadgeCheck,
  Circle,
  HandHelping,
  Wrench,
  AlertCircle,
  RefreshCw,
  LayoutDashboard,
  User,
  Clock,
} from "lucide-react"

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

export default function Page() {
  const [assets, setAssets] = useState<assetsInterface[]>([])
  const [borrows, setBorrows] = useState<borrowInterface[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const fetchData = async () => {
    setLoading(true)
    setError("")
    try {
      const [assetRes, borrowRes] = await Promise.all([
        axiosInstance.get("/asset"),
        axiosInstance.get("/system/borrows"),
      ])
      const allAssets = assetRes.data as assetsInterface[]
      setAssets(allAssets.filter((a) => a.location === "CICS"))
      setBorrows(borrowRes.data as borrowInterface[])
    } catch {
      setError("Failed to fetch dashboard data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const stats = useMemo(() => {
    const countByStatus = (s: string) =>
      assets.filter((a) => a.status.toLowerCase() === s).length
    return {
      total: assets.length,
      available: countByStatus("available"),
      inUse: countByStatus("in use"),
      borrowed: countByStatus("borrowed"),
      underRepair: countByStatus("underrepair"),
    }
  }, [assets])

  const activeBorrows = useMemo(
    () => borrows.filter((b) => b.status === "borrowed"),
    [borrows]
  )

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
      counts[b.borrowDate] = (counts[b.borrowDate] || 0) + 1
    })
    return Object.entries(counts)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-10)
      .map(([date, value]) => ({ date, value }))
  }, [borrows])

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
      )}

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-lg border bg-card overflow-hidden">
          <div className="px-4 py-3 border-b">
            <h2 className="font-semibold text-sm">Asset Status Distribution</h2>
          </div>
          <div className="p-4">
            {loading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={60}
                    outerRadius={95}
                    paddingAngle={2}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={index} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="rounded-lg border bg-card overflow-hidden">
          <div className="px-4 py-3 border-b">
            <h2 className="font-semibold text-sm">Assets by Category</h2>
          </div>
          <div className="p-4">
            {loading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                  <YAxis tickLine={false} axisLine={false} allowDecimals={false} width={30} />
                  <Tooltip cursor={{ fill: "hsl(var(--muted))" }} />
                  <Bar dataKey="value" name="Assets" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-lg border bg-card overflow-hidden">
          <div className="px-4 py-3 border-b">
            <h2 className="font-semibold text-sm">Borrow Activity (Last 10 Days)</h2>
          </div>
          <div className="p-4">
            {loading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
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
            )}
          </div>
        </div>

        <div className="rounded-lg border bg-card overflow-hidden">
          <div className="px-4 py-3 border-b">
            <h2 className="font-semibold text-sm">Asset Condition Distribution</h2>
          </div>
          <div className="p-4">
            {loading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={conditionData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={60}
                    outerRadius={95}
                    paddingAngle={2}
                  >
                    {conditionData.map((entry, index) => (
                      <Cell key={index} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
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
