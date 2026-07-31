"use client"

import { useEffect, useMemo, useState } from "react"
import axiosInstance from "@/app/utils/axios"
import { accountInterface } from "@/app/types/account.type"
import { assetsInterface } from "@/app/types/asset.type"
import { collegeInterface } from "@/app/types/college.type"
import { transferRequestInterface } from "@/app/types/transferRequest.type"
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

export default function Page() {
  const [users, setUsers] = useState<accountInterface[]>([])
  const [assets, setAssets] = useState<assetsInterface[]>([])
  const [departments, setDepartments] = useState<collegeInterface[]>([])
  const [transfers, setTransfers] = useState<transferRequestInterface[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const fetchData = async () => {
    setLoading(true)
    setError("")
    try {
      const [userRes, assetRes, deptRes, transferRes] = await Promise.all([
        axiosInstance.get("/account"),
        axiosInstance.get("/asset"),
        axiosInstance.get("/college"),
        axiosInstance.get("/system/transfer-requests"),
      ])
      setUsers(userRes.data as accountInterface[])
      setAssets(assetRes.data as assetsInterface[])
      setDepartments(deptRes.data as collegeInterface[])
      setTransfers(transferRes.data as transferRequestInterface[])
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
    return {
      users: users.length,
      assets: assets.length,
      departments: departments.length,
      pendingTransfers: pendingTransfers.length,
      available: countByStatus("available"),
      inUse: countByStatus("in use"),
      borrowed: countByStatus("borrowed"),
      underRepair: countByStatus("underrepair"),
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
            <h2 className="font-semibold text-sm">Assets by Department</h2>
          </div>
          <div className="p-4">
            {loading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={departmentData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                  <YAxis tickLine={false} axisLine={false} allowDecimals={false} width={30} />
                  <Tooltip cursor={{ fill: "hsl(var(--muted))" }} />
                  <Bar dataKey="value" name="Assets" fill="#10b981" radius={[4, 4, 0, 0]} />
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
            <h2 className="font-semibold text-sm">Users by Role</h2>
          </div>
          <div className="p-4">
            {loading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={roleData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={60}
                    outerRadius={95}
                    paddingAngle={2}
                  >
                    {roleData.map((entry, index) => (
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
