"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Navigation } from "@/components/navigation"
import { Search, Package, Cpu, Camera, Zap, Sparkles, Filter, Star } from "lucide-react"
import Link from "next/link"

interface Materiel {
  id: number
  nom: string
  description: string
  categorie: string
  disponible: number
  total: number
  prix?: number
  etat: string
}

export default function MaterielPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("tous")
  const [materiels, setMateriels] = useState<Materiel[]>([])

  useEffect(() => {
    // Charger les matériels depuis localStorage
    const savedMateriels = localStorage.getItem("materiels")
    if (savedMateriels) {
      setMateriels(JSON.parse(savedMateriels))
    }
  }, [])

  const categories = [
    { value: "tous", label: "Tous", count: materiels.length },
    {
      value: "microcontroleur",
      label: "Microcontrôleurs",
      count: materiels.filter((m) => m.categorie === "microcontroleur").length,
    },
    { value: "capteur", label: "Capteurs", count: materiels.filter((m) => m.categorie === "capteur").length },
    {
      value: "audiovisuel",
      label: "Audiovisuel",
      count: materiels.filter((m) => m.categorie === "audiovisuel").length,
    },
    { value: "mesure", label: "Instruments", count: materiels.filter((m) => m.categorie === "mesure").length },
    { value: "composant", label: "Composants", count: materiels.filter((m) => m.categorie === "composant").length },
  ]

  const filteredMateriels = materiels.filter((materiel) => {
    const matchesSearch =
      materiel.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      materiel.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "tous" || materiel.categorie === selectedCategory
    return matchesSearch && matchesCategory
  })

  const getDisponibiliteColor = (disponible: number, total: number) => {
    const ratio = disponible / total
    if (ratio > 0.5) return "from-green-500 to-emerald-500"
    if (ratio > 0.2) return "from-orange-500 to-yellow-500"
    return "from-red-500 to-pink-500"
  }

  const getDisponibiliteText = (disponible: number, total: number) => {
    const ratio = disponible / total
    if (ratio > 0.5) return "Excellent"
    if (ratio > 0.2) return "Limité"
    return "Critique"
  }

  const getIconForCategory = (categorie: string) => {
    switch (categorie) {
      case "microcontroleur":
        return Cpu
      case "audiovisuel":
        return Camera
      case "capteur":
      case "mesure":
        return Zap
      default:
        return Package
    }
  }

  const getRating = () => Math.round((Math.random() * 1.5 + 3.5) * 10) / 10 // Random rating between 3.5-5.0

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navigation />

      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl">
              <Package className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-200">
                Catalogue Matériel
              </h1>
              <p className="text-white/70 text-lg">Découvrez notre collection de matériels high-tech</p>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
              <Input
                placeholder="Rechercher un matériel..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 bg-white/10 border-white/20 text-white placeholder:text-white/40 rounded-2xl h-14 text-lg focus:border-blue-400"
              />
            </div>
            <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 px-6 h-14 rounded-2xl">
              <Filter className="w-5 h-5 mr-2" />
              Filtres Avancés
            </Button>
          </div>

          {/* Category Pills */}
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <Button
                key={category.value}
                variant={selectedCategory === category.value ? "default" : "outline"}
                className={`px-6 py-3 rounded-2xl font-semibold transition-all duration-300 ${
                  selectedCategory === category.value
                    ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg transform scale-105"
                    : "bg-white/10 border-white/30 text-white hover:bg-white/20 hover:border-white/50"
                }`}
                onClick={() => setSelectedCategory(category.value)}
              >
                {category.label}
                <span className="ml-2 px-2 py-1 bg-white/20 rounded-full text-xs">{category.count}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 backdrop-blur-md border border-white/20 rounded-2xl">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-black text-white mb-2">{filteredMateriels.length}</div>
              <p className="text-white/70">Matériels trouvés</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-md border border-white/20 rounded-2xl">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-black text-white mb-2">
                {filteredMateriels.reduce((acc, m) => acc + m.disponible, 0)}
              </div>
              <p className="text-white/70">Unités disponibles</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-md border border-white/20 rounded-2xl">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-black text-white mb-2">
                {filteredMateriels.length > 0
                  ? Math.round(
                      (filteredMateriels.reduce((acc, m) => acc + getRating(), 0) / filteredMateriels.length) * 10,
                    ) / 10
                  : 0}
              </div>
              <p className="text-white/70">Note moyenne</p>
            </CardContent>
          </Card>
        </div>

        {/* Materials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredMateriels.map((materiel, index) => {
            const IconComponent = getIconForCategory(materiel.categorie)
            const disponibiliteGradient = getDisponibiliteColor(materiel.disponible, materiel.total)
            const disponibiliteText = getDisponibiliteText(materiel.disponible, materiel.total)
            const rating = getRating()

            return (
              <Card
                key={materiel.id}
                className="group relative bg-white/10 backdrop-blur-md border border-white/20 hover:border-white/40 rounded-3xl overflow-hidden transition-all duration-500 hover:transform hover:scale-105 hover:shadow-2xl"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                <CardHeader className="relative z-10 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                        <IconComponent className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-white text-xl font-bold group-hover:text-blue-200 transition-colors duration-300">
                          {materiel.nom}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="text-yellow-400 font-semibold">{rating}</span>
                          </div>
                          <Badge className={`bg-gradient-to-r ${disponibiliteGradient} text-white border-0 text-xs`}>
                            {disponibiliteText}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <Sparkles className="w-6 h-6 text-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse" />
                  </div>
                  <CardDescription className="text-white/70 leading-relaxed text-base">
                    {materiel.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="relative z-10 p-6 pt-0">
                  <div className="space-y-4">
                    {/* Availability Bar */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-white/60 text-sm">Disponibilité</span>
                        <span className="text-white font-bold">
                          {materiel.disponible}/{materiel.total}
                        </span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                        <div
                          className={`bg-gradient-to-r ${disponibiliteGradient} h-3 rounded-full transition-all duration-500 group-hover:shadow-lg`}
                          style={{ width: `${(materiel.disponible / materiel.total) * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* Price and Category */}
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-white/60 text-sm">Prix</span>
                        <p className="text-green-400 font-bold text-lg">{materiel.prix?.toLocaleString()} Ar</p>
                      </div>
                      <Badge variant="secondary" className="capitalize bg-white/20 text-white border-0">
                        {materiel.categorie}
                      </Badge>
                    </div>

                    {/* Action Button */}
                    <Link href={`/demande?materiel=${encodeURIComponent(materiel.nom)}`}>
                      <Button
                        className={`w-full h-12 rounded-2xl font-semibold transition-all duration-300 ${
                          materiel.disponible > 0
                            ? "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg hover:shadow-green-500/25 transform hover:scale-105"
                            : "bg-gray-500/50 text-gray-300 cursor-not-allowed"
                        }`}
                        disabled={materiel.disponible === 0}
                      >
                        {materiel.disponible > 0 ? (
                          <div className="flex items-center gap-2">
                            <Zap className="w-5 h-5" />
                            Emprunter Maintenant
                          </div>
                        ) : (
                          "Indisponible"
                        )}
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Empty State */}
        {filteredMateriels.length === 0 && (
          <div className="text-center py-16">
            <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full flex items-center justify-center">
              <Package className="w-16 h-16 text-blue-400" />
            </div>
            <h3 className="text-3xl font-bold text-white mb-4">Aucun matériel trouvé</h3>
            <p className="text-white/60 text-lg mb-8 max-w-md mx-auto">
              Essayez de modifier vos critères de recherche ou explorez d'autres catégories
            </p>
            <Button
              onClick={() => {
                setSearchTerm("")
                setSelectedCategory("tous")
              }}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 px-8 py-3 rounded-2xl"
            >
              Réinitialiser les filtres
            </Button>
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
