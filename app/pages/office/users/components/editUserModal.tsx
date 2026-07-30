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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import axiosInstance from "@/app/utils/axios"
import { accountInterface } from "@/app/types/account.type"
import { Loader2, User, Key, UserCircle, Shield, Pencil, Hash, Mail } from "lucide-react"

interface EditUserModalProps {
  user: accountInterface
  onSuccess: (users: accountInterface[]) => void
}

export function EditUserModal({ user, onSuccess }: EditUserModalProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState(user.name)
  const [idNumber, setIdNumber] = useState(user.idNumber)
  const [email, setEmail] = useState(user.email)
  const [username, setUsername] = useState(user.username)
  const [password, setPassword] = useState("")
  const [role, setRole] = useState(user.role)
  const [status, setStatus] = useState(user.status)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    setName(user.name)
    setIdNumber(user.idNumber)
    setEmail(user.email)
    setUsername(user.username)
    setPassword("")
    setRole(user.role)
    setStatus(user.status)
    setFile(null)
    setPreview(null)
    setError("")
  }, [user])

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
    if (!username.trim()) { setError("Username is required"); return }
    if (!role) { setError("Role is required"); return }

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append("name", name)
      formData.append("idNumber", idNumber)
      formData.append("email", email)
      formData.append("username", username)
      formData.append("role", role)
      formData.append("status", status)
      if (password.trim()) formData.append("password", password)
      if (file) formData.append("profile", file)

      const response = await axiosInstance.put(`/account/${user._id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      onSuccess([response.data as accountInterface])
      setOpen(false)
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
        const axiosErr = err as { response?: { data?: { message?: string } } }
        setError(axiosErr.response?.data?.message || "Failed to update user")
      } else {
        setError("Failed to update user")
      }
    } finally {
      setLoading(false)
    }
  }

  const profileUrl = preview || (user.profile ? `${process.env.NEXT_PUBLIC_BACKEND_URL_LIVE}${user.profile}` : null)

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
      <DialogContent className="sm:max-w-[480px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <UserCircle className="h-5 w-5 text-primary" />
              Edit User
            </DialogTitle>
            <DialogDescription>
              Update details for <span className="font-medium text-foreground">{user.name}</span>.
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
                  {profileUrl ? (
                    <img src={profileUrl} alt="Preview" className="h-full w-full object-cover" />
                  ) : (
                    <User className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>
                <Input type="file" accept="image/*" onChange={handleFileChange} className="flex-1" />
              </div>
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="edit-name" className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-muted-foreground" />
                Name
              </Label>
              <Input
                id="edit-name"
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            {/* ID Number */}
            <div className="space-y-2">
              <Label htmlFor="edit-idNumber" className="flex items-center gap-1.5">
                <Hash className="h-3.5 w-3.5 text-muted-foreground" />
                ID Number
              </Label>
              <Input
                id="edit-idNumber"
                placeholder="e.g., 2020-00001"
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value)}
                required
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="edit-email" className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                Email
              </Label>
              <Input
                id="edit-email"
                type="email"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="edit-username" className="flex items-center gap-1.5">
                <Key className="h-3.5 w-3.5 text-muted-foreground" />
                Username
              </Label>
              <Input
                id="edit-username"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            {/* Password (optional) */}
            <div className="space-y-2">
              <Label htmlFor="edit-password" className="flex items-center gap-1.5">
                <Key className="h-3.5 w-3.5 text-muted-foreground" />
                Password
              </Label>
              <Input
                id="edit-password"
                type="password"
                placeholder="Leave blank to keep current"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {/* Role */}
            <div className="space-y-2">
              <Label htmlFor="edit-role" className="flex items-center gap-1.5">
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

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="edit-status" className="flex items-center gap-1.5">
                <UserCircle className="h-3.5 w-3.5 text-muted-foreground" />
                Status
              </Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
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
