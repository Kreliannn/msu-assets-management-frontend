"use client"

import { useEffect, useState } from "react"
import axiosInstance from "@/app/utils/axios"
import { logsInterface } from "@/app/types/logs.type"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  History,
  Search,
  RefreshCw,
  AlertCircle,
  Plus,
  Pencil,
  Trash2,
  Ellipsis,
  Clock,
} from "lucide-react"

const typeIcon = (type: string) => {
  const map: Record<string, { icon: typeof Plus; className: string }> = {
    create: { icon: Plus, className: "text-green-600" },
    update: { icon: Pencil, className: "text-blue-600" },
    delete: { icon: Trash2, className: "text-red-600" },
    others: { icon: Ellipsis, className: "text-muted-foreground" },
  }
  const { icon: Icon, className } = map[type] || map.others
  return <Icon className={`h-4 w-4 ${className}`} />
}

const typeBadge = (type: string) => {
  const styles: Record<string, string> = {
    create: "bg-green-500/10 text-green-600",
    update: "bg-blue-500/10 text-blue-600",
    delete: "bg-red-500/10 text-red-600",
    others: "bg-muted text-muted-foreground",
  }
  return (
    <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium ${styles[type] || "bg-muted text-muted-foreground"}`}>
      {typeIcon(type)}
      {type.charAt(0).toUpperCase() + type.slice(1)}
    </span>
  )
}

export default function Page() {
  const [logs, setLogs] = useState<logsInterface[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")

  const fetchLogs = async () => {
    setLoading(true)
    setError("")
    try {
      const response = await axiosInstance.get("/logs")
      setLogs(response.data as logsInterface[])
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
        const axiosErr = err as { response?: { data?: { message?: string } } }
        setError(axiosErr.response?.data?.message || "Failed to fetch logs")
      } else {
        setError("Failed to fetch logs")
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [])

  const filtered = logs.filter((l) =>
    l.description.toLowerCase().includes(search.toLowerCase()) ||
    l.entity.toLowerCase().includes(search.toLowerCase()) ||
    l.performedBy.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="w-full min-h-dvh p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <History className="h-6 w-6 text-primary" />
            Activity Logs
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Monitor all system activities and changes.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={fetchLogs} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by description, entity, or user..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8"
        />
      </div>

      {/* Error Banner */}
      {error && (
        <div className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto h-auto p-1 text-destructive hover:text-destructive"
            onClick={() => setError("")}
          >
            Dismiss
          </Button>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-lg" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <div className="rounded-full bg-muted p-4 mb-4">
            <History className="h-10 w-10" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-1">
            {search ? "No logs match your search" : "No activity logs yet"}
          </h3>
          <p className="text-sm text-muted-foreground">
            {search ? "Try different search terms." : "System activities will appear here."}
          </p>
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
              
                <TableHead>Type</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((l) => (
                <TableRow key={l._id}>
              
                  <TableCell>{typeBadge(l.type)}</TableCell>
                  <TableCell className="font-medium">{l.entity}</TableCell>
                  <TableCell className="max-w-md truncate">{l.description}</TableCell>
                      <TableCell className="text-muted-foreground whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      {l.date}
                    </div>
                  </TableCell>
                 
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
