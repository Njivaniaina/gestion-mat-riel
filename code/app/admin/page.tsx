"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Navigation } from "@/components/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, Edit, Trash2, Users, Package, Search, Sparkles, Zap, Crown, Save, X } from "lucide-react"
import { useRouter } from "next/navigation"

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

interface Etudiant {
  id: number
  nom: string
  prenom: string
  email: string
  numeroEtudiant: string
  role: string
  statut: string
  empruntsActifs: number
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<"materiels" | "etudiants">("materiels")
  const [materiels, setMateriels] = useState<Materiel[]>([])
  const [etudiants, setEtudiants] = useState<Etudiant[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddMaterielOpen, setIsAddMaterielOpen] = useState(false)
  const [isAddEtudiantOpen, setIsAddEtudiantOpen] = useState(false)
  const [isEditMaterielOpen, setIsEditMaterielOpen] = useState(false)
  const [editingMateriel, setEditingMateriel] = useState<Materiel | null>(null)
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")
  const router = useRouter()

  const [newMateriel, setNewMateriel] = useState({
    nom: "",
    description: "",
    categorie: "",
    total: 1,
    prix: 0,
    etat: "excellent",
  })

  const [newEtudiant, setNewEtudiant] = useState({
    nom: "",
    prenom: "",
    email: "",
    numeroEtudiant: "",
    role: "etudiant",
  })

  // Charger les données depuis localStorage
  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (!userData) {
      router.push("/login")
      return
    }

    const user = JSON.parse(userData)
    if (user.role !== "responsable") {
      router.push("/dashboard")
      return
    }

    // Charger les matériels depuis localStorage ou utiliser les données par défaut
    const savedMateriels = localStorage.getItem("materiels")
    if (savedMateriels) {
      setMateriels(JSON.parse(savedMateriels))
    } else {
      const defaultMateriels = [
        {
          id: 1,
          nom: "Arduino Uno R3",
          description: "Microcontrôleur pour projets électroniques",
          categorie: "microcontroleur",
          disponible: 15,
          total: 20,
          prix: 25000,
          etat: "excellent",
        },
        {
          id: 2,
          nom: "Raspberry Pi 4",
          description: "Mini-ordinateur pour projets IoT",
          categorie: "microcontroleur",
          disponible: 8,
          total: 12,
          prix: 85000,
          etat: "bon",
        },
        {
          id: 3,
          nom: "Capteur DHT22",
          description: "Capteur de température et humidité",
          categorie: "capteur",
          disponible: 25,
          total: 30,
          prix: 15000,
          etat: "excellent",
        },
      ]
      setMateriels(defaultMateriels)
      localStorage.setItem("materiels", JSON.stringify(defaultMateriels))
    }

    // Charger les étudiants
    const savedEtudiants = localStorage.getItem("etudiants")
    if (savedEtudiants) {
      setEtudiants(JSON.parse(savedEtudiants))
    } else {
      const defaultEtudiants = [
        {
          id: 1,
          nom: "Rakoto",
          prenom: "Jean",
          email: "jean.rakoto@mit-misa.edu",
          numeroEtudiant: "2024001",
          role: "etudiant",
          statut: "actif",
          empruntsActifs: 2,
        },
        {
          id: 2,
          nom: "Rabe",
          prenom: "Marie",
          email: "marie.rabe@mit-misa.edu",
          numeroEtudiant: "2024002",
          role: "etudiant",
          statut: "actif",
          empruntsActifs: 1,
        },
      ]
      setEtudiants(defaultEtudiants)
      localStorage.setItem("etudiants", JSON.stringify(defaultEtudiants))
    }
  }, [router])

  // Sauvegarder les matériels dans localStorage
  const saveMateriels = (newMateriels: Materiel[]) => {
    setMateriels(newMateriels)
    localStorage.setItem("materiels", JSON.stringify(newMateriels))
  }

  // Sauvegarder les étudiants dans localStorage
  const saveEtudiants = (newEtudiants: Etudiant[]) => {
    setEtudiants(newEtudiants)
    localStorage.setItem("etudiants", JSON.stringify(newEtudiants))
  }

  const showSuccess = (message: string) => {
    setSuccess(message)
    setError("")
    setTimeout(() => setSuccess(""), 4000)
  }

  const showError = (message: string) => {
    setError(message)
    setSuccess("")
    setTimeout(() => setError(""), 4000)
  }

  const handleAddMateriel = () => {
    if (!newMateriel.nom || !newMateriel.description || !newMateriel.categorie) {
      showError("Veuillez remplir tous les champs obligatoires")
      return
    }

    const materiel: Materiel = {
      id: Date.now(),
      ...newMateriel,
      disponible: newMateriel.total,
    }

    const updatedMateriels = [...materiels, materiel]
    saveMateriels(updatedMateriels)

    setNewMateriel({ nom: "", description: "", categorie: "", total: 1, prix: 0, etat: "excellent" })
    setIsAddMaterielOpen(false)
    showSuccess("✨ Matériel ajouté avec succès!")
  }

  const handleEditMateriel = () => {
    if (!editingMateriel) return

    if (!editingMateriel.nom || !editingMateriel.description || !editingMateriel.categorie) {
      showError("Veuillez remplir tous les champs obligatoires")
      return
    }

    const updatedMateriels = materiels.map((m) => (m.id === editingMateriel.id ? editingMateriel : m))

    saveMateriels(updatedMateriels)
    setEditingMateriel(null)
    setIsEditMaterielOpen(false)
    showSuccess("🔧 Matériel modifié avec succès!")
  }

  const handleDeleteMateriel = (id: number) => {
    const materielToDelete = materiels.find((m) => m.id === id)
    if (materielToDelete && materielToDelete.disponible < materielToDelete.total) {
      showError("⚠️ Impossible de supprimer : du matériel est actuellement emprunté")
      return
    }

    const updatedMateriels = materiels.filter((m) => m.id !== id)
    saveMateriels(updatedMateriels)
    showSuccess("🗑️ Matériel supprimé avec succès!")
  }

  const handleAddEtudiant = () => {
    if (!newEtudiant.nom || !newEtudiant.prenom || !newEtudiant.email || !newEtudiant.numeroEtudiant) {
      showError("Veuillez remplir tous les champs obligatoires")
      return
    }

    // Vérifier si l'email ou le numéro étudiant existe déjà
    const emailExists = etudiants.some((e) => e.email === newEtudiant.email)
    const numeroExists = etudiants.some((e) => e.numeroEtudiant === newEtudiant.numeroEtudiant)

    if (emailExists) {
      showError("⚠️ Cet email est déjà utilisé")
      return
    }

    if (numeroExists) {
      showError("⚠️ Ce numéro étudiant est déjà utilisé")
      return
    }

    const etudiant: Etudiant = {
      id: Date.now(),
      ...newEtudiant,
      statut: "actif",
      empruntsActifs: 0,
    }

    const updatedEtudiants = [...etudiants, etudiant]
    saveEtudiants(updatedEtudiants)

    setNewEtudiant({ nom: "", prenom: "", email: "", numeroEtudiant: "", role: "etudiant" })
    setIsAddEtudiantOpen(false)
    showSuccess("👤 Étudiant ajouté avec succès!")
  }

  const handleDeleteEtudiant = (id: number) => {
    const etudiantToDelete = etudiants.find((e) => e.id === id)
    if (etudiantToDelete && etudiantToDelete.empruntsActifs > 0) {
      showError("⚠️ Impossible de supprimer : l'étudiant a des emprunts en cours")
      return
    }

    const updatedEtudiants = etudiants.filter((e) => e.id !== id)
    saveEtudiants(updatedEtudiants)
    showSuccess("🗑️ Étudiant supprimé avec succès!")
  }

  const openEditMateriel = (materiel: Materiel) => {
    setEditingMateriel({ ...materiel })
    setIsEditMaterielOpen(true)
  }

  const filteredMateriels = materiels.filter(
    (m) =>
      m.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const filteredEtudiants = etudiants.filter(
    (e) =>
      e.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navigation />

      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-96 h-96 bg-orange-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-red-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl">
              <Crown className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-orange-200">
                Administration
              </h1>
              <p className="text-white/70 text-lg">Gestion complète des matériels et utilisateurs</p>
            </div>
          </div>
        </div>

        {/* Notifications */}
        {success && (
          <Alert className="mb-6 bg-green-500/20 border-green-500/50 text-green-100 rounded-2xl">
            <Sparkles className="h-4 w-4" />
            <AlertDescription className="font-medium">{success}</AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert className="mb-6 bg-red-500/20 border-red-500/50 text-red-100 rounded-2xl">
            <AlertDescription className="font-medium">{error}</AlertDescription>
          </Alert>
        )}

        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          <Button
            onClick={() => setActiveTab("materiels")}
            className={`px-6 py-3 rounded-2xl font-semibold transition-all duration-300 ${
              activeTab === "materiels"
                ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg transform scale-105"
                : "bg-white/10 text-white/70 hover:bg-white/20"
            }`}
          >
            <Package className="w-5 h-5 mr-2" />
            Matériels ({materiels.length})
          </Button>
          <Button
            onClick={() => setActiveTab("etudiants")}
            className={`px-6 py-3 rounded-2xl font-semibold transition-all duration-300 ${
              activeTab === "etudiants"
                ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg transform scale-105"
                : "bg-white/10 text-white/70 hover:bg-white/20"
            }`}
          >
            <Users className="w-5 h-5 mr-2" />
            Étudiants ({etudiants.length})
          </Button>
        </div>

        {/* Search and Add */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
            <Input
              placeholder={`Rechercher ${activeTab === "materiels" ? "un matériel" : "un étudiant"}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 bg-white/10 border-white/20 text-white placeholder:text-white/40 rounded-2xl h-12"
            />
          </div>
          <Dialog
            open={activeTab === "materiels" ? isAddMaterielOpen : isAddEtudiantOpen}
            onOpenChange={activeTab === "materiels" ? setIsAddMaterielOpen : setIsAddEtudiantOpen}
          >
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0 px-6 h-12 rounded-2xl font-semibold shadow-lg hover:shadow-green-500/25 transform hover:scale-105 transition-all duration-300">
                <Plus className="w-5 h-5 mr-2" />
                Ajouter {activeTab === "materiels" ? "Matériel" : "Étudiant"}
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-900 border-white/20 text-white max-w-2xl rounded-3xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-purple-200">
                  Ajouter {activeTab === "materiels" ? "un matériel" : "un étudiant"}
                </DialogTitle>
                <DialogDescription className="text-white/70">Remplissez les informations ci-dessous</DialogDescription>
              </DialogHeader>

              {activeTab === "materiels" ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-white/80">Nom du matériel *</Label>
                      <Input
                        value={newMateriel.nom}
                        onChange={(e) => setNewMateriel({ ...newMateriel, nom: e.target.value })}
                        className="bg-white/10 border-white/20 text-white rounded-xl"
                        placeholder="Ex: Arduino Uno R3"
                      />
                    </div>
                    <div>
                      <Label className="text-white/80">Catégorie *</Label>
                      <Select
                        value={newMateriel.categorie}
                        onValueChange={(value) => setNewMateriel({ ...newMateriel, categorie: value })}
                      >
                        <SelectTrigger className="bg-white/10 border-white/20 text-white rounded-xl">
                          <SelectValue placeholder="Sélectionner..." />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-white/20">
                          <SelectItem value="microcontroleur">Microcontrôleur</SelectItem>
                          <SelectItem value="capteur">Capteur</SelectItem>
                          <SelectItem value="audiovisuel">Audiovisuel</SelectItem>
                          <SelectItem value="mesure">Instrument de mesure</SelectItem>
                          <SelectItem value="composant">Composant</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label className="text-white/80">Description *</Label>
                    <Textarea
                      value={newMateriel.description}
                      onChange={(e) => setNewMateriel({ ...newMateriel, description: e.target.value })}
                      className="bg-white/10 border-white/20 text-white rounded-xl"
                      placeholder="Description détaillée du matériel..."
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label className="text-white/80">Quantité totale *</Label>
                      <Input
                        type="number"
                        min="1"
                        value={newMateriel.total}
                        onChange={(e) =>
                          setNewMateriel({ ...newMateriel, total: Number.parseInt(e.target.value) || 1 })
                        }
                        className="bg-white/10 border-white/20 text-white rounded-xl"
                      />
                    </div>
                    <div>
                      <Label className="text-white/80">Prix (Ar)</Label>
                      <Input
                        type="number"
                        min="0"
                        value={newMateriel.prix}
                        onChange={(e) => setNewMateriel({ ...newMateriel, prix: Number.parseInt(e.target.value) || 0 })}
                        className="bg-white/10 border-white/20 text-white rounded-xl"
                      />
                    </div>
                    <div>
                      <Label className="text-white/80">État</Label>
                      <Select
                        value={newMateriel.etat}
                        onValueChange={(value) => setNewMateriel({ ...newMateriel, etat: value })}
                      >
                        <SelectTrigger className="bg-white/10 border-white/20 text-white rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-white/20">
                          <SelectItem value="excellent">Excellent</SelectItem>
                          <SelectItem value="bon">Bon</SelectItem>
                          <SelectItem value="moyen">Moyen</SelectItem>
                          <SelectItem value="mauvais">Mauvais</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button
                    onClick={handleAddMateriel}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl h-12 font-semibold"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Ajouter le matériel
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-white/80">Nom *</Label>
                      <Input
                        value={newEtudiant.nom}
                        onChange={(e) => setNewEtudiant({ ...newEtudiant, nom: e.target.value })}
                        className="bg-white/10 border-white/20 text-white rounded-xl"
                      />
                    </div>
                    <div>
                      <Label className="text-white/80">Prénom *</Label>
                      <Input
                        value={newEtudiant.prenom}
                        onChange={(e) => setNewEtudiant({ ...newEtudiant, prenom: e.target.value })}
                        className="bg-white/10 border-white/20 text-white rounded-xl"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-white/80">Email *</Label>
                    <Input
                      type="email"
                      value={newEtudiant.email}
                      onChange={(e) => setNewEtudiant({ ...newEtudiant, email: e.target.value })}
                      className="bg-white/10 border-white/20 text-white rounded-xl"
                      placeholder="email@mit-misa.edu"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-white/80">Numéro étudiant *</Label>
                      <Input
                        value={newEtudiant.numeroEtudiant}
                        onChange={(e) => setNewEtudiant({ ...newEtudiant, numeroEtudiant: e.target.value })}
                        className="bg-white/10 border-white/20 text-white rounded-xl"
                        placeholder="Ex: 2024001"
                      />
                    </div>
                    <div>
                      <Label className="text-white/80">Rôle</Label>
                      <Select
                        value={newEtudiant.role}
                        onValueChange={(value) => setNewEtudiant({ ...newEtudiant, role: value })}
                      >
                        <SelectTrigger className="bg-white/10 border-white/20 text-white rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-white/20">
                          <SelectItem value="etudiant">Étudiant</SelectItem>
                          <SelectItem value="professeur">Professeur</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button
                    onClick={handleAddEtudiant}
                    className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 rounded-xl h-12 font-semibold"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Ajouter l'étudiant
                  </Button>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>

        {/* Edit Material Dialog */}
        <Dialog open={isEditMaterielOpen} onOpenChange={setIsEditMaterielOpen}>
          <DialogContent className="bg-slate-900 border-white/20 text-white max-w-2xl rounded-3xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-orange-200">
                Modifier le matériel
              </DialogTitle>
              <DialogDescription className="text-white/70">Modifiez les informations du matériel</DialogDescription>
            </DialogHeader>

            {editingMateriel && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white/80">Nom du matériel *</Label>
                    <Input
                      value={editingMateriel.nom}
                      onChange={(e) => setEditingMateriel({ ...editingMateriel, nom: e.target.value })}
                      className="bg-white/10 border-white/20 text-white rounded-xl"
                    />
                  </div>
                  <div>
                    <Label className="text-white/80">Catégorie *</Label>
                    <Select
                      value={editingMateriel.categorie}
                      onValueChange={(value) => setEditingMateriel({ ...editingMateriel, categorie: value })}
                    >
                      <SelectTrigger className="bg-white/10 border-white/20 text-white rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-white/20">
                        <SelectItem value="microcontroleur">Microcontrôleur</SelectItem>
                        <SelectItem value="capteur">Capteur</SelectItem>
                        <SelectItem value="audiovisuel">Audiovisuel</SelectItem>
                        <SelectItem value="mesure">Instrument de mesure</SelectItem>
                        <SelectItem value="composant">Composant</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label className="text-white/80">Description *</Label>
                  <Textarea
                    value={editingMateriel.description}
                    onChange={(e) => setEditingMateriel({ ...editingMateriel, description: e.target.value })}
                    className="bg-white/10 border-white/20 text-white rounded-xl"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <Label className="text-white/80">Quantité totale *</Label>
                    <Input
                      type="number"
                      min="1"
                      value={editingMateriel.total}
                      onChange={(e) => {
                        const newTotal = Number.parseInt(e.target.value) || 1
                        const currentEmprunts = editingMateriel.total - editingMateriel.disponible
                        setEditingMateriel({
                          ...editingMateriel,
                          total: newTotal,
                          disponible: Math.max(0, newTotal - currentEmprunts),
                        })
                      }}
                      className="bg-white/10 border-white/20 text-white rounded-xl"
                    />
                  </div>
                  <div>
                    <Label className="text-white/80">Disponible</Label>
                    <Input
                      type="number"
                      min="0"
                      max={editingMateriel.total}
                      value={editingMateriel.disponible}
                      onChange={(e) =>
                        setEditingMateriel({ ...editingMateriel, disponible: Number.parseInt(e.target.value) || 0 })
                      }
                      className="bg-white/10 border-white/20 text-white rounded-xl"
                    />
                  </div>
                  <div>
                    <Label className="text-white/80">Prix (Ar)</Label>
                    <Input
                      type="number"
                      min="0"
                      value={editingMateriel.prix}
                      onChange={(e) =>
                        setEditingMateriel({ ...editingMateriel, prix: Number.parseInt(e.target.value) || 0 })
                      }
                      className="bg-white/10 border-white/20 text-white rounded-xl"
                    />
                  </div>
                  <div>
                    <Label className="text-white/80">État</Label>
                    <Select
                      value={editingMateriel.etat}
                      onValueChange={(value) => setEditingMateriel({ ...editingMateriel, etat: value })}
                    >
                      <SelectTrigger className="bg-white/10 border-white/20 text-white rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-white/20">
                        <SelectItem value="excellent">Excellent</SelectItem>
                        <SelectItem value="bon">Bon</SelectItem>
                        <SelectItem value="moyen">Moyen</SelectItem>
                        <SelectItem value="mauvais">Mauvais</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Button
                    onClick={handleEditMateriel}
                    className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 rounded-xl h-12 font-semibold"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Sauvegarder
                  </Button>
                  <Button
                    onClick={() => setIsEditMaterielOpen(false)}
                    variant="outline"
                    className="border-white/30 text-white hover:bg-white/10 rounded-xl h-12"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Annuler
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Content */}
        {activeTab === "materiels" ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMateriels.map((materiel) => (
              <Card
                key={materiel.id}
                className="group bg-white/10 backdrop-blur-md border border-white/20 hover:border-white/40 rounded-2xl overflow-hidden transition-all duration-300 hover:transform hover:scale-105"
              >
                <CardHeader className="bg-gradient-to-r from-purple-500/20 to-pink-500/20">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-white text-lg font-bold mb-1">{materiel.nom}</CardTitle>
                      <CardDescription className="text-white/70 text-sm">{materiel.description}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-blue-400 hover:bg-blue-500/20 rounded-xl"
                        onClick={() => openEditMateriel(materiel)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="ghost" className="text-red-400 hover:bg-red-500/20 rounded-xl">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-slate-900 border-white/20 text-white rounded-2xl">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-xl font-bold">Confirmer la suppression</AlertDialogTitle>
                            <AlertDialogDescription className="text-white/70">
                              Êtes-vous sûr de vouloir supprimer le matériel "{materiel.nom}" ? Cette action est
                              irréversible.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-xl">
                              Annuler
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteMateriel(materiel.id)}
                              className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 rounded-xl"
                            >
                              Supprimer
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-white/60">Disponible:</span>
                      <span className="text-white font-semibold">
                        {materiel.disponible}/{materiel.total}
                      </span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(materiel.disponible / materiel.total) * 100}%` }}
                      />
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Prix:</span>
                      <span className="text-green-400 font-semibold">{materiel.prix?.toLocaleString()} Ar</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/60">État:</span>
                      <Badge
                        className={`${
                          materiel.etat === "excellent"
                            ? "bg-green-500"
                            : materiel.etat === "bon"
                              ? "bg-blue-500"
                              : materiel.etat === "moyen"
                                ? "bg-yellow-500"
                                : "bg-red-500"
                        } text-white border-0`}
                      >
                        {materiel.etat}
                      </Badge>
                    </div>
                    <Badge variant="secondary" className="capitalize bg-white/20 text-white border-0">
                      {materiel.categorie}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredEtudiants.map((etudiant) => (
              <Card
                key={etudiant.id}
                className="group bg-white/10 backdrop-blur-md border border-white/20 hover:border-white/40 rounded-2xl overflow-hidden transition-all duration-300 hover:transform hover:scale-[1.02]"
              >
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center text-white font-bold text-lg">
                          {etudiant.prenom[0]}
                          {etudiant.nom[0]}
                        </div>
                        <div>
                          <h3 className="text-white text-xl font-bold">
                            {etudiant.prenom} {etudiant.nom}
                          </h3>
                          <p className="text-white/60">{etudiant.email}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-white/60">Numéro:</span>
                          <p className="text-white font-medium">{etudiant.numeroEtudiant}</p>
                        </div>
                        <div>
                          <span className="text-white/60">Rôle:</span>
                          <Badge className="ml-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
                            {etudiant.role}
                          </Badge>
                        </div>
                        <div>
                          <span className="text-white/60">Statut:</span>
                          <Badge
                            className={`ml-2 ${etudiant.statut === "actif" ? "bg-green-500" : "bg-red-500"} text-white border-0`}
                          >
                            {etudiant.statut}
                          </Badge>
                        </div>
                        <div>
                          <span className="text-white/60">Emprunts actifs:</span>
                          <p className="text-cyan-400 font-bold">{etudiant.empruntsActifs}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" className="text-blue-400 hover:bg-blue-500/20 rounded-xl">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="ghost" className="text-red-400 hover:bg-red-500/20 rounded-xl">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-slate-900 border-white/20 text-white rounded-2xl">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-xl font-bold">Confirmer la suppression</AlertDialogTitle>
                            <AlertDialogDescription className="text-white/70">
                              Êtes-vous sûr de vouloir supprimer l'étudiant "{etudiant.prenom} {etudiant.nom}" ? Cette
                              action est irréversible.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-xl">
                              Annuler
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteEtudiant(etudiant.id)}
                              className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 rounded-xl"
                            >
                              Supprimer
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {((activeTab === "materiels" && filteredMateriels.length === 0) ||
          (activeTab === "etudiants" && filteredEtudiants.length === 0)) && (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-3xl flex items-center justify-center">
              {activeTab === "materiels" ? (
                <Package className="w-12 h-12 text-purple-400" />
              ) : (
                <Users className="w-12 h-12 text-blue-400" />
              )}
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">
              Aucun {activeTab === "materiels" ? "matériel" : "étudiant"} trouvé
            </h3>
            <p className="text-white/60 mb-6">
              {searchTerm
                ? "Essayez de modifier vos critères de recherche"
                : `Commencez par ajouter ${activeTab === "materiels" ? "du matériel" : "des étudiants"}`}
            </p>
            {searchTerm && (
              <Button
                onClick={() => setSearchTerm("")}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 px-6 py-3 rounded-2xl"
              >
                Effacer la recherche
              </Button>
            )}
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
