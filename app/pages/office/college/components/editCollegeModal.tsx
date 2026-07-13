"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import axiosInstance from "@/app/utils/axios"
import { collegeInterface, collegeInterfaceInput } from "@/app/types/college.type"
import { Loader2, Building2, User, GraduationCap, Mail, Hash, Pencil } from "lucide-react"

interface EditCollegeModalProps {
  college: collegeInterface
  onSuccess: (colleges: collegeInterface[]) => void
}

export function EditCollegeModal({ college, onSuccess }: EditCollegeModalProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [department, setDepartment] = useState(college.department)
  const [custodianName, setCustodianName] = useState(college.custodian.name)
  const [custodianIdNumber, setCustodianIdNumber] = useState(college.custodian.idNumber)
  const [custodianEmail, setCustodianEmail] = useState(college.custodian.email)
  const [deanName, setDeanName] = useState(college.dean.name)
  const [deanIdNumber, setDeanIdNumber] = useState(college.dean.idNumber)
  const [deanEmail, setDeanEmail] = useState(college.dean.email)
  const [error, setError] = useState("")

  // Sync form fields when the college prop changes (e.g., after update)
  useEffect(() => {
    setDepartment(college.department)
    setCustodianName(college.custodian.name)
    setCustodianIdNumber(college.custodian.idNumber)
    setCustodianEmail(college.custodian.email)
    setDeanName(college.dean.name)
    setDeanIdNumber(college.dean.idNumber)
    setDeanEmail(college.dean.email)
  }, [college])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!department.trim()) {
      setError("Department is required")
      return
    }

    setLoading(true)
    try {
      const response = await axiosInstance.put(`/college/${college._id}`, {
        department,
        custodian: {
          name: custodianName,
          idNumber: custodianIdNumber,
          email: custodianEmail,
        },
        dean: {
          name: deanName,
          idNumber: deanIdNumber,
          email: deanEmail,
        },
      } as collegeInterfaceInput)
      const updatedCollege = response.data as collegeInterface
      // Update the college in the existing list
      onSuccess([updatedCollege])
      setOpen(false)
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
        const axiosErr = err as { response?: { data?: { message?: string } } }
        setError(axiosErr.response?.data?.message || "Failed to update college")
      } else {
        setError("Failed to update college")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-primary"
        >
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <Building2 className="h-5 w-5 text-primary" />
              Edit College
            </DialogTitle>
            <DialogDescription>
              Update the details for <span className="font-medium text-foreground">{college.department}</span>.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-5 py-4">
            {/* Department */}
            <div className="space-y-2">
              <Label htmlFor="edit-department" className="flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                Department
              </Label>
              <Input
                id="edit-department"
                placeholder="e.g., College of Computer Studies"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                required
              />
            </div>

            {/* Separator */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-popover px-2 text-muted-foreground font-medium flex items-center gap-1">
                  <User className="h-3 w-3" /> Custodian Information
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2 sm:col-span-1">
                <Label htmlFor="edit-custodianName" className="flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-muted-foreground" />
                  Full Name
                </Label>
                <Input
                  id="edit-custodianName"
                  placeholder="Juan Dela Cruz"
                  value={custodianName}
                  onChange={(e) => setCustodianName(e.target.value)}
                />
              </div>
              <div className="space-y-2 col-span-2 sm:col-span-1">
                <Label htmlFor="edit-custodianId" className="flex items-center gap-1.5">
                  <Hash className="h-3.5 w-3.5 text-muted-foreground" />
                  ID Number
                </Label>
                <Input
                  id="edit-custodianId"
                  placeholder="2020-00001"
                  value={custodianIdNumber}
                  onChange={(e) => setCustodianIdNumber(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-custodianEmail" className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                Email
              </Label>
              <Input
                id="edit-custodianEmail"
                type="email"
                placeholder="custodian@example.com"
                value={custodianEmail}
                onChange={(e) => setCustodianEmail(e.target.value)}
              />
            </div>

            {/* Separator */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-popover px-2 text-muted-foreground font-medium flex items-center gap-1">
                  <GraduationCap className="h-3 w-3" />  Dean/Director Information
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2 sm:col-span-1">
                <Label htmlFor="edit-deanName" className="flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-muted-foreground" />
                  Full Name
                </Label>
                <Input
                  id="edit-deanName"
                  placeholder="Maria Santos"
                  value={deanName}
                  onChange={(e) => setDeanName(e.target.value)}
                />
              </div>
              <div className="space-y-2 col-span-2 sm:col-span-1">
                <Label htmlFor="edit-deanId" className="flex items-center gap-1.5">
                  <Hash className="h-3.5 w-3.5 text-muted-foreground" />
                  ID Number
                </Label>
                <Input
                  id="edit-deanId"
                  placeholder="2010-00001"
                  value={deanIdNumber}
                  onChange={(e) => setDeanIdNumber(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-deanEmail" className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                Email
              </Label>
              <Input
                id="edit-deanEmail"
                type="email"
                placeholder="dean@example.com"
                value={deanEmail}
                onChange={(e) => setDeanEmail(e.target.value)}
              />
            </div>

            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
