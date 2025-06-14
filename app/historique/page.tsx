"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Navigation } from "@/components/navigation"
import { Search, Download, Eye, History } from "lucide-react"

export default function HistoriquePage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("tous")

  const historique = [
    {
      id: 1,
      materiel: "Arduino Uno R3",
      quantite: 2,
      dateEmprunt: "2024-01-15",
      dateRetour: "2024-01-22",
      dateRetourEffective: "2024-01-22",
      statut: "termine",
      responsable: "M. Rakoto",
      projet: "Système d'alarme IoT",
      motif: "Projet de fin d'études",
      frais: 0,
    },
    {
      id: 2,
      materiel: "Raspberry Pi 4",
      quantite: 1,
      dateEmprunt: "2024-01-10",
      dateRetour: "2024-01-17",
      dateRetourEffective: "2024-01-20",
      statut: "retarde",
      responsable: "Mme. Rabe",
      projet: "Station météo connectée",
      motif: "Projet personnel",
      frais: 5000,
    },
    {
      id: 3,
      materiel: "Projecteur Epson",
      quantite: 1,
      dateEmprunt: "2024-01-05",
      dateRetour: "2024-01-12",
      dateRetourEffective: "2024-01-12",
      statut: "termine",
      responsable: "M. Andry",
      projet: "Présentation thèse",
      motif: "Soutenance de thèse",
      frais: 0,
    },
    {
      id: 4,
      materiel: "Multimètre",
      quantite: 1,
      dateEmprunt: "2023-12-20",
      dateRetour: "2023-12-27",
      dateRetourEffective: null,
      statut: "en_cours",
      responsable: "M. Rakoto",
      projet: "Réparation équipement",
      motif: "Maintenance laboratoire",
      frais: 0,
    },
  ]

  const getStatutBadge = (statut: string) => {
    switch (statut) {
      case "en_cours":
        return <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0">En cours</Badge>
      case "retarde":
        return <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white border-0">Retardé</Badge>
      case "termine":
        return <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0">Terminé</Badge>
      case "annule":
        return <Badge variant="outline">Annulé</Badge>
      default:
        return <Badge>Inconnu</Badge>
    }
  }

  const filteredHistorique = historique.filter((item) => {
    const matchesSearch =
      item.materiel.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.projet.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "tous" || item.statut === statusFilter
    return matchesSearch && matchesStatus
  })

  const exportData = () => {
    // Simulation d'export
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "Matériel,Quantité,Date Emprunt,Date Retour,Statut,Responsable,Projet\n" +
      filteredHistorique
        .map(
          (item) =>
            `${item.materiel},${item.quantite},${item.dateEmprunt},${item.dateRetour},${item.statut},${item.responsable},${item.projet}`,
        )
        .join("\n")

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", "historique_emprunts.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navigation />

      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-96 h-96 bg-green-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-emerald-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl">
                <History className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-green-200">
                  Historique des Emprunts
                </h1>
                <p className="text-white/70 text-lg">Consultez l'historique complet de vos emprunts</p>
              </div>
            </div>
            <Button
              onClick={exportData}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0 px-6 py-3 rounded-2xl font-semibold shadow-lg hover:shadow-blue-500/25 transform hover:scale-105 transition-all duration-300"
            >
              <Download className="w-4 h-4 mr-2" />
              Exporter
            </Button>
          </div>
        </div>

        {/* Filtres */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-4 h-4" />
              <Input
                placeholder="Rechercher par matériel ou projet..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/40 rounded-2xl h-12"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48 bg-white/10 border-white/20 text-white rounded-2xl h-12">
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-white/20">
                <SelectItem value="tous" className="text-white hover:bg-white/10">
                  Tous les statuts
                </SelectItem>
                <SelectItem value="en_cours" className="text-white hover:bg-white/10">
                  En cours
                </SelectItem>
                <SelectItem value="termine" className="text-white hover:bg-white/10">
                  Terminé
                </SelectItem>
                <SelectItem value="retarde" className="text-white hover:bg-white/10">
                  Retardé
                </SelectItem>
                <SelectItem value="annule" className="text-white hover:bg-white/10">
                  Annulé
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Statistiques rapides */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 backdrop-blur-md border border-white/20 rounded-2xl">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-400">{historique.length}</div>
              <p className="text-sm text-white/60">Total emprunts</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-md border border-white/20 rounded-2xl">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-400">
                {historique.filter((h) => h.statut === "termine").length}
              </div>
              <p className="text-sm text-white/60">Terminés</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-orange-500/20 to-yellow-500/20 backdrop-blur-md border border-white/20 rounded-2xl">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-orange-400">
                {historique.filter((h) => h.statut === "en_cours").length}
              </div>
              <p className="text-sm text-white/60">En cours</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-red-500/20 to-pink-500/20 backdrop-blur-md border border-white/20 rounded-2xl">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-400">
                {historique.filter((h) => h.statut === "retarde").length}
              </div>
              <p className="text-sm text-white/60">Retardés</p>
            </CardContent>
          </Card>
        </div>

        {/* Liste des emprunts */}
        <div className="space-y-4">
          {filteredHistorique.map((item) => (
            <Card
              key={item.id}
              className="bg-white/10 backdrop-blur-md border border-white/20 hover:border-white/40 rounded-2xl overflow-hidden transition-all duration-300 hover:transform hover:scale-[1.02]"
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg text-white font-bold">{item.materiel}</CardTitle>
                    <CardDescription className="text-white/70">
                      Projet: {item.projet} • Quantité: {item.quantite}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatutBadge(item.statut)}
                    <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 rounded-xl">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-white/60">Date emprunt:</span>
                    <p className="text-white">{item.dateEmprunt}</p>
                  </div>
                  <div>
                    <span className="font-medium text-white/60">Date retour prévue:</span>
                    <p className="text-white">{item.dateRetour}</p>
                  </div>
                  <div>
                    <span className="font-medium text-white/60">Date retour effective:</span>
                    <p className="text-white">{item.dateRetourEffective || "En cours"}</p>
                  </div>
                  <div>
                    <span className="font-medium text-white/60">Responsable:</span>
                    <p className="text-white">{item.responsable}</p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-white/10">
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-white/60">Motif:</span>
                      <p className="text-white/80">{item.motif}</p>
                    </div>
                    {item.frais > 0 && (
                      <div>
                        <span className="font-medium text-white/60">Frais:</span>
                        <p className="text-red-400 font-semibold">{item.frais.toLocaleString()} Ar</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredHistorique.length === 0 && (
          <div className="text-center py-12">
            <div className="text-white/40 mb-4">
              <Search className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Aucun emprunt trouvé</h3>
            <p className="text-white/60">Essayez de modifier vos critères de recherche</p>
          </div>
        )}
      </div>

      <style jsx>{`
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  )
}
