"use client"

import type React from "react"

import { useAuth, type UserRole } from "@/hooks/use-auth"
import { useRouter, usePathname } from "next/navigation"
import { useEffect } from "react"

export function AuthGuard({
  children,
  allowedRoles,
}: {
  children: React.ReactNode
  allowedRoles?: UserRole[]
}) {
  const { user } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!user && pathname !== "/login") {
      router.push("/login")
    } else if (user && allowedRoles && !allowedRoles.includes(user.role)) {
      router.push("/")
    }
  }, [user, allowedRoles, router, pathname])

  if (!user && pathname !== "/login") return null
  if (user && allowedRoles && !allowedRoles.includes(user.role)) return null

  return <>{children}</>
}
