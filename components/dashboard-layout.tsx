"use client"

import { type ReactNode, useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Users, Package, ShoppingBag, CheckCircle, LogOut, Menu, X } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

interface NavItem {
  title: string
  href: string
  icon: ReactNode
  adminOnly?: boolean
}

const navItems: NavItem[] = [
  {
    title: "Sellers",
    href: "/admin/sellers",
    icon: <Users className="w-5 h-5" />,
    adminOnly: true,
  },
  {
    title: "Clients",
    href: "/admin/clients",
    icon: <Users className="w-5 h-5" />,
    adminOnly: true,
  },
  {
    title: "Products",
    href: "/admin/products",
    icon: <Package className="w-5 h-5" />,
    adminOnly: true,
  },
  {
    title: "Accept Products",
    href: "/admin/accept-products",
    icon: <CheckCircle className="w-5 h-5" />,
    adminOnly: true,
  },
  {
    title: "My Products",
    href: "/seller/products",
    icon: <ShoppingBag className="w-5 h-5" />,
  },
]

export function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth()
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const filteredNavItems = navItems.filter((item) => {
    if (item.adminOnly && user?.role !== "admin") return false
    if (!item.adminOnly && item.href.includes("seller") && user?.role !== "seller") return false
    return true
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-white to-blue-50/50">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex fixed left-0 top-0 h-full w-64 bg-white border-r border-blue-100 flex-col shadow-sm">
        <div className="p-6 border-b border-blue-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <LayoutDashboard className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h2 className="font-bold text-lg">Dashboard</h2>
              <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {filteredNavItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-accent hover:text-accent-foreground",
                )}
              >
                {item.icon}
                <span className="font-medium">{item.title}</span>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-blue-100">
          <div className="px-4 py-2 mb-2">
            <p className="text-sm font-medium">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>
          <Button
            variant="outline"
            className="w-full justify-start gap-2 border-blue-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 bg-transparent"
            onClick={logout}
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-blue-100 flex items-center justify-between px-4 z-50 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <LayoutDashboard className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-bold">Dashboard</span>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </header>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-16 bg-white z-40 p-4">
          <nav className="space-y-1 mb-4">
            {filteredNavItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                    isActive ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-accent",
                  )}
                >
                  {item.icon}
                  <span className="font-medium">{item.title}</span>
                </Link>
              )
            })}
          </nav>
          <div className="border-t border-blue-100 pt-4">
            <div className="px-4 py-2 mb-2">
              <p className="text-sm font-medium">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
            <Button
              variant="outline"
              className="w-full justify-start gap-2 border-blue-200 bg-transparent"
              onClick={() => {
                setIsMobileMenuOpen(false)
                logout()
              }}
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="md:ml-64 pt-16 md:pt-0 min-h-screen">
        <div className="p-4 md:p-8">{children}</div>
      </main>
    </div>
  )
}
