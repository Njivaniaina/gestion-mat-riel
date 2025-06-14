import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { db, type User } from "./database"
import { logger } from "./logger"

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key"
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d"
const BCRYPT_ROUNDS = 12

export interface AuthUser {
  id: number
  email: string
  nom: string
  prenom: string
  role: string
  numero_etudiant?: string
}

export interface LoginResult {
  success: boolean
  user?: AuthUser
  token?: string
  message?: string
}

export interface RegisterData {
  email: string
  password: string
  nom: string
  prenom: string
  role: "etudiant" | "professeur" | "responsable"
  numero_etudiant?: string
  telephone?: string
}

export class AuthService {
  // Hacher un mot de passe
  static async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, BCRYPT_ROUNDS)
  }

  // Vérifier un mot de passe
  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash)
  }

  // Générer un token JWT
  static generateToken(user: AuthUser): string {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN },
    )
  }

  // Vérifier un token JWT
  static verifyToken(token: string): AuthUser | null {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any
      return {
        id: decoded.id,
        email: decoded.email,
        nom: decoded.nom,
        prenom: decoded.prenom,
        role: decoded.role,
        numero_etudiant: decoded.numero_etudiant,
      }
    } catch (error) {
      logger.warn("Token JWT invalide:", error)
      return null
    }
  }

  // Connexion utilisateur
  static async login(email: string, password: string, ip?: string): Promise<LoginResult> {
    try {
      // Rechercher l'utilisateur
      const user = await db.queryOne<User>('SELECT * FROM users WHERE email = ? AND statut = "actif"', [email])

      if (!user) {
        logger.warn("Tentative de connexion avec email inexistant:", { email, ip })
        return {
          success: false,
          message: "Email ou mot de passe incorrect",
        }
      }

      // Vérifier le mot de passe
      const isValidPassword = await this.verifyPassword(password, user.password_hash)

      if (!isValidPassword) {
        logger.warn("Tentative de connexion avec mot de passe incorrect:", { email, ip })
        return {
          success: false,
          message: "Email ou mot de passe incorrect",
        }
      }

      // Mettre à jour la dernière connexion
      await db.update("users", { last_login: new Date() }, { id: user.id })

      // Créer l'objet utilisateur pour le token
      const authUser: AuthUser = {
        id: user.id,
        email: user.email,
        nom: user.nom,
        prenom: user.prenom,
        role: user.role,
        numero_etudiant: user.numero_etudiant || undefined,
      }

      // Générer le token
      const token = this.generateToken(authUser)

      logger.info("Connexion réussie:", { userId: user.id, email, ip })

      return {
        success: true,
        user: authUser,
        token,
      }
    } catch (error) {
      logger.error("Erreur lors de la connexion:", error)
      return {
        success: false,
        message: "Erreur interne du serveur",
      }
    }
  }

  // Inscription utilisateur
  static async register(data: RegisterData, ip?: string): Promise<LoginResult> {
    try {
      // Vérifier si l'email existe déjà
      const existingUser = await db.queryOne("SELECT id FROM users WHERE email = ?", [data.email])

      if (existingUser) {
        return {
          success: false,
          message: "Cet email est déjà utilisé",
        }
      }

      // Vérifier le numéro étudiant s'il est fourni
      if (data.numero_etudiant) {
        const existingNumero = await db.queryOne("SELECT id FROM users WHERE numero_etudiant = ?", [
          data.numero_etudiant,
        ])

        if (existingNumero) {
          return {
            success: false,
            message: "Ce numéro étudiant est déjà utilisé",
          }
        }
      }

      // Hacher le mot de passe
      const passwordHash = await this.hashPassword(data.password)

      // Insérer le nouvel utilisateur
      const userId = await db.insert("users", {
        email: data.email,
        password_hash: passwordHash,
        nom: data.nom,
        prenom: data.prenom,
        role: data.role,
        numero_etudiant: data.numero_etudiant || null,
        telephone: data.telephone || null,
        statut: "actif",
        email_verified: false,
      })

      // Créer l'objet utilisateur pour le token
      const authUser: AuthUser = {
        id: userId,
        email: data.email,
        nom: data.nom,
        prenom: data.prenom,
        role: data.role,
        numero_etudiant: data.numero_etudiant,
      }

      // Générer le token
      const token = this.generateToken(authUser)

      logger.info("Inscription réussie:", { userId, email: data.email, ip })

      return {
        success: true,
        user: authUser,
        token,
      }
    } catch (error) {
      logger.error("Erreur lors de l'inscription:", error)
      return {
        success: false,
        message: "Erreur interne du serveur",
      }
    }
  }

  // Obtenir un utilisateur par ID
  static async getUserById(id: number): Promise<AuthUser | null> {
    try {
      const user = await db.queryOne<User>('SELECT * FROM users WHERE id = ? AND statut = "actif"', [id])

      if (!user) {
        return null
      }

      return {
        id: user.id,
        email: user.email,
        nom: user.nom,
        prenom: user.prenom,
        role: user.role,
        numero_etudiant: user.numero_etudiant || undefined,
      }
    } catch (error) {
      logger.error("Erreur lors de la récupération de l'utilisateur:", error)
      return null
    }
  }

  // Changer le mot de passe
  static async changePassword(userId: number, oldPassword: string, newPassword: string): Promise<boolean> {
    try {
      const user = await db.queryOne<User>("SELECT password_hash FROM users WHERE id = ?", [userId])

      if (!user) {
        return false
      }

      // Vérifier l'ancien mot de passe
      const isValidOldPassword = await this.verifyPassword(oldPassword, user.password_hash)

      if (!isValidOldPassword) {
        return false
      }

      // Hacher le nouveau mot de passe
      const newPasswordHash = await this.hashPassword(newPassword)

      // Mettre à jour le mot de passe
      await db.update("users", { password_hash: newPasswordHash }, { id: userId })

      logger.info("Mot de passe changé:", { userId })
      return true
    } catch (error) {
      logger.error("Erreur lors du changement de mot de passe:", error)
      return false
    }
  }

  // Réinitialiser le mot de passe (pour les administrateurs)
  static async resetPassword(userId: number, newPassword: string): Promise<boolean> {
    try {
      const newPasswordHash = await this.hashPassword(newPassword)

      await db.update("users", { password_hash: newPasswordHash }, { id: userId })

      logger.info("Mot de passe réinitialisé:", { userId })
      return true
    } catch (error) {
      logger.error("Erreur lors de la réinitialisation du mot de passe:", error)
      return false
    }
  }

  // Vérifier les permissions
  static hasPermission(userRole: string, requiredRole: string): boolean {
    const roleHierarchy = {
      etudiant: 1,
      professeur: 2,
      responsable: 3,
    }

    const userLevel = roleHierarchy[userRole as keyof typeof roleHierarchy] || 0
    const requiredLevel = roleHierarchy[requiredRole as keyof typeof roleHierarchy] || 0

    return userLevel >= requiredLevel
  }

  // Middleware d'authentification pour les API routes
  static async authenticateRequest(authHeader?: string): Promise<AuthUser | null> {
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null
    }

    const token = authHeader.substring(7)
    const decoded = this.verifyToken(token)

    if (!decoded) {
      return null
    }

    // Vérifier que l'utilisateur existe toujours et est actif
    const user = await this.getUserById(decoded.id)
    return user
  }
}
