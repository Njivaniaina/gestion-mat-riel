// Simulation d'une API backend pour la gestion des données

export interface User {
  id: string
  email: string
  name: string
  role: "etudiant" | "professeur" | "responsable"
  numeroEtudiant?: string
  createdAt: string
}

export interface Materiel {
  id: string
  nom: string
  description: string
  categorie: string
  disponible: number
  total: number
  prix?: number
  etat: string
  createdAt: string
  updatedAt: string
}

export interface Emprunt {
  id: string
  userId: string
  materielId: string
  quantite: number
  dateDebut: string
  dateFin: string
  dateRetourEffective?: string
  statut: "en_attente" | "approuve" | "en_cours" | "termine" | "retarde" | "annule"
  motif: string
  projet: string
  urgence: "faible" | "normale" | "elevee" | "urgente"
  responsableId?: string
  frais?: number
  createdAt: string
  updatedAt: string
}

// Simulation de base de données en localStorage
class LocalStorageDB {
  private getKey(table: string): string {
    return `emprunt_materiel_${table}`
  }

  private get<T>(table: string): T[] {
    const data = localStorage.getItem(this.getKey(table))
    return data ? JSON.parse(data) : []
  }

  private set<T>(table: string, data: T[]): void {
    localStorage.setItem(this.getKey(table), JSON.stringify(data))
  }

  // Users
  getUsers(): User[] {
    return this.get<User>("users")
  }

  createUser(user: Omit<User, "id" | "createdAt">): User {
    const users = this.getUsers()
    const newUser: User = {
      ...user,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    }
    users.push(newUser)
    this.set("users", users)
    return newUser
  }

  getUserByEmail(email: string): User | null {
    const users = this.getUsers()
    return users.find((user) => user.email === email) || null
  }

  // Matériels
  getMateriels(): Materiel[] {
    return this.get<Materiel>("materiels")
  }

  createMateriel(materiel: Omit<Materiel, "id" | "createdAt" | "updatedAt">): Materiel {
    const materiels = this.getMateriels()
    const newMateriel: Materiel = {
      ...materiel,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    materiels.push(newMateriel)
    this.set("materiels", materiels)
    return newMateriel
  }

  updateMateriel(id: string, updates: Partial<Materiel>): Materiel | null {
    const materiels = this.getMateriels()
    const index = materiels.findIndex((m) => m.id === id)
    if (index === -1) return null

    materiels[index] = {
      ...materiels[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    }
    this.set("materiels", materiels)
    return materiels[index]
  }

  deleteMateriel(id: string): boolean {
    const materiels = this.getMateriels()
    const filteredMateriels = materiels.filter((m) => m.id !== id)
    if (filteredMateriels.length === materiels.length) return false
    this.set("materiels", filteredMateriels)
    return true
  }

  // Emprunts
  getEmprunts(): Emprunt[] {
    return this.get<Emprunt>("emprunts")
  }

  createEmprunt(emprunt: Omit<Emprunt, "id" | "createdAt" | "updatedAt">): Emprunt {
    const emprunts = this.getEmprunts()
    const newEmprunt: Emprunt = {
      ...emprunt,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    emprunts.push(newEmprunt)
    this.set("emprunts", emprunts)
    return newEmprunt
  }

  updateEmprunt(id: string, updates: Partial<Emprunt>): Emprunt | null {
    const emprunts = this.getEmprunts()
    const index = emprunts.findIndex((e) => e.id === id)
    if (index === -1) return null

    emprunts[index] = {
      ...emprunts[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    }
    this.set("emprunts", emprunts)
    return emprunts[index]
  }

  getEmpruntsByUser(userId: string): Emprunt[] {
    const emprunts = this.getEmprunts()
    return emprunts.filter((e) => e.userId === userId)
  }
}

// Instance globale de la base de données
export const db = new LocalStorageDB()

// Services API
export const authService = {
  async login(email: string, password: string, role: string): Promise<User | null> {
    // Simulation d'une vérification d'authentification
    await new Promise((resolve) => setTimeout(resolve, 1000))

    let user = db.getUserByEmail(email)

    if (!user) {
      // Créer un nouvel utilisateur si il n'existe pas
      user = db.createUser({
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
      })
    }

    return user
  },

  async register(userData: Omit<User, "id" | "createdAt">): Promise<User> {
    await new Promise((resolve) => setTimeout(resolve, 1000))
    return db.createUser(userData)
  },
}

export const materielService = {
  async getAll(): Promise<Materiel[]> {
    await new Promise((resolve) => setTimeout(resolve, 500))
    return db.getMateriels()
  },

  async create(materiel: Omit<Materiel, "id" | "createdAt" | "updatedAt">): Promise<Materiel> {
    await new Promise((resolve) => setTimeout(resolve, 500))
    return db.createMateriel(materiel)
  },

  async update(id: string, updates: Partial<Materiel>): Promise<Materiel | null> {
    await new Promise((resolve) => setTimeout(resolve, 500))
    return db.updateMateriel(id, updates)
  },

  async delete(id: string): Promise<boolean> {
    await new Promise((resolve) => setTimeout(resolve, 500))
    return db.deleteMateriel(id)
  },
}

export const empruntService = {
  async getAll(): Promise<Emprunt[]> {
    await new Promise((resolve) => setTimeout(resolve, 500))
    return db.getEmprunts()
  },

  async getByUser(userId: string): Promise<Emprunt[]> {
    await new Promise((resolve) => setTimeout(resolve, 500))
    return db.getEmpruntsByUser(userId)
  },

  async create(emprunt: Omit<Emprunt, "id" | "createdAt" | "updatedAt">): Promise<Emprunt> {
    await new Promise((resolve) => setTimeout(resolve, 500))
    return db.createEmprunt(emprunt)
  },

  async update(id: string, updates: Partial<Emprunt>): Promise<Emprunt | null> {
    await new Promise((resolve) => setTimeout(resolve, 500))
    return db.updateEmprunt(id, updates)
  },
}

// Initialisation des données par défaut
export const initializeDefaultData = () => {
  const materiels = db.getMateriels()
  if (materiels.length === 0) {
    // Ajouter des matériels par défaut
    const defaultMateriels = [
      {
        nom: "Arduino Uno R3",
        description: "Microcontrôleur pour projets électroniques",
        categorie: "microcontroleur",
        disponible: 15,
        total: 20,
        prix: 25000,
        etat: "excellent",
      },
      {
        nom: "Raspberry Pi 4",
        description: "Mini-ordinateur pour projets IoT",
        categorie: "microcontroleur",
        disponible: 8,
        total: 12,
        prix: 85000,
        etat: "bon",
      },
      {
        nom: "Capteur DHT22",
        description: "Capteur de température et humidité",
        categorie: "capteur",
        disponible: 25,
        total: 30,
        prix: 15000,
        etat: "excellent",
      },
      {
        nom: "Projecteur Epson",
        description: "Projecteur haute définition pour présentations",
        categorie: "audiovisuel",
        disponible: 3,
        total: 5,
        prix: 450000,
        etat: "bon",
      },
      {
        nom: "Multimètre",
        description: "Instrument de mesure électrique",
        categorie: "mesure",
        disponible: 10,
        total: 15,
        prix: 35000,
        etat: "excellent",
      },
    ]

    defaultMateriels.forEach((materiel) => {
      db.createMateriel(materiel)
    })
  }
}
