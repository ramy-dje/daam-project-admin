"use client"

import { ProtectedRoute } from '@/components/protected-route'
import { DashboardLayout } from '@/components/dashboard-layout'

export default function SellerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute allowedRoles={['seller']}>
      <DashboardLayout>{children}</DashboardLayout>
    </ProtectedRoute>
  )
}
