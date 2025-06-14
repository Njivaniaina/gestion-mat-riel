import { type NextRequest, NextResponse } from "next/server"
import { AuthService } from "@/lib/auth"
import { validate, userValidation } from "@/lib/validation"
import { logApiError, logAccess } from "@/lib/logger"
import { db } from "@/lib/database"

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"

  try {
    // Initialiser la connexion à la base de données
    await db.connect()

    const body = await request.json()

    // Validation des données
    const { isValid, errors, data } = validate(userValidation.login, body)

    if (!isValid) {
      logAccess("/api/auth/login", "POST", 400, Date.now() - startTime, undefined, ip)
      return NextResponse.json({ success: false, message: "Données invalides", errors }, { status: 400 })
    }

    // Tentative de connexion
    const result = await AuthService.login(data.email, data.password, ip)

    if (!result.success) {
      logAccess("/api/auth/login", "POST", 401, Date.now() - startTime, undefined, ip)
      return NextResponse.json(result, { status: 401 })
    }

    // Connexion réussie
    logAccess("/api/auth/login", "POST", 200, Date.now() - startTime, result.user?.id, ip)

    const response = NextResponse.json(result)

    // Définir le cookie HTTP-only pour le token
    response.cookies.set("auth-token", result.token!, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60, // 7 jours
    })

    return response
  } catch (error) {
    logApiError("/api/auth/login", "POST", error, undefined, ip)
    return NextResponse.json({ success: false, message: "Erreur interne du serveur" }, { status: 500 })
  }
}
