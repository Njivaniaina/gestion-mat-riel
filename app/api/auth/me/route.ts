import { type NextRequest, NextResponse } from "next/server"
import { AuthService } from "@/lib/auth"
import { logApiError, logAccess } from "@/lib/logger"

export async function GET(request: NextRequest) {
  const startTime = Date.now()
  const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"

  try {
    const authHeader = request.headers.get("authorization")
    const cookieToken = request.cookies.get("auth-token")?.value

    const token = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : cookieToken

    if (!token) {
      logAccess("/api/auth/me", "GET", 401, Date.now() - startTime, undefined, ip)
      return NextResponse.json({ success: false, message: "Token manquant" }, { status: 401 })
    }

    const user = AuthService.verifyToken(token)

    if (!user) {
      logAccess("/api/auth/me", "GET", 401, Date.now() - startTime, undefined, ip)
      return NextResponse.json({ success: false, message: "Token invalide" }, { status: 401 })
    }

    // Vérifier que l'utilisateur existe toujours
    const currentUser = await AuthService.getUserById(user.id)

    if (!currentUser) {
      logAccess("/api/auth/me", "GET", 401, Date.now() - startTime, user.id, ip)
      return NextResponse.json({ success: false, message: "Utilisateur non trouvé" }, { status: 401 })
    }

    logAccess("/api/auth/me", "GET", 200, Date.now() - startTime, user.id, ip)
    return NextResponse.json({ success: true, user: currentUser })
  } catch (error) {
    logApiError("/api/auth/me", "GET", error, undefined, ip)
    return NextResponse.json({ success: false, message: "Erreur interne du serveur" }, { status: 500 })
  }
}
