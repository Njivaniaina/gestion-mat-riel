"use client"

import { useState, useEffect } from "react"
import { materielService, type Materiel, initializeDefaultData } from "@/lib/api"

export function useMateriels() {
  const [materiels, setMateriels] = useState<Materiel[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadMateriels = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await materielService.getAll()
      setMateriels(data)
    } catch (err) {
      setError("Erreur lors du chargement des matériels")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const createMateriel = async (materiel: Omit<Materiel, "id" | "createdAt" | "updatedAt">) => {
    try {
      const newMateriel = await materielService.create(materiel)
      setMateriels((prev) => [...prev, newMateriel])
      return newMateriel
    } catch (err) {
      setError("Erreur lors de la création du matériel")
      throw err
    }
  }

  const updateMateriel = async (id: string, updates: Partial<Materiel>) => {
    try {
      const updatedMateriel = await materielService.update(id, updates)
      if (updatedMateriel) {
        setMateriels((prev) => prev.map((m) => (m.id === id ? updatedMateriel : m)))
        return updatedMateriel
      }
      throw new Error("Matériel non trouvé")
    } catch (err) {
      setError("Erreur lors de la mise à jour du matériel")
      throw err
    }
  }

  const deleteMateriel = async (id: string) => {
    try {
      const success = await materielService.delete(id)
      if (success) {
        setMateriels((prev) => prev.filter((m) => m.id !== id))
        return true
      }
      throw new Error("Impossible de supprimer le matériel")
    } catch (err) {
      setError("Erreur lors de la suppression du matériel")
      throw err
    }
  }

  useEffect(() => {
    // Initialiser les données par défaut si nécessaire
    initializeDefaultData()
    loadMateriels()
  }, [])

  return {
    materiels,
    isLoading,
    error,
    loadMateriels,
    createMateriel,
    updateMateriel,
    deleteMateriel,
  }
}
