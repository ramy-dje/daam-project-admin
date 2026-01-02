"use client"

import { ProtectedRoute } from '@/components/protected-route'
import { DashboardLayout } from '@/components/dashboard-layout'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <DashboardLayout>{children}</DashboardLayout>
    </ProtectedRoute>
  )
}
