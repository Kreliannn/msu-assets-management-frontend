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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import axiosInstance from "@/app/utils/axios"
import { accountInterface } from "@/app/types/account.type"
import { Loader2, Plus, User, Key, UserCircle, Shield, Hash, Mail } from "lucide-react"

interface AddUserModalProps {
  onSuccess: (users: accountInterface[]) => void
}

export function AddUserModal({ onSuccess }: AddUserModalProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState("")
  const [idNumber, setIdNumber] = useState("")
  const [email, setEmail] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState("")

  const resetForm = () => {
    setName("")
    setIdNumber("")
    setEmail("")
    setUsername("")
    setPassword("")
    setRole("")
    setFile(null)
    setPreview(null)
    setError("")
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] || null
    setFile(selected)
    if (selected) {
      setPreview(URL.createObjectURL(selected))
    } else {
      setPreview(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!name.trim()) { setError("Name is required"); return }
    if (!idNumber.trim()) { setError("ID Number is required"); return }
    if (!email.trim()) { setError("Email is required"); return }
    if (!username.trim()) { setError("Username is required"); return }
    if (!password.trim()) { setError("Password is required"); return }
    if (!role) { setError("Role is required"); return }

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append("name", name)
      formData.append("idNumber", idNumber)
      formData.append("email", email)
      formData.append("username", username)
      formData.append("password", password)
      formData.append("role", role)
      formData.append("college", "")
      if (file) formData.append("profile", file)

      const response = await axiosInstance.post("/account", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      onSuccess(response.data as accountInterface[])
      resetForm()
      setOpen(false)
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
        const axiosErr = err as { response?: { data?: { message?: string } } }
        setError(axiosErr.response?.data?.message || "Failed to create user")
      } else {
        setError("Failed to create user")
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
          Add User
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <UserCircle className="h-5 w-5 text-primary" />
              Add New User
            </DialogTitle>
            <DialogDescription>
              Create a new user account with role-based access.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-5 py-4">
            {/* Profile Picture */}
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-muted-foreground" />
                Profile Picture
              </Label>
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-full border flex items-center justify-center overflow-hidden bg-muted shrink-0">
                  {preview ? (
                    <img src={preview} alt="Preview" className="h-full w-full object-cover" />
                  ) : (
                    <User className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>
                <Input type="file" accept="image/*" onChange={handleFileChange} className="flex-1" />
              </div>
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-muted-foreground" />
                Name
              </Label>
              <Input
                id="name"
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            {/* ID Number */}
            <div className="space-y-2">
              <Label htmlFor="idNumber" className="flex items-center gap-1.5">
                <Hash className="h-3.5 w-3.5 text-muted-foreground" />
                ID Number
              </Label>
              <Input
                id="idNumber"
                placeholder="e.g., 2020-00001"
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value)}
                required
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username" className="flex items-center gap-1.5">
                <Key className="h-3.5 w-3.5 text-muted-foreground" />
                Username
              </Label>
              <Input
                id="username"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-1.5">
                <Key className="h-3.5 w-3.5 text-muted-foreground" />
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {/* Role */}
            <div className="space-y-2">
              <Label htmlFor="role" className="flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5 text-muted-foreground" />
                Role
              </Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="custodian">Custodian</SelectItem>
                  <SelectItem value="dean">Dean</SelectItem>
                  <SelectItem value="director">Director</SelectItem>
                </SelectContent>
              </Select>
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
                "Create User"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
