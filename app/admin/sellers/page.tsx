"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { DataTable } from "@/components/data-table"
import type { Seller } from "@/lib/types"
import { usersApi } from "@/lib/api"
import { useAuth } from "@/hooks/use-auth"
import { Plus, Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

export default function SellersPage() {
  const [sellers, setSellers] = useState<Seller[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingSeller, setEditingSeller] = useState<Seller | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<Partial<Seller> & { password?: string }>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    birthDate: "",
    phoneNumber: "",
  })
  
  const { user } = useAuth()
  const { toast } = useToast()

  const fetchSellers = async () => {
    if (!user?.id) return
    
    try {
      setIsLoading(true)
      const data = await usersApi.getAllSellers(user.id)
      setSellers(data.map(seller => ({
        ...seller,
        birthDate: seller.birthDate || null,
        phoneNumber: seller.phoneNumber || null,
      })))
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data || "Failed to fetch sellers",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchSellers()
  }, [user?.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.id) return

    setIsSubmitting(true)
    
    try {
      if (editingSeller) {
        // For now, backend doesn't support update sellers
        toast({
          title: "Info",
          description: "Update functionality not yet implemented in backend",
        })
      } else {
        // Add new seller
        await usersApi.createSeller({
          firstName: formData.firstName || "",
          lastName: formData.lastName || "",
          email: formData.email || "",
          password: formData.password || "",
          birthDate: formData.birthDate || undefined,
          phoneNumber: formData.phoneNumber || undefined,
        }, user.id)
        
        toast({
          title: "Success",
          description: "Seller created successfully",
        })
        
        await fetchSellers()
      }

      handleCloseDialog()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data || "Failed to create seller",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (seller: Seller) => {
    setEditingSeller(seller)
    setFormData({
      ...seller,
      birthDate: seller.birthDate || "",
      phoneNumber: seller.phoneNumber || "",
    })
    setIsDialogOpen(true)
  }

  const handleDelete = (seller: Seller) => {
    // Backend doesn't support delete sellers yet
    toast({
      title: "Info",
      description: "Delete functionality not yet implemented in backend",
    })
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingSeller(null)
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      birthDate: "",
      phoneNumber: "",
    })
  }

  const columns = [
    { header: "First Name", accessor: "firstName" as keyof Seller },
    { header: "Last Name", accessor: "lastName" as keyof Seller },
    { header: "Email", accessor: "email" as keyof Seller },
    { header: "Phone", accessor: "phoneNumber" as keyof Seller },
    {
      header: "Birth Date",
      accessor: ((seller: Seller) => seller.birthDate ? new Date(seller.birthDate).toLocaleDateString() : "N/A") as any,
    },
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="border-blue-100 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Sellers Management</CardTitle>
              <CardDescription>Manage seller accounts and information</CardDescription>
            </div>
            <Button onClick={() => setIsDialogOpen(true)} className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Add Seller
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            data={sellers}
            columns={columns}
            onEdit={handleEdit}
            onDelete={handleDelete}
            emptyMessage="No sellers found"
          />
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingSeller ? "Edit Seller" : "Add New Seller"}</DialogTitle>
            <DialogDescription>
              {editingSeller ? "Update seller information" : "Enter seller details to create a new account"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required={!editingSeller}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="birthDate">Birth Date</Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={formData.birthDate || ""}
                  onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  value={formData.phoneNumber || ""}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancel
              </Button>
              <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {editingSeller ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
