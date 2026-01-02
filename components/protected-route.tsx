"use client"

import type React from "react"

import { useEffect } from "react"
import { useAuth, type UserRole } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles: UserRole[]
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push("/")
      } else if (!allowedRoles.includes(user.role)) {
        // Redirect based on user role
        if (user.role === "admin") {
          router.push("/admin/sellers")
        } else {
          router.push("/seller/products")
        }
      }
    }
  }, [user, isLoading, allowedRoles, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return null
  }

  return <>{children}</>
}
