"use client"

import { useEffect, useMemo, useState } from "react"
import axiosInstance from "@/app/utils/axios"
import { accountInterface } from "@/app/types/account.type"
import { assetsInterface } from "@/app/types/asset.type"
import { collegeInterface } from "@/app/types/college.type"
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
  Users,
  Package,
  Building2,
  Send,
  BadgeCheck,
  Circle,
  HandHelping,
  Wrench,
  AlertCircle,
  RefreshCw,
  LayoutDashboard,
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

const ROLE_COLORS = [
  "#6366f1",
  "#10b981",
  "#f59e0b",
  "#3b82f6",
  "#ea580c",
  "#8b5cf6",
  "#ef4444",
  "#14b8a6",
]

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
  const [users, setUsers] = useState<accountInterface[]>([])
  const [assets, setAssets] = useState<assetsInterface[]>([])
  const [departments, setDepartments] = useState<collegeInterface[]>([])
  const [transfers, setTransfers] = useState<transferRequestInterface[]>([])
  const [disposals, setDisposals] = useState<disposalRecordInterface[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const fetchData = async () => {
    setLoading(true)
    setError("")
    try {
      const [userRes, assetRes, deptRes, transferRes, disposalRes] =
        await Promise.all([
          axiosInstance.get("/account"),
          axiosInstance.get("/asset"),
          axiosInstance.get("/college"),
          axiosInstance.get("/system/transfer-requests"),
          axiosInstance.get("/system/disposal-records"),
        ])
      setUsers(userRes.data as accountInterface[])
      setAssets(assetRes.data as assetsInterface[])
      setDepartments(deptRes.data as collegeInterface[])
      setTransfers(transferRes.data as transferRequestInterface[])
      setDisposals(disposalRes.data as disposalRecordInterface[])
    } catch {
      setError("Failed to fetch dashboard data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const pendingTransfers = useMemo(
    () => transfers.filter((t) => t.status === "pending"),
    [transfers]
  )

  const stats = useMemo(() => {
    const countByStatus = (s: string) =>
      assets.filter((a) => a.status.toLowerCase() === s).length
    const total = assets.length
    const disposed = countByStatus("disposed")
    const inUse = countByStatus("in use")
    const borrowed = countByStatus("borrowed")
    return {
      users: users.length,
      assets: total,
      departments: departments.length,
      pendingTransfers: pendingTransfers.length,
      available: countByStatus("available"),
      inUse,
      borrowed,
      underRepair: countByStatus("underrepair"),
      disposed,
      totalValue: assets.reduce((sum, a) => sum + (Number(a.value) || 0), 0),
      disposalRate: total > 0 ? (disposed / total) * 100 : 0,
      utilizationRate:
        total > 0 ? ((inUse + borrowed) / total) * 100 : 0,
    }
  }, [users, assets, departments, pendingTransfers])

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

  const roleData = useMemo(() => {
    const counts: Record<string, number> = {}
    users.forEach((u) => {
      const r = u.role.toLowerCase()
      counts[r] = (counts[r] || 0) + 1
    })
    return Object.entries(counts).map(([role, value], i) => ({
      name: role.charAt(0).toUpperCase() + role.slice(1),
      value,
      fill: ROLE_COLORS[i % ROLE_COLORS.length],
    }))
  }, [users])

  const departmentData = useMemo(() => {
    const counts: Record<string, number> = {}
    assets.forEach((a) => {
      const loc = a.location ?? "Unassigned"
      counts[loc] = (counts[loc] || 0) + 1
    })
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([name, value]) => ({ name, value }))
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

  const conditionData = useMemo(() => {
    const counts: Record<string, number> = {}
    assets.forEach((a) => {
      const c = a.condition.toLowerCase()
      counts[c] = (counts[c] || 0) + 1
    })
    return Object.entries(counts).map(([c, value]) => ({
      name: CONDITION_LABELS[c] || c.charAt(0).toUpperCase() + c.slice(1),
      value,
      fill: CONDITION_COLORS[c] || "#94a3b8",
    }))
  }, [assets])

  const transferStatusData = useMemo(() => {
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

  const topCustodiansData = useMemo(() => {
    const counts: Record<string, number> = {}
    assets.forEach((a) => {
      if (!a.custodian) return
      counts[a.custodian] = (counts[a.custodian] || 0) + 1
    })
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, value]) => ({ name, value }))
  }, [assets])

  const recentPendingTransfers = useMemo(
    () =>
      [...pendingTransfers]
        .sort((a, b) => (a.date < b.date ? 1 : -1))
        .slice(0, 6),
    [pendingTransfers]
  )

  const statCards = [
    { label: "Total Users", value: stats.users, icon: Users, color: "text-violet-600 bg-violet-500/10" },
    { label: "Total Assets", value: stats.assets, icon: Package, color: "text-primary bg-primary/10" },
    { label: "Departments", value: stats.departments, icon: Building2, color: "text-emerald-600 bg-emerald-500/10" },
    { label: "Pending Transfers", value: stats.pendingTransfers, icon: Send, color: "text-amber-600 bg-amber-500/10" },
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
            Office Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            System-wide overview of users, assets, departments, and transfer requests.
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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

      {/* Charts Row 1: Status / Department */}
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

        <ChartCard title="Assets by Department" loading={loading} empty={departmentData.length === 0}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={departmentData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
              <YAxis tickLine={false} axisLine={false} allowDecimals={false} width={30} />
              <Tooltip cursor={{ fill: "hsl(var(--muted))" }} />
              <Bar dataKey="value" name="Assets" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Charts Row 2: Role / Category */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Users by Role" loading={loading} empty={roleData.length === 0}>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={roleData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={95} paddingAngle={2}>
                {roleData.map((entry, index) => (
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

      {/* Charts Row 3: Condition / Transfer Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

        <ChartCard title="Transfer Requests by Status" loading={loading} empty={transferStatusData.length === 0}>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={transferStatusData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={95} paddingAngle={2}>
                {transferStatusData.map((entry, index) => (
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

      {/* Charts Row 4: Value by Category / Disposals per Month */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
      </div>

      {/* Top Custodians */}
      <ChartCard title="Top Custodians by Asset Count" loading={loading} empty={topCustodiansData.length === 0}>
        <ResponsiveContainer width="100%" height={Math.max(200, topCustodiansData.length * 40)}>
          <BarChart data={topCustodiansData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
            <XAxis type="number" tickLine={false} axisLine={false} allowDecimals={false} tick={{ fontSize: 12 }} />
            <YAxis type="category" dataKey="name" width={180} tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
            <Tooltip cursor={{ fill: "hsl(var(--muted))" }} />
            <Bar dataKey="value" name="Assets" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={18} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Asset Status Summary */}
      {!loading && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Available", value: stats.available, icon: BadgeCheck, color: "text-emerald-600 bg-emerald-500/10" },
            { label: "In Use", value: stats.inUse, icon: Circle, color: "text-amber-600 bg-amber-500/10" },
            { label: "Borrowed", value: stats.borrowed, icon: HandHelping, color: "text-blue-600 bg-blue-500/10" },
            { label: "Under Repair", value: stats.underRepair, icon: Wrench, color: "text-orange-600 bg-orange-500/10" },
          ].map((card) => {
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

      {/* Pending Transfer Requests */}
      <div className="rounded-lg border bg-card overflow-hidden">
        <div className="px-4 py-3 border-b flex items-center gap-2 bg-amber-500/5">
          <Send className="h-4 w-4 text-amber-500" />
          <h2 className="font-semibold text-sm">Pending Transfer Requests</h2>
          <span className="ml-auto text-xs text-muted-foreground">
            {pendingTransfers.length} pending
          </span>
        </div>
        {loading ? (
          <div className="p-4 space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : recentPendingTransfers.length === 0 ? (
          <p className="p-4 text-sm text-muted-foreground text-center">
            No pending transfer requests.
          </p>
        ) : (
          <div className="divide-y">
            {recentPendingTransfers.map((t) => (
              <div key={t._id} className="flex items-center gap-3 px-4 py-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-500/10">
                  <Package className="h-4 w-4 text-amber-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{t.assetname}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    To {t.college ?? "Unassigned"} / {t.custodian ?? "No custodian"}
                  </p>
                </div>
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium">{t.date}</p>
                  <p className="text-xs text-muted-foreground uppercase">Pending</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
