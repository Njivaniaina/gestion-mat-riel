"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"

interface User {
  id: string
  email: string
  name: string
  role: "etudiant" | "professeur" | "responsable"
  numeroEtudiant?: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string, role: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  // Pages publiques qui ne nécessitent pas d'authentification
  const publicPages = ["/", "/login", "/register"]

  useEffect(() => {
    // Vérifier si l'utilisateur est connecté au chargement
    const userData = localStorage.getItem("user")
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData)
        setUser(parsedUser)
      } catch (error) {
        console.error("Erreur lors du parsing des données utilisateur:", error)
        localStorage.removeItem("user")
      }
    }
    setIsLoading(false)
  }, [])

  useEffect(() => {
    // Redirection automatique
    if (!isLoading) {
      if (!user && !publicPages.includes(pathname)) {
        // Utilisateur non connecté sur une page privée -> redirection vers login
        router.push("/login")
      } else if (user && (pathname === "/login" || pathname === "/register")) {
        // Utilisateur connecté sur page de connexion -> redirection vers dashboard
        router.push("/dashboard")
      } else if (user && pathname === "/") {
        // Utilisateur connecté sur page d'accueil -> redirection vers dashboard
        router.push("/dashboard")
      }
    }
  }, [user, pathname, isLoading, router])

  const login = async (email: string, password: string, role: string): Promise<boolean> => {
    try {
      // Simulation d'une API de connexion
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Validation basique
      if (!email || !password || !role) {
        return false
      }

      // Créer l'utilisateur
      const newUser: User = {
        id: Date.now().toString(),
        email,
        name: email.split("@")[0],
        role: role as User["role"],
        numeroEtudiant:
          role === "etudiant"
            ? "2024" +
              Math.floor(Math.random() * 1000)
                .toString()
                .padStart(3, "0")
            : undefined,
      }

      // Sauvegarder dans localStorage
      localStorage.setItem("user", JSON.stringify(newUser))
      setUser(newUser)

      return true
    } catch (error) {
      console.error("Erreur lors de la connexion:", error)
      return false
    }
  }

  const logout = () => {
    localStorage.removeItem("user")
    setUser(null)
    router.push("/")
  }

  return <AuthContext.Provider value={{ user, login, logout, isLoading }}>{children}</AuthContext.Provider>
}
