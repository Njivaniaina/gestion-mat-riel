import { type NextRequest, NextResponse } from "next/server"
import { AuthService } from "@/lib/auth"
import { notificationService } from "@/lib/notifications"
import { logApiError, logAccess } from "@/lib/logger"
import { db } from "@/lib/database"

// GET /api/notifications - Récupérer les notifications de l'utilisateur
export async function GET(request: NextRequest) {
  const startTime = Date.now()
  const ip = request.headers.get("x-forwarded-for") || "unknown"

  try {
    await db.connect()

    // Authentification
    const authHeader = request.headers.get("authorization")
    const cookieToken = request.cookies.get("auth-token")?.value
    const token = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : cookieToken

    const user = token ? AuthService.verifyToken(token) : null

    if (!user) {
      logAccess("/api/notifications", "GET", 401, Date.now() - startTime, undefined, ip)
      return NextResponse.json({ success: false, message: "Non autorisé" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    // Récupérer les notifications
    const notifications = await notificationService.getUserNotifications(user.id, limit, offset)

    // Récupérer le nombre de notifications non lues
    const unreadCount = await notificationService.getUnreadCount(user.id)

    logAccess("/api/notifications", "GET", 200, Date.now() - startTime, user.id, ip)

    return NextResponse.json({
      success: true,
      data: notifications,
      unreadCount,
    })
  } catch (error) {
    logApiError("/api/notifications", "GET", error, undefined, ip)
    return NextResponse.json({ success: false, message: "Erreur interne du serveur" }, { status: 500 })
  }
}
