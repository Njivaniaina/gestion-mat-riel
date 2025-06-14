"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Zap, Shield, Rocket, Database, Users, Package, BarChart3, ArrowRight, CheckCircle, Star, Github, ExternalLink } from 'lucide-react'
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Grid background */}
      <div className="absolute inset-0 grid-bg opacity-30"></div>
      
      {/* Gradient overlays */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white/3 rounded-full blur-3xl"></div>

      <div className="relative z-10 container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <Badge className="mb-6 bg-white/10 text-white border-white/20 hover:bg-white/20 transition-colors">
            <Zap className="w-4 h-4 mr-2" />
            MIT/MISA - Innovation & Excellence
          </Badge>

          <h1 className="text-6xl md:text-8xl font-black mb-6 leading-tight">
            <span className="gradient-text">Gestion d'Emprunt</span>
            <br />
            <span className="text-white">Nouvelle Génération</span>
          </h1>

          <p className="text-xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed">
            Révolutionnez la gestion de vos ressources matérielles avec notre plateforme ultra-moderne. 
            Interface minimaliste, performances exceptionnelles, et expérience utilisateur inégalée.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <Link href="/login">
              <Button size="lg" className="btn-primary px-8 py-4 rounded-2xl text-lg font-semibold group">
                <Rocket className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform duration-300" />
                Lancer l'Application
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
            </Link>
            <Link href="/register">
              <Button size="lg" className="btn-secondary px-8 py-4 rounded-2xl text-lg font-semibold">
                <Shield className="w-5 h-5 mr-2" />
                Créer un Compte
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {[
            {
              icon: Database,
              title: "Gestion Intelligente",
              description: "Base de données robuste avec MySQL pour une fiabilité maximale",
              delay: "0ms",
            },
            {
              icon: Users,
              title: "Multi-Utilisateurs",
              description: "Collaboration fluide entre étudiants, professeurs et responsables",
              delay: "100ms",
            },
            {
              icon: Package,
              title: "Suivi Temps Réel",
              description: "Notifications instantanées et tableaux de bord dynamiques",
              delay: "200ms",
            },
            {
              icon: BarChart3,
              title: "Analytics Avancés",
              description: "Rapports détaillés et insights basés sur les données",
              delay: "300ms",
            },
          ].map((feature, index) => (
            <Card
              key={index}
              className="glass card-hover border-white/10 rounded-2xl group"
              style={{ animationDelay: feature.delay }}
            >
              <CardHeader className="text-center p-8">
                <div className="inline-flex p-4 rounded-2xl bg-white/10 mb-4 group-hover:bg-white/20 transition-colors duration-300 mx-auto">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-white text-xl font-bold mb-2">{feature.title}</CardTitle>
                <CardDescription className="text-gray-400 leading-relaxed">{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>

        {/* Stats Section */}
        <div className="glass-strong rounded-3xl p-8 mb-20 border-white/10">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="group">
              <div className="text-5xl font-black text-white mb-2 group-hover:scale-110 transition-transform duration-300">
                500+
              </div>
              <p className="text-gray-400 font-medium">Matériels Gérés</p>
            </div>
            <div className="group">
              <div className="text-5xl font-black text-white mb-2 group-hover:scale-110 transition-transform duration-300">
                1200+
              </div>
              <p className="text-gray-400 font-medium">Utilisateurs Actifs</p>
            </div>
            <div className="group">
              <div className="text-5xl font-black text-white mb-2 group-hover:scale-110 transition-transform duration-300">
                99.9%
              </div>
              <p className="text-gray-400 font-medium">Disponibilité</p>
            </div>
          </div>
        </div>

        {/* Features Showcase */}
        <div className="grid lg:grid-cols-2 gap-12 mb-20">
          <div className="space-y-8">
            <div>
              <h2 className="text-4xl font-black text-white mb-4">
                Fonctionnalités Avancées
              </h2>
              <p className="text-gray-400 text-lg leading-relaxed">
                Une suite complète d'outils pour optimiser la gestion de vos ressources matérielles.
              </p>
            </div>
            
            <div className="space-y-6">
              {[
                "Authentification sécurisée avec gestion des rôles",
                "Interface responsive et moderne",
                "Notifications en temps réel",
                "Rapports et analytics détaillés",
                "API REST complète avec MySQL",
                "Système de backup automatique"
              ].map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-white flex-shrink-0" />
                  <span className="text-gray-300">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="glass-strong rounded-2xl p-8 border-white/10">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Emprunts actifs</span>
                  <span className="text-white font-bold">24</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div className="bg-white h-2 rounded-full w-3/4"></div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Matériels disponibles</span>
                  <span className="text-white font-bold">156</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div className="bg-white h-2 rounded-full w-5/6"></div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Utilisateurs connectés</span>
                  <span className="text-white font-bold">89</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div className="bg-white h-2 rounded-full w-2/3"></div>
                </div>
              </div>
            </div>
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/5 rounded-full blur-xl"></div>
          </div>
        </div>

        {/* Team Section */}
        <Card className="glass-strong border-white/10 rounded-3xl overflow-hidden">
          <CardHeader className="text-center p-8 bg-white/5">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Star className="w-6 h-6 text-white" />
              <CardTitle className="text-white text-3xl font-black">Équipe de Développement</CardTitle>
            </div>
            <CardDescription className="text-gray-400 text-lg">
              Les architectes de l'innovation MIT/MISA
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {["David", "Mirado", "Nirintsoa", "Njivaniaina"].map((name, index) => (
                <div key={name} className="group text-center">
                  <div className="w-20 h-20 mx-auto mb-4 bg-white/10 rounded-2xl flex items-center justify-center text-white font-bold text-xl group-hover:bg-white/20 group-hover:scale-110 transition-all duration-300 border border-white/20">
                    {name[0]}
                  </div>
                  <div className="font-semibold text-white group-hover:text-gray-300 transition-colors duration-300">
                    {name}
                  </div>
                  <div className="text-gray-400 text-sm">Developer</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <div className="text-center mt-20">
          <h2 className="text-4xl font-black text-white mb-4">
            Prêt à commencer ?
          </h2>
          <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
            Rejoignez des centaines d'utilisateurs qui font déjà confiance à notre plateforme 
            pour gérer leurs ressources matérielles.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/register">
              <Button size="lg" className="btn-primary px-8 py-4 rounded-2xl text-lg font-semibold">
                Commencer gratuitement
              </Button>
            </Link>
            <Button size="lg" className="btn-secondary px-8 py-4 rounded-2xl text-lg font-semibold">
              <Github className="w-5 h-5 mr-2" />
              Voir le code source
              <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
