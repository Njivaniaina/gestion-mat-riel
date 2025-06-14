import { type NextRequest, NextResponse } from "next/server"
import { AuthService } from "@/lib/auth"
import { validate, materielValidation } from "@/lib/validation"
import { logApiError, logAccess } from "@/lib/logger"
import { db } from "@/lib/database"

// GET /api/materiels/[id] - Récupérer un matériel par ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const startTime = Date.now()
  const ip = request.headers.get("x-forwarded-for") || "unknown"

  try {
    await db.connect()

    const materielId = Number.parseInt(params.id)

    if (isNaN(materielId)) {
      return NextResponse.json({ success: false, message: "ID invalide" }, { status: 400 })
    }

    const sql = `
      SELECT m.*, c.nom as categorie_nom, c.couleur as categorie_couleur, c.icone as categorie_icone
      FROM materiels m
      LEFT JOIN categories c ON m.categorie_id = c.id
      WHERE m.id = ?
    `

    const materiel = await db.queryOne(sql, [materielId])

    if (!materiel) {
      logAccess(`/api/materiels/${materielId}`, "GET", 404, Date.now() - startTime, undefined, ip)
      return NextResponse.json({ success: false, message: "Matériel non trouvé" }, { status: 404 })
    }

    logAccess(`/api/materiels/${materielId}`, "GET", 200, Date.now() - startTime, undefined, ip)

    return NextResponse.json({
      success: true,
      data: materiel,
    })
  } catch (error) {
    logApiError(`/api/materiels/${params.id}`, "GET", error, undefined, ip)
    return NextResponse.json({ success: false, message: "Erreur interne du serveur" }, { status: 500 })
  }
}

// PUT /api/materiels/[id] - Mettre à jour un matériel
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const startTime = Date.now()
  const ip = request.headers.get("x-forwarded-for") || "unknown"

  try {
    await db.connect()

    // Authentification
    const authHeader = request.headers.get("authorization")
    const user = await AuthService.authenticateRequest(authHeader)

    if (!user) {
      logAccess(`/api/materiels/${params.id}`, "PUT", 401, Date.now() - startTime, undefined, ip)
      return NextResponse.json({ success: false, message: "Non autorisé" }, { status: 401 })
    }

    // Vérifier les permissions
    if (!AuthService.hasPermission(user.role, "responsable")) {
      logAccess(`/api/materiels/${params.id}`, "PUT", 403, Date.now() - startTime, user.id, ip)
      return NextResponse.json({ success: false, message: "Permissions insuffisantes" }, { status: 403 })
    }

    const materielId = Number.parseInt(params.id)

    if (isNaN(materielId)) {
      return NextResponse.json({ success: false, message: "ID invalide" }, { status: 400 })
    }

    // Vérifier que le matériel existe
    const existingMateriel = await db.queryOne("SELECT * FROM materiels WHERE id = ?", [materielId])

    if (!existingMateriel) {
      return NextResponse.json({ success: false, message: "Matériel non trouvé" }, { status: 404 })
    }

    const body = await request.json()

    // Validation des données
    const { isValid, errors, data } = validate(materielValidation.update, body)

    if (!isValid) {
      logAccess(`/api/materiels/${materielId}`, "PUT", 400, Date.now() - startTime, user.id, ip)
      return NextResponse.json({ success: false, message: "Données invalides", errors }, { status: 400 })
    }

    // Vérifications supplémentaires
    if (data.categorie_id) {
      const categoryExists = await db.exists("categories", { id: data.categorie_id })
      if (!categoryExists) {
        return NextResponse.json({ success: false, message: "Catégorie inexistante" }, { status: 400 })
      }
    }

    if (data.numero_serie && data.numero_serie !== existingMateriel.numero_serie) {
      const serieExists = await db.exists("materiels", { numero_serie: data.numero_serie })
      if (serieExists) {
        return NextResponse.json({ success: false, message: "Ce numéro de série existe déjà" }, { status: 400 })
      }
    }

    // Vérifier la cohérence des quantités
    if (data.quantite_disponible !== undefined && data.quantite_totale !== undefined) {
      if (data.quantite_disponible > data.quantite_totale) {
        return NextResponse.json(
          { success: false, message: "La quantité disponible ne peut pas être supérieure à la quantité totale" },
          { status: 400 },
        )
      }
    }

    // Mettre à jour le matériel
    const updateData = {
      ...data,
      updated_at: new Date(),
    }

    await db.update("materiels", updateData, { id: materielId })

    // Logger l'activité
    await db.insert("activity_logs", {
      user_id: user.id,
      action: "UPDATE",
      table_name: "materiels",
      record_id: materielId,
      old_values: JSON.stringify(existingMateriel),
      new_values: JSON.stringify(updateData),
      ip_address: ip,
    })

    logAccess(`/api/materiels/${materielId}`, "PUT", 200, Date.now() - startTime, user.id, ip)

    return NextResponse.json({
      success: true,
      message: "Matériel mis à jour avec succès",
    })
  } catch (error) {
    logApiError(`/api/materiels/${params.id}`, "PUT", error, undefined, ip)
    return NextResponse.json({ success: false, message: "Erreur interne du serveur" }, { status: 500 })
  }
}

// DELETE /api/materiels/[id] - Supprimer un matériel
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const startTime = Date.now()
  const ip = request.headers.get("x-forwarded-for") || "unknown"

  try {
    await db.connect()

    // Authentification
    const authHeader = request.headers.get("authorization")
    const user = await AuthService.authenticateRequest(authHeader)

    if (!user) {
      logAccess(`/api/materiels/${params.id}`, "DELETE", 401, Date.now() - startTime, undefined, ip)
      return NextResponse.json({ success: false, message: "Non autorisé" }, { status: 401 })
    }

    // Vérifier les permissions
    if (!AuthService.hasPermission(user.role, "responsable")) {
      logAccess(`/api/materiels/${params.id}`, "DELETE", 403, Date.now() - startTime, user.id, ip)
      return NextResponse.json({ success: false, message: "Permissions insuffisantes" }, { status: 403 })
    }

    const materielId = Number.parseInt(params.id)

    if (isNaN(materielId)) {
      return NextResponse.json({ success: false, message: "ID invalide" }, { status: 400 })
    }

    // Vérifier que le matériel existe
    const existingMateriel = await db.queryOne("SELECT * FROM materiels WHERE id = ?", [materielId])

    if (!existingMateriel) {
      return NextResponse.json({ success: false, message: "Matériel non trouvé" }, { status: 404 })
    }

    // Vérifier qu'il n'y a pas d'emprunts en cours
    const activeLoans = await db.count("emprunts", {
      materiel_id: materielId,
      statut: "en_cours",
    })

    if (activeLoans > 0) {
      return NextResponse.json(
        { success: false, message: "Impossible de supprimer : des emprunts sont en cours" },
        { status: 400 },
      )
    }

    // Supprimer le matériel
    await db.delete("materiels", { id: materielId })

    // Logger l'activité
    await db.insert("activity_logs", {
      user_id: user.id,
      action: "DELETE",
      table_name: "materiels",
      record_id: materielId,
      old_values: JSON.stringify(existingMateriel),
      ip_address: ip,
    })

    logAccess(`/api/materiels/${materielId}`, "DELETE", 200, Date.now() - startTime, user.id, ip)

    return NextResponse.json({
      success: true,
      message: "Matériel supprimé avec succès",
    })
  } catch (error) {
    logApiError(`/api/materiels/${params.id}`, "DELETE", error, undefined, ip)
    return NextResponse.json({ success: false, message: "Erreur interne du serveur" }, { status: 500 })
  }
}
