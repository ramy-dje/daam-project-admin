"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
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
import type { Product } from "@/lib/types"
import { productsApi, fileApi } from "@/lib/api"
import { useAuth } from "@/hooks/use-auth"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null)
  
  const { user } = useAuth()
  const { toast } = useToast()

  const fetchProducts = async () => {
    try {
      setIsLoading(true)
      const data = await productsApi.getAllProducts()
      setProducts(data)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data || "Failed to fetch products",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const handleView = (product: Product) => {
    setViewingProduct(product)
    setIsDialogOpen(true)
  }

  const handleDelete = async (product: Product) => {
    if (!user?.id) return
    
    if (confirm(`Are you sure you want to delete ${product.name}?`)) {
      try {
        await productsApi.deleteProduct(product.id, user.id)
        toast({
          title: "Success",
          description: "Product deleted successfully",
        })
        await fetchProducts()
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.response?.data || "Failed to delete product",
          variant: "destructive",
        })
      }
    }
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setViewingProduct(null)
  }

  const getStatusBadge = (isValid: boolean) => {
    return (
      <Badge variant={isValid ? "default" : "destructive"} className="capitalize">
        {isValid ? "Valid" : "Invalid"}
      </Badge>
    )
  }

  const columns = [
    { header: "Name", accessor: "name" as keyof Product },
    { header: "Serial Number", accessor: "serialNumber" as keyof Product },
    {
      header: "Seller",
      accessor: ((product: Product) => `${product.seller.firstName} ${product.seller.lastName}`) as any,
    },
    { header: "Location", accessor: "locationName" as keyof Product },
    {
      header: "Status",
      accessor: ((product: Product) => getStatusBadge(product.isValid)) as any,
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
          <div>
            <CardTitle className="text-2xl">All Products</CardTitle>
            <CardDescription>View and manage all products in the system</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            data={products}
            columns={columns}
            onEdit={handleView}
            onDelete={handleDelete}
            emptyMessage="No products found"
          />
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Product Details</DialogTitle>
            <DialogDescription>View product information</DialogDescription>
          </DialogHeader>
          {viewingProduct && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Product Name</Label>
                <p className="text-sm text-muted-foreground">{viewingProduct.name}</p>
              </div>
              <div className="space-y-2">
                <Label>Serial Number</Label>
                <p className="text-sm text-muted-foreground">{viewingProduct.serialNumber}</p>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <p className="text-sm text-muted-foreground">{viewingProduct.description || "N/A"}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <div>{getStatusBadge(viewingProduct.isValid)}</div>
                </div>
                <div className="space-y-2">
                  <Label>Can Review</Label>
                  <Badge variant={viewingProduct.canReview ? "default" : "secondary"}>
                    {viewingProduct.canReview ? "Yes" : "No"}
                  </Badge>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Seller</Label>
                <p className="text-sm text-muted-foreground">
                  {viewingProduct.seller.firstName} {viewingProduct.seller.lastName}
                </p>
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <p className="text-sm text-muted-foreground">{viewingProduct.locationName || "N/A"}</p>
              </div>
              {viewingProduct.latitude && viewingProduct.longitude && (
                <div className="space-y-2">
                  <Label>Coordinates</Label>
                  <p className="text-sm text-muted-foreground">
                    {viewingProduct.latitude}, {viewingProduct.longitude}
                  </p>
                </div>
              )}
              {viewingProduct.image && (
                <div className="space-y-2">
                  <Label>Image</Label>
                  <img 
                    src={fileApi.getFileUrl(viewingProduct.image)} 
                    alt={viewingProduct.name}
                    className="rounded-md max-h-48 object-cover w-full"
                  />
                </div>
              )}
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
