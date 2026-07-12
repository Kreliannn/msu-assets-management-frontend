"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
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
import { Loader2, Plus, Building2, User, GraduationCap, Mail, Hash } from "lucide-react"

interface AddCollegeModalProps {
  onSuccess: (colleges: collegeInterface[]) => void
}

export function AddCollegeModal({ onSuccess }: AddCollegeModalProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [department, setDepartment] = useState("")
  const [custodianName, setCustodianName] = useState("")
  const [custodianIdNumber, setCustodianIdNumber] = useState("")
  const [custodianEmail, setCustodianEmail] = useState("")
  const [deanName, setDeanName] = useState("")
  const [deanIdNumber, setDeanIdNumber] = useState("")
  const [deanEmail, setDeanEmail] = useState("")
  const [error, setError] = useState("")

  const resetForm = () => {
    setDepartment("")
    setCustodianName("")
    setCustodianIdNumber("")
    setCustodianEmail("")
    setDeanName("")
    setDeanIdNumber("")
    setDeanEmail("")
    setError("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!department.trim()) {
      setError("Department is required")
      return
    }

    setLoading(true)
    try {
      const response = await axiosInstance.post("/college", {
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
      const colleges = response.data as collegeInterface[]
      onSuccess(colleges)
      resetForm()
      setOpen(false)
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
        const axiosErr = err as { response?: { data?: { message?: string } } }
        setError(axiosErr.response?.data?.message || "Failed to create college")
      } else {
        setError("Failed to create college")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add College
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <Building2 className="h-5 w-5 text-primary" />
              Add New College
            </DialogTitle>
            <DialogDescription>
              Fill in the details below to register a new college department.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-5 py-4">
            {/* Department */}
            <div className="space-y-2">
              <Label htmlFor="department" className="flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                Department
              </Label>
              <Input
                id="department"
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
                <Label htmlFor="custodianName" className="flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-muted-foreground" />
                  Full Name
                </Label>
                <Input
                  id="custodianName"
                  placeholder="Juan Dela Cruz"
                  value={custodianName}
                  onChange={(e) => setCustodianName(e.target.value)}
                />
              </div>
              <div className="space-y-2 col-span-2 sm:col-span-1">
                <Label htmlFor="custodianId" className="flex items-center gap-1.5">
                  <Hash className="h-3.5 w-3.5 text-muted-foreground" />
                  ID Number
                </Label>
                <Input
                  id="custodianId"
                  placeholder="2020-00001"
                  value={custodianIdNumber}
                  onChange={(e) => setCustodianIdNumber(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="custodianEmail" className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                Email
              </Label>
              <Input
                id="custodianEmail"
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
                  <GraduationCap className="h-3 w-3" /> Dean Information
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2 sm:col-span-1">
                <Label htmlFor="deanName" className="flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-muted-foreground" />
                  Full Name
                </Label>
                <Input
                  id="deanName"
                  placeholder="Maria Santos"
                  value={deanName}
                  onChange={(e) => setDeanName(e.target.value)}
                />
              </div>
              <div className="space-y-2 col-span-2 sm:col-span-1">
                <Label htmlFor="deanId" className="flex items-center gap-1.5">
                  <Hash className="h-3.5 w-3.5 text-muted-foreground" />
                  ID Number
                </Label>
                <Input
                  id="deanId"
                  placeholder="2010-00001"
                  value={deanIdNumber}
                  onChange={(e) => setDeanIdNumber(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="deanEmail" className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                Email
              </Label>
              <Input
                id="deanEmail"
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
              onClick={() => {
                resetForm()
                setOpen(false)
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create College"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
