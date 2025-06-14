import { type NextRequest, NextResponse } from "next/server"
import { AuthService } from "@/lib/auth"
import { validate, userValidation } from "@/lib/validation"
import { logApiError, logAccess } from "@/lib/logger"
import { db } from "@/lib/database"

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"

  try {
    await db.connect()

    const body = await request.json()

    // Validation des données
    const { isValid, errors, data } = validate(userValidation.register, body)

    if (!isValid) {
      logAccess("/api/auth/register", "POST", 400, Date.now() - startTime, undefined, ip)
      return NextResponse.json({ success: false, message: "Données invalides", errors }, { status: 400 })
    }

    // Tentative d'inscription
    const result = await AuthService.register(data, ip)

    if (!result.success) {
      logAccess("/api/auth/register", "POST", 400, Date.now() - startTime, undefined, ip)
      return NextResponse.json(result, { status: 400 })
    }

    // Inscription réussie
    logAccess("/api/auth/register", "POST", 201, Date.now() - startTime, result.user?.id, ip)

    const response = NextResponse.json(result, { status: 201 })

    // Définir le cookie HTTP-only pour le token
    response.cookies.set("auth-token", result.token!, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60, // 7 jours
    })

    return response
  } catch (error) {
    logApiError("/api/auth/register", "POST", error, undefined, ip)
    return NextResponse.json({ success: false, message: "Erreur interne du serveur" }, { status: 500 })
  }
}
