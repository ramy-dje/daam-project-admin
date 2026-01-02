"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { DataTable } from "@/components/data-table"
import type { Product } from "@/lib/types"
import { productsApi, fileApi } from "@/lib/api"
import { useAuth } from "@/hooks/use-auth"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

export default function AcceptProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const { user } = useAuth()
  const { toast } = useToast()

  const fetchProducts = async () => {
    try {
      setIsLoading(true)
      const data = await productsApi.getAllProducts()
      // Filter products that are not valid (pending approval)
      setProducts(data.filter(p => !p.isValid))
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

  const handleReview = (product: Product) => {
    setSelectedProduct(product)
    setIsDialogOpen(true)
  }

  const handleApprove = async () => {
    if (!selectedProduct || !user?.id) return
    
    setIsSubmitting(true)
    try {
      await productsApi.updateProduct(selectedProduct.id, { isValid: true }, user.id)
      toast({
        title: "Success",
        description: "Product approved successfully",
      })
      await fetchProducts()
      handleCloseDialog()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data || "Failed to approve product",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReject = async () => {
    if (!selectedProduct || !user?.id) return
    
    setIsSubmitting(true)
    try {
      await productsApi.deleteProduct(selectedProduct.id, user.id)
      toast({
        title: "Success",
        description: "Product rejected and deleted successfully",
      })
      await fetchProducts()
      handleCloseDialog()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data || "Failed to reject product",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setSelectedProduct(null)
  }

  const columns = [
    { header: "Product Name", accessor: "name" as keyof Product },
    { header: "Serial Number", accessor: "serialNumber" as keyof Product },
    {
      header: "Seller",
      accessor: ((product: Product) => `${product.seller.firstName} ${product.seller.lastName}`) as any,
    },
    {
      header: "Status",
      accessor: (() => <Badge variant="secondary">Pending</Badge>) as any,
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
            <CardTitle className="text-2xl">Accept Products</CardTitle>
            <CardDescription>Review and approve or reject pending products</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {products.length > 0 ? (
            <DataTable
              data={products}
              columns={columns}
              onEdit={handleReview}
              emptyMessage="No pending products"
            />
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
              <p className="text-lg font-medium">All caught up!</p>
              <p className="text-sm">No pending products to review</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Review Product</DialogTitle>
            <DialogDescription>Approve or reject this product submission</DialogDescription>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Product Name</Label>
                <p className="text-sm font-medium">{selectedProduct.name}</p>
              </div>
              <div className="space-y-2">
                <Label>Serial Number</Label>
                <p className="text-sm text-muted-foreground">{selectedProduct.serialNumber}</p>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <p className="text-sm text-muted-foreground">{selectedProduct.description || "N/A"}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Location</Label>
                  <p className="text-sm text-muted-foreground">{selectedProduct.locationName || "N/A"}</p>
                </div>
                <div className="space-y-2">
                  <Label>Seller</Label>
                  <p className="text-sm font-medium">
                    {selectedProduct.seller.firstName} {selectedProduct.seller.lastName}
                  </p>
                </div>
              </div>
              {selectedProduct.image && (
                <div className="space-y-2">
                  <Label>Image</Label>
                  <img 
                    src={fileApi.getFileUrl(selectedProduct.image)} 
                    alt={selectedProduct.name}
                    className="rounded-md max-h-48 object-cover w-full"
                  />
                </div>
              )}
            </div>
          )}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={handleCloseDialog} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="outline"
              className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 bg-transparent"
              onClick={handleReject}
              disabled={isSubmitting}
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <XCircle className="w-4 h-4 mr-2" />}
              Reject
            </Button>
            <Button 
              type="button" 
              className="bg-green-600 hover:bg-green-700 text-white" 
              onClick={handleApprove}
              disabled={isSubmitting}
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
