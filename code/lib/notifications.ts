import { db, type Notification } from "./database"
import { logger } from "./logger"
import nodemailer from "nodemailer"

export interface NotificationData {
  user_id: number
  titre: string
  message: string
  type: "info" | "success" | "warning" | "error"
  categorie: "emprunt" | "retour" | "demande" | "systeme" | "rappel"
  action_url?: string
  metadata?: any
  expire_at?: Date
}

export interface EmailData {
  to: string
  subject: string
  html: string
  text?: string
}

class NotificationService {
  private emailTransporter: nodemailer.Transporter | null = null

  constructor() {
    this.initializeEmailTransporter()
  }

  private async initializeEmailTransporter() {
    try {
      this.emailTransporter = nodemailer.createTransporter({
        host: process.env.SMTP_HOST || "localhost",
        port: Number.parseInt(process.env.SMTP_PORT || "587"),
        secure: process.env.SMTP_SECURE === "true",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      })

      // Vérifier la connexion
      if (this.emailTransporter) {
        await this.emailTransporter.verify()
        logger.info("Service email initialisé avec succès")
      }
    } catch (error) {
      logger.error("Erreur lors de l'initialisation du service email:", error)
    }
  }

  // Créer une notification
  async createNotification(data: NotificationData): Promise<number> {
    try {
      const notificationId = await db.insert("notifications", {
        user_id: data.user_id,
        titre: data.titre,
        message: data.message,
        type: data.type,
        categorie: data.categorie,
        action_url: data.action_url || null,
        metadata: data.metadata ? JSON.stringify(data.metadata) : null,
        expire_at: data.expire_at || null,
        lu: false,
      })

      logger.info("Notification créée:", { notificationId, userId: data.user_id })
      return notificationId
    } catch (error) {
      logger.error("Erreur lors de la création de la notification:", error)
      throw error
    }
  }

  // Créer une notification pour plusieurs utilisateurs
  async createBulkNotification(userIds: number[], data: Omit<NotificationData, "user_id">): Promise<void> {
    try {
      const notifications = userIds.map((userId) => ({
        user_id: userId,
        titre: data.titre,
        message: data.message,
        type: data.type,
        categorie: data.categorie,
        action_url: data.action_url || null,
        metadata: data.metadata ? JSON.stringify(data.metadata) : null,
        expire_at: data.expire_at || null,
        lu: false,
      }))

      // Insérer toutes les notifications en une seule requête
      const values = notifications
        .map(
          (n) =>
            `(${n.user_id}, '${n.titre}', '${n.message}', '${n.type}', '${n.categorie}', ${n.action_url ? `'${n.action_url}'` : "NULL"}, ${n.metadata ? `'${n.metadata}'` : "NULL"}, ${n.expire_at ? `'${n.expire_at.toISOString()}'` : "NULL"}, FALSE)`,
        )
        .join(", ")

      const sql = `
        INSERT INTO notifications (user_id, titre, message, type, categorie, action_url, metadata, expire_at, lu)
        VALUES ${values}
      `

      await db.query(sql)

      logger.info("Notifications en masse créées:", { count: userIds.length })
    } catch (error) {
      logger.error("Erreur lors de la création des notifications en masse:", error)
      throw error
    }
  }

  // Obtenir les notifications d'un utilisateur
  async getUserNotifications(userId: number, limit = 50, offset = 0): Promise<Notification[]> {
    try {
      const sql = `
        SELECT * FROM notifications 
        WHERE user_id = ? AND (expire_at IS NULL OR expire_at > NOW())
        ORDER BY created_at DESC 
        LIMIT ? OFFSET ?
      `
      return await db.query<Notification>(sql, [userId, limit, offset])
    } catch (error) {
      logger.error("Erreur lors de la récupération des notifications:", error)
      throw error
    }
  }

  // Marquer une notification comme lue
  async markAsRead(notificationId: number, userId: number): Promise<boolean> {
    try {
      const affectedRows = await db.update("notifications", { lu: true }, { id: notificationId, user_id: userId })
      return affectedRows > 0
    } catch (error) {
      logger.error("Erreur lors du marquage de la notification:", error)
      return false
    }
  }

  // Marquer toutes les notifications comme lues
  async markAllAsRead(userId: number): Promise<number> {
    try {
      return await db.update("notifications", { lu: true }, { user_id: userId, lu: false })
    } catch (error) {
      logger.error("Erreur lors du marquage de toutes les notifications:", error)
      return 0
    }
  }

  // Compter les notifications non lues
  async getUnreadCount(userId: number): Promise<number> {
    try {
      const result = await db.queryOne<{ count: number }>(
        "SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND lu = FALSE AND (expire_at IS NULL OR expire_at > NOW())",
        [userId],
      )
      return result?.count || 0
    } catch (error) {
      logger.error("Erreur lors du comptage des notifications non lues:", error)
      return 0
    }
  }

  // Supprimer les anciennes notifications
  async cleanupOldNotifications(): Promise<number> {
    try {
      const sql = `
        DELETE FROM notifications 
        WHERE (created_at < DATE_SUB(NOW(), INTERVAL 30 DAY) AND lu = TRUE)
        OR (expire_at IS NOT NULL AND expire_at < NOW())
      `
      const result = await db.query(sql)
      logger.info("Nettoyage des anciennes notifications terminé")
      return (result as any).affectedRows || 0
    } catch (error) {
      logger.error("Erreur lors du nettoyage des notifications:", error)
      return 0
    }
  }

  // Envoyer un email
  async sendEmail(data: EmailData): Promise<boolean> {
    if (!this.emailTransporter) {
      logger.warn("Service email non disponible")
      return false
    }

    try {
      const info = await this.emailTransporter.sendMail({
        from: process.env.SMTP_FROM || "noreply@mit-misa.edu",
        to: data.to,
        subject: data.subject,
        html: data.html,
        text: data.text || data.html.replace(/<[^>]*>/g, ""),
      })

      logger.info("Email envoyé:", { to: data.to, messageId: info.messageId })
      return true
    } catch (error) {
      logger.error("Erreur lors de l'envoi de l'email:", error)
      return false
    }
  }

  // Templates d'email
  private getEmailTemplate(type: string, data: any): { subject: string; html: string } {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

    switch (type) {
      case "demande_approuvee":
        return {
          subject: "Demande d'emprunt approuvée",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #10B981;">Demande approuvée ✅</h2>
              <p>Bonjour ${data.nom},</p>
              <p>Votre demande d'emprunt pour <strong>${data.materiel}</strong> a été approuvée.</p>
              <p><strong>Détails:</strong></p>
              <ul>
                <li>Matériel: ${data.materiel}</li>
                <li>Quantité: ${data.quantite}</li>
                <li>Période: du ${data.dateDebut} au ${data.dateFin}</li>
              </ul>
              <p>Vous pouvez récupérer le matériel auprès du responsable.</p>
              <a href="${baseUrl}/emprunts" style="background: #10B981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Voir mes emprunts</a>
            </div>
          `,
        }

      case "demande_refusee":
        return {
          subject: "Demande d'emprunt refusée",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #EF4444;">Demande refusée ❌</h2>
              <p>Bonjour ${data.nom},</p>
              <p>Votre demande d'emprunt pour <strong>${data.materiel}</strong> a été refusée.</p>
              ${data.commentaire ? `<p><strong>Motif:</strong> ${data.commentaire}</p>` : ""}
              <p>Vous pouvez faire une nouvelle demande ou contacter le responsable pour plus d'informations.</p>
              <a href="${baseUrl}/demande" style="background: #3B82F6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Nouvelle demande</a>
            </div>
          `,
        }

      case "rappel_retour":
        return {
          subject: "Rappel de retour de matériel",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #F59E0B;">Rappel de retour ⏰</h2>
              <p>Bonjour ${data.nom},</p>
              <p>Le retour du matériel <strong>${data.materiel}</strong> est prévu pour ${data.dateRetour}.</p>
              <p>Merci de le retourner dans les délais pour éviter des frais de retard.</p>
              <a href="${baseUrl}/emprunts" style="background: #F59E0B; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Voir mes emprunts</a>
            </div>
          `,
        }

      case "retour_retard":
        return {
          subject: "Retour en retard - Frais applicables",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #EF4444;">Retour en retard ⚠️</h2>
              <p>Bonjour ${data.nom},</p>
              <p>Le retour du matériel <strong>${data.materiel}</strong> est en retard depuis le ${data.dateRetour}.</p>
              <p>Des frais de retard de <strong>${data.frais} Ar</strong> s'appliquent.</p>
              <p>Merci de retourner le matériel au plus vite.</p>
              <a href="${baseUrl}/emprunts" style="background: #EF4444; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Voir mes emprunts</a>
            </div>
          `,
        }

      default:
        return {
          subject: "Notification MIT/MISA",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>Notification</h2>
              <p>${data.message}</p>
            </div>
          `,
        }
    }
  }

  // Envoyer une notification avec email optionnel
  async sendNotificationWithEmail(
    data: NotificationData,
    emailData?: { email: string; nom: string; templateType?: string; templateData?: any },
  ): Promise<number> {
    // Créer la notification
    const notificationId = await this.createNotification(data)

    // Envoyer l'email si demandé et si le service est activé
    if (emailData && process.env.EMAIL_NOTIFICATIONS === "true") {
      const template = this.getEmailTemplate(emailData.templateType || "default", {
        ...emailData.templateData,
        nom: emailData.nom,
      })

      await this.sendEmail({
        to: emailData.email,
        subject: template.subject,
        html: template.html,
      })
    }

    return notificationId
  }

  // Notifications prédéfinies pour les événements courants
  async notifyDemandeApprouvee(userId: number, materiel: string, details: any): Promise<void> {
    await this.createNotification({
      user_id: userId,
      titre: "Demande approuvée",
      message: `Votre demande d'emprunt pour ${materiel} a été approuvée`,
      type: "success",
      categorie: "demande",
      action_url: "/emprunts",
      metadata: details,
    })
  }

  async notifyDemandeRefusee(userId: number, materiel: string, motif?: string): Promise<void> {
    await this.createNotification({
      user_id: userId,
      titre: "Demande refusée",
      message: `Votre demande d'emprunt pour ${materiel} a été refusée${motif ? `: ${motif}` : ""}`,
      type: "error",
      categorie: "demande",
      action_url: "/demande",
    })
  }

  async notifyRappelRetour(userId: number, materiel: string, dateRetour: string): Promise<void> {
    await this.createNotification({
      user_id: userId,
      titre: "Rappel de retour",
      message: `N'oubliez pas de retourner ${materiel} avant le ${dateRetour}`,
      type: "warning",
      categorie: "rappel",
      action_url: "/emprunts",
      expire_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Expire dans 7 jours
    })
  }

  async notifyRetourRetard(userId: number, materiel: string, joursRetard: number): Promise<void> {
    await this.createNotification({
      user_id: userId,
      titre: "Retour en retard",
      message: `Le retour de ${materiel} est en retard de ${joursRetard} jour(s). Des frais s'appliquent.`,
      type: "error",
      categorie: "retour",
      action_url: "/emprunts",
    })
  }

  async notifyNouvelleDemandeResponsables(materiel: string, demandeur: string): Promise<void> {
    // Récupérer tous les responsables
    const responsables = await db.query<{ id: number }>(
      'SELECT id FROM users WHERE role = "responsable" AND statut = "actif"',
    )

    if (responsables.length > 0) {
      await this.createBulkNotification(
        responsables.map((r) => r.id),
        {
          titre: "Nouvelle demande d'emprunt",
          message: `${demandeur} a fait une demande d'emprunt pour ${materiel}`,
          type: "info",
          categorie: "demande",
          action_url: "/admin/demandes",
        },
      )
    }
  }
}

export const notificationService = new NotificationService()
