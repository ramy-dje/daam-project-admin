"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
import { productsApi, ProductRequest, fileApi } from "@/lib/api"
import { Badge } from "@/components/ui/badge"
import { Plus, Loader2, Upload, X } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"

interface ProductFormData {
  serialNumber: string
  name: string
  description: string
  image: string
  imageFile: File | null
  locationName: string
  latitude: string
  longitude: string
  canReview: boolean
}

export default function SellerProductsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [formData, setFormData] = useState<ProductFormData>({
    serialNumber: "",
    name: "",
    description: "",
    image: "",
    imageFile: null,
    locationName: "",
    latitude: "",
    longitude: "",
    canReview: true,
  })

  const fetchProducts = async () => {
    try {
      setIsLoading(true)
      const data = await productsApi.getAllProducts()
      // Filter products by seller ID
      const myProducts = data.filter(p => p.seller.id === user?.id)
      setProducts(myProducts)
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
    if (user?.id) {
      fetchProducts()
    }
  }, [user?.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.id) return

    setIsSubmitting(true)

    try {
      let imagePath = formData.image

      // Upload image file if a new one is selected
      if (formData.imageFile) {
        try {
          const uploadResult = await fileApi.uploadFile(formData.imageFile)
          imagePath = uploadResult.filename
        } catch (uploadError: any) {
          toast({
            title: "Upload Error",
            description: uploadError.response?.data || "Failed to upload image",
            variant: "destructive",
          })
          setIsSubmitting(false)
          return
        }
      }

      const productRequest: ProductRequest = {
        serialNumber: formData.serialNumber,
        name: formData.name,
        description: formData.description || undefined,
        image: imagePath || undefined,
        locationName: formData.locationName || undefined,
        latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
        longitude: formData.longitude ? parseFloat(formData.longitude) : undefined,
        canReview: formData.canReview,
        isValid: false, // New products start as pending (not valid)
      }

      if (editingProduct) {
        await productsApi.updateProduct(editingProduct.id, productRequest, user.id)
        toast({
          title: "Success",
          description: "Product updated successfully",
        })
      } else {
        await productsApi.createProduct(productRequest, user.id)
        toast({
          title: "Success",
          description: "Product created successfully. It will be visible after admin approval.",
        })
      }

      await fetchProducts()
      handleCloseDialog()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data || "Failed to save product",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    const imageUrl = product.image ? fileApi.getFileUrl(product.image) : null
    setImagePreview(imageUrl)
    setFormData({
      serialNumber: product.serialNumber,
      name: product.name,
      description: product.description || "",
      image: product.image || "",
      imageFile: null,
      locationName: product.locationName || "",
      latitude: product.latitude?.toString() || "",
      longitude: product.longitude?.toString() || "",
      canReview: product.canReview,
    })
    setIsDialogOpen(true)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid File",
          description: "Please select an image file",
          variant: "destructive",
        })
        return
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Image must be less than 10MB",
          variant: "destructive",
        })
        return
      }

      setFormData({ ...formData, imageFile: file, image: "" })
      
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setFormData({ ...formData, imageFile: null, image: "" })
    setImagePreview(null)
  }

  const handleDelete = async (product: Product) => {
    if (!user?.id) return

    if (!window.confirm(`Are you sure you want to delete "${product.name}"?`)) {
      return
    }

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

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingProduct(null)
    setImagePreview(null)
    setFormData({
      serialNumber: "",
      name: "",
      description: "",
      image: "",
      imageFile: null,
      locationName: "",
      latitude: "",
      longitude: "",
      canReview: true,
    })
  }

  const getStatusBadge = (isValid: boolean) => {
    return (
      <Badge 
        variant={isValid ? "default" : "secondary"} 
        className={isValid ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}
      >
        {isValid ? "Approved" : "Pending"}
      </Badge>
    )
  }

  const columns = [
    { header: "Product Name", accessor: "name" as keyof Product },
    { header: "Serial Number", accessor: "serialNumber" as keyof Product },
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
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">My Products</CardTitle>
              <CardDescription>Manage your product listings</CardDescription>
            </div>
            <Button onClick={() => setIsDialogOpen(true)} className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            data={products}
            columns={columns}
            onEdit={handleEdit}
            onDelete={handleDelete}
            emptyMessage="No products found. Add your first product to get started!"
          />
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
            <DialogDescription>
              {editingProduct
                ? "Update your product information"
                : "Products will be pending until approved by an admin"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="serialNumber">Serial Number *</Label>
                <Input
                  id="serialNumber"
                  value={formData.serialNumber}
                  onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                  placeholder="Enter unique serial number"
                  required
                  disabled={!!editingProduct}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter product name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your product"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="image">Product Image</Label>
                <div className="space-y-2">
                  {imagePreview ? (
                    <div className="relative">
                      <img 
                        src={imagePreview} 
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-md border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={handleRemoveImage}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center hover:border-primary transition-colors">
                      <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <Label htmlFor="imageFile" className="cursor-pointer text-sm text-muted-foreground">
                        Click to upload or drag and drop
                      </Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        PNG, JPG, GIF up to 10MB
                      </p>
                    </div>
                  )}
                  <Input
                    id="imageFile"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  {!imagePreview && (
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => document.getElementById('imageFile')?.click()}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Select Image
                    </Button>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="locationName">Location Name</Label>
                <Input
                  id="locationName"
                  value={formData.locationName}
                  onChange={(e) => setFormData({ ...formData, locationName: e.target.value })}
                  placeholder="Enter location name"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="latitude">Latitude</Label>
                  <Input
                    id="latitude"
                    type="number"
                    step="any"
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                    placeholder="0.0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="longitude">Longitude</Label>
                  <Input
                    id="longitude"
                    type="number"
                    step="any"
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                    placeholder="0.0"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="canReview"
                  checked={formData.canReview}
                  onChange={(e) => setFormData({ ...formData, canReview: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="canReview">Allow reviews for this product</Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {editingProduct ? "Update Product" : "Add Product"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
