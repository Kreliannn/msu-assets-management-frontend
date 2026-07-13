"use client"

import { useEffect, useState } from "react"
import { AddCollegeModal } from "./components/addCollegeModal"
import { EditCollegeModal } from "./components/editCollegeModal"
import axiosInstance from "@/app/utils/axios"
import { collegeInterface } from "@/app/types/college.type"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Building2,
  GraduationCap,
  User,
  Mail,
  Hash,
  RefreshCw,
  AlertCircle,
  Trash2,
  BadgeCheck,
} from "lucide-react"

export default function Page() {
  const [colleges, setColleges] = useState<collegeInterface[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchColleges = async () => {
    setLoading(true)
    setError("")
    try {
      const response = await axiosInstance.get("/college")
      setColleges(response.data as collegeInterface[])
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
        const axiosErr = err as { response?: { data?: { message?: string } } }
        setError(axiosErr.response?.data?.message || "Failed to fetch colleges")
      } else {
        setError("Failed to fetch colleges")
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchColleges()
  }, [])

  const handleAddSuccess = (newColleges: collegeInterface[]) => {
    setColleges(newColleges)
  }

  const handleEditSuccess = (updated: collegeInterface[]) => {
    const updatedCollege = updated[0]
    setColleges((prev) =>
      prev.map((c) => (c._id === updatedCollege._id ? updatedCollege : c))
    )
    setError("")
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this college?")) return
    setDeletingId(id)
    try {
      await axiosInstance.delete(`/college/${id}`)
      setColleges((prev) => prev.filter((c) => c._id !== id))
    } catch {
      setError("Failed to delete college")
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="w-full min-h-dvh p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Building2 className="h-6 w-6 text-primary" />
            Department Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage college departments, deans, and custodians.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={fetchColleges} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <AddCollegeModal onSuccess={handleAddSuccess} />
        </div>
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

      {/* College Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl border bg-card p-5 space-y-4">
              <Skeleton className="h-6 w-48" />
              <div className="space-y-3">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-3 w-28" />
                  <Skeleton className="h-3 w-40" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-3 w-28" />
                  <Skeleton className="h-3 w-40" />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <Skeleton className="h-8 w-8 rounded-md" />
                <Skeleton className="h-8 w-8 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      ) : colleges.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <div className="rounded-full bg-muted p-4 mb-4">
            <Building2 className="h-10 w-10" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-1">No colleges found</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Get started by adding your first college department.
          </p>
          <AddCollegeModal onSuccess={handleAddSuccess} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {colleges.map((college) => (
            <div
              key={college._id}
              className="group rounded-xl border bg-card hover:shadow-md transition-all duration-200 overflow-hidden"
            >
              {/* Card Header */}
              <div className="border-b bg-muted/30 px-5 py-3.5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="rounded-lg bg-primary/10 p-2 shrink-0">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-base leading-tight truncate">
                        {college.department}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">College Department</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5 shrink-0 opacity-60 group-hover:opacity-100 transition-opacity">
                    <EditCollegeModal college={college} onSuccess={handleEditSuccess} />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(college._id)}
                      disabled={deletingId === college._id}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 space-y-4">
                {/* Dean Section */}
                <div>
                  <div className="flex items-center gap-1.5 mb-2.5">
                    <div className="rounded-md bg-amber-500/10 p-1">
                      <GraduationCap className="h-3.5 w-3.5 text-amber-600" />
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Dean / Director
                    </span>
                  </div>
                  <div className="space-y-1.5 pl-1">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span className="font-medium truncate">
                        {college.dean.name || <span className="italic text-muted-foreground/60">Not set</span>}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Hash className="h-3 w-3 shrink-0" />
                      <span className="truncate">
                        {college.dean.idNumber || <span className="italic">—</span>}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Mail className="h-3 w-3 shrink-0" />
                      <a
                        href={`mailto:${college.dean.email}`}
                        className="truncate hover:text-primary hover:underline transition-colors"
                      >
                        {college.dean.email || <span className="italic">—</span>}
                      </a>
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t" />

                {/* Custodian Section */}
                <div>
                  <div className="flex items-center gap-1.5 mb-2.5">
                    <div className="rounded-md bg-blue-500/10 p-1">
                      <User className="h-3.5 w-3.5 text-blue-600" />
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Custodian
                    </span>
                  </div>
                  <div className="space-y-1.5 pl-1">
                    <div className="flex items-center gap-2 text-sm">
                      <BadgeCheck className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span className="font-medium truncate">
                        {college.custodian.name || <span className="italic text-muted-foreground/60">Not set</span>}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Hash className="h-3 w-3 shrink-0" />
                      <span className="truncate">
                        {college.custodian.idNumber || <span className="italic">—</span>}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Mail className="h-3 w-3 shrink-0" />
                      <a
                        href={`mailto:${college.custodian.email}`}
                        className="truncate hover:text-primary hover:underline transition-colors"
                      >
                        {college.custodian.email || <span className="italic">—</span>}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
