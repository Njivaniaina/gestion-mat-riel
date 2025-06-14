import mysql from "mysql2/promise"
import { logger } from "./logger"

interface DatabaseConfig {
  host: string
  port: number
  user: string
  password: string
  database: string
  connectionLimit: number
  acquireTimeout: number
  timeout: number
}

class Database {
  private pool: mysql.Pool | null = null
  private config: DatabaseConfig

  constructor() {
    this.config = {
      host: process.env.DB_HOST || "localhost",
      port: Number.parseInt(process.env.DB_PORT || "3306"),
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "emprunt_materiel",
      connectionLimit: Number.parseInt(process.env.DB_CONNECTION_LIMIT || "10"),
      acquireTimeout: Number.parseInt(process.env.DB_ACQUIRE_TIMEOUT || "60000"),
      timeout: Number.parseInt(process.env.DB_TIMEOUT || "60000"),
    }
  }

  async connect(): Promise<void> {
    try {
      this.pool = mysql.createPool({
        ...this.config,
        waitForConnections: true,
        queueLimit: 0,
        reconnect: true,
        charset: "utf8mb4",
        timezone: "+00:00",
        dateStrings: false,
        supportBigNumbers: true,
        bigNumberStrings: false,
      })

      // Test de connexion
      const connection = await this.pool.getConnection()
      await connection.ping()
      connection.release()

      logger.info("Connexion à la base de données établie")
    } catch (error) {
      logger.error("Erreur de connexion à la base de données:", error)
      throw error
    }
  }

  async disconnect(): Promise<void> {
    if (this.pool) {
      await this.pool.end()
      this.pool = null
      logger.info("Connexion à la base de données fermée")
    }
  }

  async query<T = any>(sql: string, params?: any[]): Promise<T[]> {
    if (!this.pool) {
      throw new Error("Base de données non connectée")
    }

    try {
      const [rows] = await this.pool.execute(sql, params)
      return rows as T[]
    } catch (error) {
      logger.error("Erreur lors de l'exécution de la requête:", { sql, params, error })
      throw error
    }
  }

  async queryOne<T = any>(sql: string, params?: any[]): Promise<T | null> {
    const results = await this.query<T>(sql, params)
    return results.length > 0 ? results[0] : null
  }

  async transaction<T>(callback: (connection: mysql.PoolConnection) => Promise<T>): Promise<T> {
    if (!this.pool) {
      throw new Error("Base de données non connectée")
    }

    const connection = await this.pool.getConnection()

    try {
      await connection.beginTransaction()
      const result = await callback(connection)
      await connection.commit()
      return result
    } catch (error) {
      await connection.rollback()
      throw error
    } finally {
      connection.release()
    }
  }

  async exists(table: string, conditions: Record<string, any>): Promise<boolean> {
    const whereClause = Object.keys(conditions)
      .map((key) => `${key} = ?`)
      .join(" AND ")
    const values = Object.values(conditions)

    const sql = `SELECT 1 FROM ${table} WHERE ${whereClause} LIMIT 1`
    const result = await this.query(sql, values)

    return result.length > 0
  }

  async count(table: string, conditions?: Record<string, any>): Promise<number> {
    let sql = `SELECT COUNT(*) as count FROM ${table}`
    let values: any[] = []

    if (conditions && Object.keys(conditions).length > 0) {
      const whereClause = Object.keys(conditions)
        .map((key) => `${key} = ?`)
        .join(" AND ")
      values = Object.values(conditions)
      sql += ` WHERE ${whereClause}`
    }

    const result = await this.queryOne<{ count: number }>(sql, values)
    return result?.count || 0
  }

  async insert(table: string, data: Record<string, any>): Promise<number> {
    const columns = Object.keys(data).join(", ")
    const placeholders = Object.keys(data)
      .map(() => "?")
      .join(", ")
    const values = Object.values(data)

    const sql = `INSERT INTO ${table} (${columns}) VALUES (${placeholders})`

    if (!this.pool) {
      throw new Error("Base de données non connectée")
    }

    try {
      const [result] = (await this.pool.execute(sql, values)) as any
      return result.insertId
    } catch (error) {
      logger.error("Erreur lors de l'insertion:", { table, data, error })
      throw error
    }
  }

  async update(table: string, data: Record<string, any>, conditions: Record<string, any>): Promise<number> {
    const setClause = Object.keys(data)
      .map((key) => `${key} = ?`)
      .join(", ")
    const whereClause = Object.keys(conditions)
      .map((key) => `${key} = ?`)
      .join(" AND ")
    const values = [...Object.values(data), ...Object.values(conditions)]

    const sql = `UPDATE ${table} SET ${setClause} WHERE ${whereClause}`

    if (!this.pool) {
      throw new Error("Base de données non connectée")
    }

    try {
      const [result] = (await this.pool.execute(sql, values)) as any
      return result.affectedRows
    } catch (error) {
      logger.error("Erreur lors de la mise à jour:", { table, data, conditions, error })
      throw error
    }
  }

  async delete(table: string, conditions: Record<string, any>): Promise<number> {
    const whereClause = Object.keys(conditions)
      .map((key) => `${key} = ?`)
      .join(" AND ")
    const values = Object.values(conditions)

    const sql = `DELETE FROM ${table} WHERE ${whereClause}`

    if (!this.pool) {
      throw new Error("Base de données non connectée")
    }

    try {
      const [result] = (await this.pool.execute(sql, values)) as any
      return result.affectedRows
    } catch (error) {
      logger.error("Erreur lors de la suppression:", { table, conditions, error })
      throw error
    }
  }

  // Méthodes utilitaires pour les statistiques
  async getDashboardStats(): Promise<any> {
    const sql = "SELECT * FROM dashboard_stats"
    return await this.queryOne(sql)
  }

  async getUserStats(userId?: number): Promise<any[]> {
    let sql = "SELECT * FROM user_stats"
    const params: any[] = []

    if (userId) {
      sql += " WHERE id = ?"
      params.push(userId)
    }

    sql += " ORDER BY total_emprunts DESC"
    return await this.query(sql, params)
  }

  async getMaterielStats(): Promise<any[]> {
    const sql = "SELECT * FROM materiel_stats ORDER BY total_emprunts DESC"
    return await this.query(sql)
  }

  // Méthode pour exécuter les procédures stockées
  async callProcedure(procedureName: string, params: any[] = []): Promise<any> {
    const placeholders = params.map(() => "?").join(", ")
    const sql = `CALL ${procedureName}(${placeholders})`
    return await this.query(sql, params)
  }

  // Méthode pour la recherche full-text
  async search(table: string, columns: string[], searchTerm: string, limit = 50): Promise<any[]> {
    const searchColumns = columns.join(", ")
    const whereClause = columns.map((col) => `${col} LIKE ?`).join(" OR ")
    const searchValue = `%${searchTerm}%`
    const params = columns.map(() => searchValue)

    const sql = `
      SELECT ${searchColumns}, 
             MATCH(${columns.join(", ")}) AGAINST(? IN NATURAL LANGUAGE MODE) as relevance
      FROM ${table} 
      WHERE ${whereClause}
      ORDER BY relevance DESC, id DESC
      LIMIT ?
    `

    params.push(searchTerm, limit)
    return await this.query(sql, params)
  }
}

// Instance singleton
export const db = new Database()

// Types pour TypeScript
export interface User {
  id: number
  email: string
  password_hash: string
  nom: string
  prenom: string
  role: "etudiant" | "professeur" | "responsable"
  numero_etudiant?: string
  telephone?: string
  adresse?: string
  statut: "actif" | "inactif" | "suspendu"
  email_verified: boolean
  last_login?: Date
  created_at: Date
  updated_at: Date
}

export interface Materiel {
  id: number
  nom: string
  description: string
  numero_serie?: string
  marque?: string
  modele?: string
  categorie_id: number
  quantite_totale: number
  quantite_disponible: number
  prix_unitaire?: number
  etat: "excellent" | "bon" | "moyen" | "mauvais" | "hors_service"
  localisation?: string
  date_acquisition?: Date
  garantie_fin?: Date
  image_url?: string
  qr_code?: string
  notes?: string
  created_at: Date
  updated_at: Date
}

export interface Emprunt {
  id: number
  demande_id: number
  user_id: number
  materiel_id: number
  quantite: number
  date_emprunt: Date
  date_retour_prevue: Date
  date_retour_effective?: Date
  statut: "en_cours" | "termine" | "en_retard" | "perdu" | "endommage"
  etat_retour?: "excellent" | "bon" | "moyen" | "mauvais" | "endommage"
  commentaire_retour?: string
  frais_retard: number
  frais_degats: number
  responsable_emprunt: number
  responsable_retour?: number
  created_at: Date
  updated_at: Date
}

export interface Notification {
  id: number
  user_id: number
  titre: string
  message: string
  type: "info" | "success" | "warning" | "error"
  categorie: "emprunt" | "retour" | "demande" | "systeme" | "rappel"
  lu: boolean
  action_url?: string
  metadata?: any
  expire_at?: Date
  created_at: Date
}
