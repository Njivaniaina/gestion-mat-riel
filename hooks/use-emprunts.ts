"use client"

import { useState, useEffect } from "react"
import { empruntService, type Emprunt } from "@/lib/api"
import { useAuth } from "@/components/auth-provider"

export function useEmprunts() {
  const { user } = useAuth()
  const [emprunts, setEmprunts] = useState<Emprunt[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadEmprunts = async () => {
    if (!user) return

    try {
      setIsLoading(true)
      setError(null)
      const data = user.role === "responsable" ? await empruntService.getAll() : await empruntService.getByUser(user.id)
      setEmprunts(data)
    } catch (err) {
      setError("Erreur lors du chargement des emprunts")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const createEmprunt = async (emprunt: Omit<Emprunt, "id" | "createdAt" | "updatedAt">) => {
    try {
      const newEmprunt = await empruntService.create(emprunt)
      setEmprunts((prev) => [...prev, newEmprunt])
      return newEmprunt
    } catch (err) {
      setError("Erreur lors de la création de l'emprunt")
      throw err
    }
  }

  const updateEmprunt = async (id: string, updates: Partial<Emprunt>) => {
    try {
      const updatedEmprunt = await empruntService.update(id, updates)
      if (updatedEmprunt) {
        setEmprunts((prev) => prev.map((e) => (e.id === id ? updatedEmprunt : e)))
        return updatedEmprunt
      }
      throw new Error("Emprunt non trouvé")
    } catch (err) {
      setError("Erreur lors de la mise à jour de l'emprunt")
      throw err
    }
  }

  useEffect(() => {
    loadEmprunts()
  }, [user])

  return {
    emprunts,
    isLoading,
    error,
    loadEmprunts,
    createEmprunt,
    updateEmprunt,
  }
}
