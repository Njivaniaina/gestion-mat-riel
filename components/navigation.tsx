"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Home, Package, Plus, History, Settings, Bell, Menu, LogOut, Crown, ChevronDown, User, Search, Zap } from 'lucide-react'
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { useNotifications } from "@/hooks/use-notifications"

export function Navigation() {
  const { user, logout } = useAuth()
  const { notifications, unreadCount } = useNotifications()
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  // Ne pas afficher la navigation sur les pages publiques
  const publicPages = ["/", "/login", "/register"]
  if (!user || publicPages.includes(pathname)) {
    return null
  }

  const navigationItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: Home,
      description: "Vue d'ensemble",
    },
    {
      name: "Nouvelle demande",
      href: "/demande",
      icon: Plus,
      description: "Emprunter du matériel",
    },
    {
      name: "Catalogue",
      href: "/materiel",
      icon: Package,
      description: "Voir tous les matériels",
    },
    {
      name: "Historique",
      href: "/historique",
      icon: History,
      description: "Mes emprunts passés",
    },
  ]

  const adminItems = [
    {
      name: "Administration",
      href: "/admin",
      icon: Crown,
      description: "Gestion complète",
    },
  ]

  const isActive = (href: string) => pathname === href

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "responsable":
        return Crown
      case "professeur":
        return Settings
      case "etudiant":
        return User
      default:
        return User
    }
  }

  const RoleIcon = getRoleIcon(user.role)

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden lg:block fixed top-0 left-0 right-0 z-50 glass border-b border-white/10">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/dashboard" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Zap className="w-6 h-6 text-black" />
                </div>
                <div className="absolute inset-0 bg-white rounded-xl opacity-20 group-hover:animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-xl font-black gradient-text">MIT/MISA</h1>
                <p className="text-xs text-gray-400">Gestion Matériel</p>
              </div>
            </Link>

            {/* Navigation Items */}
            <div className="flex items-center gap-1">
              {navigationItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant="ghost"
                      className={`relative px-4 py-2 rounded-xl transition-all duration-300 ${
                        isActive(item.href)
                          ? "bg-white/10 text-white border border-white/20"
                          : "text-gray-400 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {item.name}
                      {isActive(item.href) && (
                        <div className="absolute inset-0 rounded-xl bg-white/5 animate-pulse" />
                      )}
                    </Button>
                  </Link>
                )
              })}

              {/* Admin Section */}
              {user.role === "responsable" &&
                adminItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link key={item.href} href={item.href}>
                      <Button
                        variant="ghost"
                        className={`relative px-4 py-2 rounded-xl transition-all duration-300 ${
                          isActive(item.href)
                            ? "bg-white/10 text-white border border-white/20"
                            : "text-gray-400 hover:text-white hover:bg-white/5"
                        }`}
                      >
                        <Icon className="w-4 h-4 mr-2" />
                        {item.name}
                        {isActive(item.href) && (
                          <div className="absolute inset-0 rounded-xl bg-white/5 animate-pulse" />
                        )}
                      </Button>
                    </Link>
                  )
                })}
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-4">
              {/* Search */}
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white hover:bg-white/5 rounded-xl"
              >
                <Search className="w-5 h-5" />
              </Button>

              {/* Notifications */}
              <Button
                variant="ghost"
                size="sm"
                className="relative text-gray-400 hover:text-white hover:bg-white/5 rounded-xl"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 bg-white text-black text-xs flex items-center justify-center">
                    {unreadCount}
                  </Badge>
                )}
              </Button>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-3 px-3 py-2 rounded-xl text-white hover:bg-white/5 transition-all duration-300"
                  >
                    <div className="w-8 h-8 bg-white/10 rounded-xl flex items-center justify-center border border-white/20">
                      <RoleIcon className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-gray-400 capitalize">{user.role}</p>
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 glass border-white/20 text-white" align="end">
                  <DropdownMenuLabel className="text-gray-300">Mon Compte</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-white/20" />
                  <DropdownMenuItem className="text-white hover:bg-white/10 cursor-pointer">
                    <User className="w-4 h-4 mr-2" />
                    Profil
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-white hover:bg-white/10 cursor-pointer">
                    <Settings className="w-4 h-4 mr-2" />
                    Paramètres
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-white/20" />
                  <DropdownMenuItem onClick={logout} className="text-red-400 hover:bg-red-500/20 cursor-pointer">
                    <LogOut className="w-4 h-4 mr-2" />
                    Déconnexion
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="lg:hidden fixed top-0 left-0 right-0 z-50 glass border-b border-white/10">
        <div className="flex items-center justify-between h-16 px-4">
          {/* Mobile Logo */}
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-black" />
            </div>
            <span className="text-lg font-black gradient-text">MIT/MISA</span>
          </Link>

          <div className="flex items-center gap-2">
            {/* Mobile Notifications */}
            <Button
              variant="ghost"
              size="sm"
              className="relative text-gray-400 hover:text-white hover:bg-white/5 rounded-xl"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <Badge className="absolute -top-1 -right-1 w-4 h-4 p-0 bg-white text-black text-xs flex items-center justify-center">
                  {unreadCount}
                </Badge>
              )}
            </Button>

            {/* Mobile Menu */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/5 rounded-xl">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 glass border-white/20 text-white">
                <SheetHeader>
                  <SheetTitle className="text-white flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/20">
                      <RoleIcon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-lg font-bold">{user.name}</p>
                      <p className="text-sm text-gray-400 capitalize">{user.role}</p>
                    </div>
                  </SheetTitle>
                  <SheetDescription className="text-gray-400">Navigation et paramètres</SheetDescription>
                </SheetHeader>

                <div className="mt-8 space-y-4">
                  {/* Navigation Items */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Navigation</h3>
                    {navigationItems.map((item) => {
                      const Icon = item.icon
                      return (
                        <Link key={item.href} href={item.href} onClick={() => setIsOpen(false)}>
                          <div
                            className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${
                              isActive(item.href)
                                ? "bg-white/10 border border-white/20"
                                : "hover:bg-white/5"
                            }`}
                          >
                            <Icon className="w-5 h-5" />
                            <div>
                              <p className="font-medium">{item.name}</p>
                              <p className="text-xs text-gray-400">{item.description}</p>
                            </div>
                          </div>
                        </Link>
                      )
                    })}
                  </div>

                  {/* Admin Section */}
                  {user.role === "responsable" && (
                    <div className="space-y-2">
                      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Administration</h3>
                      {adminItems.map((item) => {
                        const Icon = item.icon
                        return (
                          <Link key={item.href} href={item.href} onClick={() => setIsOpen(false)}>
                            <div
                              className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${
                                isActive(item.href)
                                  ? "bg-white/10 border border-white/20"
                                  : "hover:bg-white/5"
                              }`}
                            >
                              <Icon className="w-5 h-5" />
                              <div>
                                <p className="font-medium">{item.name}</p>
                                <p className="text-xs text-gray-400">{item.description}</p>
                              </div>
                            </div>
                          </Link>
                        )
                      })}
                    </div>
                  )}

                  {/* Account Section */}
                  <div className="space-y-2 pt-4 border-t border-white/20">
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Compte</h3>
                    <div className="space-y-1">
                      <Button variant="ghost" className="w-full justify-start text-white hover:bg-white/5 rounded-xl">
                        <User className="w-4 h-4 mr-3" />
                        Profil
                      </Button>
                      <Button variant="ghost" className="w-full justify-start text-white hover:bg-white/5 rounded-xl">
                        <Settings className="w-4 h-4 mr-3" />
                        Paramètres
                      </Button>
                      <Button
                        onClick={logout}
                        variant="ghost"
                        className="w-full justify-start text-red-400 hover:bg-red-500/20 rounded-xl"
                      >
                        <LogOut className="w-4 h-4 mr-3" />
                        Déconnexion
                      </Button>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>

      {/* Spacer for fixed navigation */}
      <div className="h-16" />
    </>
  )
}
