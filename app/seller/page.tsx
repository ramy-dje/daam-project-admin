"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function SellerPage() {
  const router = useRouter()
  
  useEffect(() => {
    // Redirect to products page by default
    router.push('/seller/products')
  }, [router])

  return null
}
