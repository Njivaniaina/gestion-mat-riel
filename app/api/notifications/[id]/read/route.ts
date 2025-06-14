import { type NextRequest, NextResponse } from "next/server"
import { AuthService } from "@/lib/auth"
import { notificationService } from "@/lib/notifications"
import { logApiError, logAccess } from "@/lib/logger"
import { db } from "@/lib/database"

// PUT /api/notifications/[id]/read - Marquer une notification comme lue
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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
      logAccess(`/api/notifications/${params.id}/read`, "PUT", 401, Date.now() - startTime, undefined, ip)
      return NextResponse.json({ success: false, message: "Non autorisé" }, { status: 401 })
    }

    const notificationId = Number.parseInt(params.id)

    if (isNaN(notificationId)) {
      return NextResponse.json({ success: false, message: "ID invalide" }, { status: 400 })
    }

    // Marquer comme lue
    const success = await notificationService.markAsRead(notificationId, user.id)

    if (!success) {
      return NextResponse.json({ success: false, message: "Notification non trouvée" }, { status: 404 })
    }

    logAccess(`/api/notifications/${notificationId}/read`, "PUT", 200, Date.now() - startTime, user.id, ip)

    return NextResponse.json({
      success: true,
      message: "Notification marquée comme lue",
    })
  } catch (error) {
    logApiError(`/api/notifications/${params.id}/read`, "PUT", error, undefined, ip)
    return NextResponse.json({ success: false, message: "Erreur interne du serveur" }, { status: 500 })
  }
}
