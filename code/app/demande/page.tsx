"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Navigation } from "@/components/navigation"
import { CalendarIcon, Package, Sparkles } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

export default function DemandePage() {
  const [formData, setFormData] = useState({
    materiel: "",
    quantite: 1,
    dateDebut: undefined as Date | undefined,
    dateFin: undefined as Date | undefined,
    motif: "",
    projet: "",
    urgence: "normale",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState("")

  const materiels = [
    "Arduino Uno R3",
    "Raspberry Pi 4",
    "Capteur de température DHT22",
    "Capteur ultrasonique HC-SR04",
    "Breadboard",
    "Résistances (pack)",
    "LEDs (pack)",
    "Projecteur Epson",
    "Écran portable",
    "Câbles HDMI",
    "Multimètre",
    "Oscilloscope",
    "Alimentation variable",
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulation d'envoi de demande
    setTimeout(() => {
      setSuccess("Demande envoyée avec succès ! Vous recevrez une notification une fois traitée.")
      setIsLoading(false)

      // Reset form
      setFormData({
        materiel: "",
        quantite: 1,
        dateDebut: undefined,
        dateFin: undefined,
        motif: "",
        projet: "",
        urgence: "normale",
      })
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navigation />

      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl">
              <Package className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-purple-200">
                Nouvelle Demande
              </h1>
              <p className="text-white/70 text-lg">Remplissez le formulaire pour faire une demande d'emprunt</p>
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-b border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white text-2xl font-bold">Formulaire de demande</CardTitle>
                  <CardDescription className="text-white/70 text-lg">
                    Veuillez remplir tous les champs obligatoires
                  </CardDescription>
                </div>
                <Sparkles className="w-8 h-8 text-yellow-400 animate-pulse" />
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Matériel */}
                <div className="space-y-2">
                  <Label htmlFor="materiel" className="text-white/80 font-medium">
                    Matériel demandé *
                  </Label>
                  <Select
                    value={formData.materiel}
                    onValueChange={(value) => setFormData({ ...formData, materiel: value })}
                  >
                    <SelectTrigger className="bg-white/10 border-white/20 text-white rounded-xl h-12">
                      <SelectValue placeholder="Sélectionnez un matériel" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-white/20">
                      {materiels.map((materiel) => (
                        <SelectItem key={materiel} value={materiel} className="text-white hover:bg-white/10">
                          {materiel}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Quantité */}
                <div className="space-y-2">
                  <Label htmlFor="quantite" className="text-white/80 font-medium">
                    Quantité *
                  </Label>
                  <Input
                    id="quantite"
                    type="number"
                    min="1"
                    max="10"
                    value={formData.quantite}
                    onChange={(e) => setFormData({ ...formData, quantite: Number.parseInt(e.target.value) })}
                    className="bg-white/10 border-white/20 text-white rounded-xl h-12"
                    required
                  />
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-white/80 font-medium">Date de début *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-xl h-12"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.dateDebut ? (
                            format(formData.dateDebut, "PPP", { locale: fr })
                          ) : (
                            <span>Sélectionner une date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-slate-800 border-white/20">
                        <Calendar
                          mode="single"
                          selected={formData.dateDebut}
                          onSelect={(date) => setFormData({ ...formData, dateDebut: date })}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white/80 font-medium">Date de fin *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-xl h-12"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.dateFin ? (
                            format(formData.dateFin, "PPP", { locale: fr })
                          ) : (
                            <span>Sélectionner une date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-slate-800 border-white/20">
                        <Calendar
                          mode="single"
                          selected={formData.dateFin}
                          onSelect={(date) => setFormData({ ...formData, dateFin: date })}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {/* Projet */}
                <div className="space-y-2">
                  <Label htmlFor="projet" className="text-white/80 font-medium">
                    Nom du projet *
                  </Label>
                  <Input
                    id="projet"
                    placeholder="Ex: Système de surveillance IoT"
                    value={formData.projet}
                    onChange={(e) => setFormData({ ...formData, projet: e.target.value })}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/40 rounded-xl h-12"
                    required
                  />
                </div>

                {/* Motif */}
                <div className="space-y-2">
                  <Label htmlFor="motif" className="text-white/80 font-medium">
                    Motif de la demande *
                  </Label>
                  <Textarea
                    id="motif"
                    placeholder="Décrivez l'utilisation prévue du matériel..."
                    value={formData.motif}
                    onChange={(e) => setFormData({ ...formData, motif: e.target.value })}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/40 rounded-xl"
                    rows={4}
                    required
                  />
                </div>

                {/* Urgence */}
                <div className="space-y-2">
                  <Label htmlFor="urgence" className="text-white/80 font-medium">
                    Niveau d'urgence
                  </Label>
                  <Select
                    value={formData.urgence}
                    onValueChange={(value) => setFormData({ ...formData, urgence: value })}
                  >
                    <SelectTrigger className="bg-white/10 border-white/20 text-white rounded-xl h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-white/20">
                      <SelectItem value="faible" className="text-white hover:bg-white/10">
                        Faible
                      </SelectItem>
                      <SelectItem value="normale" className="text-white hover:bg-white/10">
                        Normale
                      </SelectItem>
                      <SelectItem value="elevee" className="text-white hover:bg-white/10">
                        Élevée
                      </SelectItem>
                      <SelectItem value="urgente" className="text-white hover:bg-white/10">
                        Urgente
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {success && (
                  <Alert className="bg-green-500/20 border-green-500/50 text-green-100 rounded-2xl">
                    <Sparkles className="h-4 w-4" />
                    <AlertDescription className="font-medium">{success}</AlertDescription>
                  </Alert>
                )}

                <div className="flex gap-4 pt-4">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 h-12 rounded-xl font-semibold shadow-lg hover:shadow-purple-500/25 transform hover:scale-105 transition-all duration-300"
                  >
                    {isLoading ? "Envoi en cours..." : "Envoyer la demande"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      <style jsx>{`
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  )
}
