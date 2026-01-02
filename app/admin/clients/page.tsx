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
import type { Client } from "@/lib/types"
import { usersApi, authApi, SignupRequest } from "@/lib/api"
import { useAuth } from "@/hooks/use-auth"
import { Loader2, Plus } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [viewingClient, setViewingClient] = useState<Client | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<SignupRequest>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    birthDate: "",
    phoneNumber: "",
  })
  
  const { user } = useAuth()
  const { toast } = useToast()

  const fetchClients = async () => {
    if (!user?.id) return
    
    try {
      setIsLoading(true)
      const data = await usersApi.getAllClients(user.id)
      setClients(data.map(client => ({
        ...client,
        phoneNumber: client.phoneNumber || null,
      })))
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data || "Failed to fetch clients",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchClients()
  }, [user?.id])

  const handleView = (client: Client) => {
    setViewingClient(client)
    setIsDialogOpen(true)
  }

  const handleDelete = (client: Client) => {
    if (!user?.id) return
    
    if (!window.confirm(`Are you sure you want to delete ${client.firstName} ${client.lastName}?`)) {
      return
    }
    
    usersApi.deleteClient(client.id, user.id)
      .then(() => {
        toast({
          title: "Success",
          description: "Client deleted successfully",
        })
        fetchClients()
      })
      .catch((error: any) => {
        const errorMessage = error.response?.data?.message || error.response?.data || error.message || "Failed to delete client"
        toast({
          title: "Error",
          description: typeof errorMessage === 'string' ? errorMessage : "Failed to delete client",
          variant: "destructive",
        })
      })
  }

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await authApi.clientSignup(formData)
      toast({
        title: "Success",
        description: "Client created successfully",
      })
      await fetchClients()
      handleCloseCreateDialog()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data || "Failed to create client",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setViewingClient(null)
  }

  const handleCloseCreateDialog = () => {
    setIsCreateDialogOpen(false)
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
    { header: "First Name", accessor: "firstName" as keyof Client },
    { header: "Last Name", accessor: "lastName" as keyof Client },
    { header: "Email", accessor: "email" as keyof Client },
    { header: "Phone", accessor: "phoneNumber" as keyof Client },
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
              <CardTitle className="text-2xl">Clients Management</CardTitle>
              <CardDescription>View client accounts and information</CardDescription>
            </div>
            <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Create Client
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            data={clients}
            columns={columns}
            onEdit={handleView}
            onDelete={handleDelete}
            emptyMessage="No clients found"
          />
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Client Details</DialogTitle>
            <DialogDescription>View client information</DialogDescription>
          </DialogHeader>
          {viewingClient && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>First Name</Label>
                  <p className="text-sm text-muted-foreground">{viewingClient.firstName}</p>
                </div>
                <div className="space-y-2">
                  <Label>Last Name</Label>
                  <p className="text-sm text-muted-foreground">{viewingClient.lastName}</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <p className="text-sm text-muted-foreground">{viewingClient.email}</p>
              </div>
              <div className="space-y-2">
                <Label>Phone Number</Label>
                <p className="text-sm text-muted-foreground">{viewingClient.phoneNumber || "N/A"}</p>
              </div>
              <div className="space-y-2">
                <Label>Birth Date</Label>
                <p className="text-sm text-muted-foreground">
                  {viewingClient.birthDate ? new Date(viewingClient.birthDate).toLocaleDateString() : "N/A"}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={handleCloseDialog}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Client Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Client</DialogTitle>
            <DialogDescription>Add a new client account</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateClient}>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="birthDate">Birth Date</Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseCreateDialog}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Client"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
