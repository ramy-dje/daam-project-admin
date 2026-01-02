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
import { usersApi } from "@/lib/api"
import { useAuth } from "@/hooks/use-auth"
import { Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [viewingClient, setViewingClient] = useState<Client | null>(null)
  
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
    // Backend doesn't support delete clients yet
    toast({
      title: "Info",
      description: "Delete functionality not yet implemented in backend",
    })
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setViewingClient(null)
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
    </div>
  )
}
