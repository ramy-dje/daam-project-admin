"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"

export function AuthRedirect() {
  const router = useRouter()
  const pathname = usePathname()
  const { user } = useAuth()

  useEffect(() => {
    // Skip redirect if user is not logged in
    if (!user) return

    // Skip redirect if user is already on their designated page
    if (user.role === "admin" && pathname.startsWith("/admin")) return
    if (user.role === "seller" && pathname.startsWith("/seller")) return

    // Redirect to appropriate page based on role
    if (pathname === "/" || pathname === "/login") {
      if (user.role === "admin") {
        router.push("/admin")
      } else if (user.role === "seller") {
        router.push("/seller")
      }
    }
  }, [user, pathname, router])

  return null
}
