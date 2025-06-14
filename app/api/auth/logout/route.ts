import { type NextRequest, NextResponse } from "next/server"
import { logAccess } from "@/lib/logger"

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"

  try {
    logAccess("/api/auth/logout", "POST", 200, Date.now() - startTime, undefined, ip)

    const response = NextResponse.json({ success: true, message: "Déconnexion réussie" })

    // Supprimer le cookie d'authentification
    response.cookies.set("auth-token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 0,
    })

    return response
  } catch (error) {
    return NextResponse.json({ success: false, message: "Erreur lors de la déconnexion" }, { status: 500 })
  }
}
