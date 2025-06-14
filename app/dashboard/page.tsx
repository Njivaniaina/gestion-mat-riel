"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Package, Clock, AlertTriangle, CheckCircle, Plus, TrendingUp, Zap, Sparkles } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/components/auth-provider"

export default function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    empruntsActifs: 0,
    enRetard: 0,
    terminesThisMois: 0,
    tempsMoyen: "0j",
  })

  useEffect(() => {
    // Charger les statistiques depuis localStorage ou API
    const loadStats = () => {
      // Simulation de chargement des stats
      setStats({
        empruntsActifs: 2,
        enRetard: 1,
        terminesThisMois: 5,
        tempsMoyen: "7j",
      })
    }

    loadStats()
  }, [])

  const mockEmprunts = [
    {
      id: 1,
      materiel: "Arduino Uno R3",
      dateEmprunt: "2024-01-15",
      dateRetour: "2024-01-22",
      statut: "en_cours",
      responsable: "M. Rakoto",
    },
    {
      id: 2,
      materiel: "Raspberry Pi 4",
      dateEmprunt: "2024-01-10",
      dateRetour: "2024-01-17",
      statut: "retarde",
      responsable: "Mme. Rabe",
    },
    {
      id: 3,
      materiel: "Projecteur Epson",
      dateEmprunt: "2024-01-05",
      dateRetour: "2024-01-12",
      statut: "termine",
      responsable: "M. Andry",
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
      default:
        return <Badge>Inconnu</Badge>
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-purple-200">
                Bienvenue, {user.name} !
              </h1>
              <p className="text-white/70 text-lg">
                Votre tableau de bord personnel
                <span className="ml-3 px-3 py-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full text-sm border border-purple-500/30 capitalize">
                  {user.role}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {[
            {
              title: "Emprunts actifs",
              value: stats.empruntsActifs.toString(),
              subtitle: "+1 depuis la semaine dernière",
              icon: Package,
              gradient: "from-blue-500 to-cyan-500",
              bgGradient: "from-blue-500/20 to-cyan-500/20",
            },
            {
              title: "En retard",
              value: stats.enRetard.toString(),
              subtitle: "Action requise",
              icon: AlertTriangle,
              gradient: "from-red-500 to-pink-500",
              bgGradient: "from-red-500/20 to-pink-500/20",
            },
            {
              title: "Terminés ce mois",
              value: stats.terminesThisMois.toString(),
              subtitle: "+2 par rapport au mois dernier",
              icon: CheckCircle,
              gradient: "from-green-500 to-emerald-500",
              bgGradient: "from-green-500/20 to-emerald-500/20",
            },
            {
              title: "Temps moyen",
              value: stats.tempsMoyen,
              subtitle: "Durée moyenne d'emprunt",
              icon: Clock,
              gradient: "from-purple-500 to-violet-500",
              bgGradient: "from-purple-500/20 to-violet-500/20",
            },
          ].map((stat, index) => (
            <Card
              key={index}
              className={`group relative bg-gradient-to-br ${stat.bgGradient} backdrop-blur-md border border-white/20 hover:border-white/40 rounded-2xl overflow-hidden transition-all duration-300 hover:transform hover:scale-105`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <CardTitle className="text-sm font-medium text-white/80">{stat.title}</CardTitle>
                <div
                  className={`p-2 rounded-xl bg-gradient-to-r ${stat.gradient} group-hover:scale-110 transition-transform duration-300`}
                >
                  <stat.icon className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-3xl font-black text-white mb-1">{stat.value}</div>
                <p className="text-xs text-white/60">{stat.subtitle}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {[
            {
              title: "Nouvelle demande",
              description: "Faire une demande d'emprunt de matériel",
              icon: Plus,
              href: "/demande",
              gradient: "from-purple-500 to-pink-500",
            },
            {
              title: "Catalogue matériel",
              description: "Voir tous les matériels disponibles",
              icon: Package,
              href: "/materiel",
              gradient: "from-blue-500 to-cyan-500",
            },
            {
              title: "Historique",
              description: "Consulter l'historique de vos emprunts",
              icon: Clock,
              href: "/historique",
              gradient: "from-green-500 to-emerald-500",
            },
          ].map((action, index) => (
            <Link key={index} href={action.href}>
              <Card className="group relative bg-white/10 backdrop-blur-md border border-white/20 hover:border-white/40 rounded-2xl overflow-hidden transition-all duration-300 hover:transform hover:scale-105 cursor-pointer h-full">
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                ></div>
                <CardHeader className="relative z-10 p-6">
                  <div className="flex items-center gap-4 mb-3">
                    <div
                      className={`p-3 rounded-2xl bg-gradient-to-r ${action.gradient} group-hover:scale-110 transition-transform duration-300`}
                    >
                      <action.icon className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-white text-xl font-bold group-hover:text-purple-200 transition-colors duration-300">
                      {action.title}
                    </CardTitle>
                  </div>
                  <CardDescription className="text-white/70 leading-relaxed">{action.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>

        {/* Recent Loans */}
        <Card className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white text-2xl font-bold flex items-center gap-3">
                  <TrendingUp className="w-6 h-6 text-purple-400" />
                  Mes emprunts récents
                </CardTitle>
                <CardDescription className="text-white/70 text-lg">
                  Aperçu de vos derniers emprunts de matériel
                </CardDescription>
              </div>
              <Zap className="w-8 h-8 text-yellow-400 animate-pulse" />
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {mockEmprunts.map((emprunt, index) => (
                <div
                  key={emprunt.id}
                  className="group flex items-center justify-between p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl hover:border-white/30 transition-all duration-300 hover:transform hover:scale-[1.02]"
                >
                  <div className="flex-1">
                    <h4 className="font-bold text-white text-lg mb-2 group-hover:text-purple-200 transition-colors duration-300">
                      {emprunt.materiel}
                    </h4>
                    <p className="text-white/60 mb-1">
                      Emprunté le <span className="text-purple-300 font-medium">{emprunt.dateEmprunt}</span> • Retour
                      prévu: <span className="text-pink-300 font-medium">{emprunt.dateRetour}</span>
                    </p>
                    <p className="text-white/50">
                      Responsable: <span className="text-cyan-300">{emprunt.responsable}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    {getStatutBadge(emprunt.statut)}
                    {emprunt.statut === "en_cours" && (
                      <Button
                        size="sm"
                        className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0"
                      >
                        Rendre
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <style jsx>{`
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  )
}
