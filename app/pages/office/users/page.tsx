"use client"

import { useEffect, useState } from "react"
import { AddUserModal } from "./components/addUserModal"
import { EditUserModal } from "./components/editUserModal"
import axiosInstance from "@/app/utils/axios"
import { accountInterface } from "@/app/types/account.type"
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
  Users,
  Search,
  RefreshCw,
  AlertCircle,
  Trash2,
  User,
  Shield,
  Hash,
  Mail,
} from "lucide-react"

const roleBadge = (role: string) => {
  const styles: Record<string, string> = {
    custodian: "bg-blue-500/10 text-blue-600",
    dean: "bg-amber-500/10 text-amber-600",
    director: "bg-purple-500/10 text-purple-600",
  }
  return (
    <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium ${styles[role] || "bg-muted text-muted-foreground"}`}>
      <Shield className="h-3 w-3" />
      {role.charAt(0).toUpperCase() + role.slice(1)}
    </span>
  )
}

const statusBadge = (status: string) => {
  const active = status === "active"
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
      active ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600"
    }`}>
      <span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-green-500" : "bg-red-500"}`} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

export default function Page() {
  const [users, setUsers] = useState<accountInterface[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchUsers = async () => {
    setLoading(true)
    setError("")
    try {
      const response = await axiosInstance.get("/account")
      setUsers(response.data as accountInterface[])
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
        const axiosErr = err as { response?: { data?: { message?: string } } }
        setError(axiosErr.response?.data?.message || "Failed to fetch users")
      } else {
        setError("Failed to fetch users")
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleAddSuccess = (newUsers: accountInterface[]) => {
    setUsers(newUsers)
  }

  const handleEditSuccess = (updated: accountInterface[]) => {
    const updatedUser = updated[0]
    setUsers((prev) =>
      prev.map((u) => (u._id === updatedUser._id ? updatedUser : u))
    )
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return
    setDeletingId(id)
    try {
      await axiosInstance.delete(`/account/${id}`)
      setUsers((prev) => prev.filter((u) => u._id !== id))
    } catch {
      setError("Failed to delete user")
    } finally {
      setDeletingId(null)
    }
  }

  const filtered = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase())
  )

  const profileSrc = (u: accountInterface) =>
    u.profile ? `${process.env.NEXT_PUBLIC_BACKEND_URL_LIVE}${u.profile}` : null

  return (
    <div className="w-full min-h-dvh p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            User Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage system users and their roles.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={fetchUsers} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <AddUserModal onSuccess={handleAddSuccess} />
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name..."
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
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-lg" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <div className="rounded-full bg-muted p-4 mb-4">
            <Users className="h-10 w-10" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-1">
            {search ? "No users match your search" : "No users found"}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            {search ? "Try a different name." : "Get started by adding your first user."}
          </p>
          {!search && <AddUserModal onSuccess={handleAddSuccess} />}
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">Profile</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>ID Number</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Created Date</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-20 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((u) => (
                <TableRow key={u._id}>
                  <TableCell>
                    <div className="h-8 w-8 rounded-full border flex items-center justify-center overflow-hidden bg-muted">
                      {profileSrc(u) ? (
                        <img src={profileSrc(u)!} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <User className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{u.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <Hash className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span className="text-muted-foreground">{u.idNumber}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span className="text-muted-foreground">{u.email}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{u.dateCreated}</TableCell>
                  <TableCell>{roleBadge(u.role)}</TableCell>
                  <TableCell>{statusBadge(u.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <EditUserModal user={u} onSuccess={handleEditSuccess} />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDelete(u._id)}
                        disabled={deletingId === u._id}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
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
