"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import { authApi } from "@/lib/api"

export type UserRole = "admin" | "seller" | "client"

interface User {
  id: number
  firstName: string
  lastName: string
  name: string
  email: string
  role: UserRole
  phoneNumber?: string | null
  birthDate?: string | null
}

interface AuthState {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: false,
      login: async (email, password) => {
        set({ isLoading: true })
        
        try {
          const response = await authApi.login({ email, password })
          console.log(response)
          
          // Determine role from backend response
          let role: UserRole = "client"
          if (response.role === "ADMIN") {
            role = "admin"
          } else if (response.role === "SELLER") {
            role = "seller"
          } else if (response.role === "CLIENT") {
            role = "client"
          }
          
          set({
            user: {
              id: response.id,
              firstName: response.firstName,
              lastName: response.lastName,
              name: `${response.firstName} ${response.lastName}`,
              email: response.email,
              role,
              phoneNumber: response.phoneNumber,
              birthDate: response.birthDate,
            },
            isLoading: false,
          })
          return true
        } catch (error) {
          console.error("Login failed:", error)
          set({ isLoading: false })
          return false
        }
      },
      logout: () => {
        set({ user: null })
      },
    }),
    { name: "auth-storage" },
  ),
)
