import winston from "winston"
import path from "path"

// Configuration du logger
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: "YYYY-MM-DD HH:mm:ss",
  }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.prettyPrint(),
)

// Créer le répertoire de logs s'il n'existe pas
const logDir = path.join(process.cwd(), "logs")

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: logFormat,
  defaultMeta: { service: "emprunt-materiel" },
  transports: [
    // Logs d'erreur dans un fichier séparé
    new winston.transports.File({
      filename: path.join(logDir, "error.log"),
      level: "error",
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),

    // Tous les logs dans un fichier général
    new winston.transports.File({
      filename: path.join(logDir, "combined.log"),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
})

// En développement, afficher aussi dans la console
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
    }),
  )
}

// Fonction utilitaire pour logger les activités utilisateur
export const logUserActivity = (userId: number, action: string, details: any = {}, ip?: string) => {
  logger.info("User Activity", {
    userId,
    action,
    details,
    ip,
    timestamp: new Date().toISOString(),
  })
}

// Fonction pour logger les erreurs API
export const logApiError = (endpoint: string, method: string, error: any, userId?: number, ip?: string) => {
  logger.error("API Error", {
    endpoint,
    method,
    error: error.message || error,
    stack: error.stack,
    userId,
    ip,
    timestamp: new Date().toISOString(),
  })
}

// Fonction pour logger les accès
export const logAccess = (
  endpoint: string,
  method: string,
  statusCode: number,
  responseTime: number,
  userId?: number,
  ip?: string,
) => {
  logger.info("API Access", {
    endpoint,
    method,
    statusCode,
    responseTime,
    userId,
    ip,
    timestamp: new Date().toISOString(),
  })
}
