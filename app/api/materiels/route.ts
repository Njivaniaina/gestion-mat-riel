import { type NextRequest, NextResponse } from "next/server"
import { AuthService } from "@/lib/auth"
import { validate, materielValidation, queryValidation } from "@/lib/validation"
import { logApiError, logAccess } from "@/lib/logger"
import { db } from "@/lib/database"

// GET /api/materiels - Récupérer la liste des matériels
export async function GET(request: NextRequest) {
  const startTime = Date.now()
  const ip = request.headers.get("x-forwarded-for") || "unknown"

  try {
    await db.connect()

    const { searchParams } = new URL(request.url)
    const queryData = {
      page: Number.parseInt(searchParams.get("page") || "1"),
      limit: Number.parseInt(searchParams.get("limit") || "20"),
      sort: searchParams.get("sort") || "created_at",
      order: searchParams.get("order") || "desc",
      q: searchParams.get("q") || "",
      category: searchParams.get("category") ? Number.parseInt(searchParams.get("category")!) : undefined,
    }

    // Validation des paramètres
    const { isValid, data } = validate(queryValidation.pagination, queryData)
    if (!isValid) {
      return NextResponse.json({ success: false, message: "Paramètres invalides" }, { status: 400 })
    }

    // Construction de la requête
    let sql = `
      SELECT m.*, c.nom as categorie_nom, c.couleur as categorie_couleur
      FROM materiels m
      LEFT JOIN categories c ON m.categorie_id = c.id
      WHERE 1=1
    `
    const params: any[] = []

    // Recherche textuelle
    if (data.q) {
      sql += ` AND (m.nom LIKE ? OR m.description LIKE ? OR m.marque LIKE ?)`
      const searchTerm = `%${data.q}%`
      params.push(searchTerm, searchTerm, searchTerm)
    }

    // Filtrage par catégorie
    if (data.category) {
      sql += ` AND m.categorie_id = ?`
      params.push(data.category)
    }

    // Tri
    const allowedSortFields = ["nom", "created_at", "quantite_disponible", "prix_unitaire"]
    const sortField = allowedSortFields.includes(data.sort) ? data.sort : "created_at"
    sql += ` ORDER BY m.${sortField} ${data.order.toUpperCase()}`

    // Pagination
    const offset = (data.page - 1) * data.limit
    sql += ` LIMIT ? OFFSET ?`
    params.push(data.limit, offset)

    // Exécution de la requête
    const materiels = await db.query(sql, params)

    // Compter le total pour la pagination
    let countSql = `SELECT COUNT(*) as total FROM materiels m WHERE 1=1`
    const countParams: any[] = []

    if (data.q) {
      countSql += ` AND (m.nom LIKE ? OR m.description LIKE ? OR m.marque LIKE ?)`
      const searchTerm = `%${data.q}%`
      countParams.push(searchTerm, searchTerm, searchTerm)
    }

    if (data.category) {
      countSql += ` AND m.categorie_id = ?`
      countParams.push(data.category)
    }

    const countResult = await db.queryOne<{ total: number }>(countSql, countParams)
    const total = countResult?.total || 0

    logAccess("/api/materiels", "GET", 200, Date.now() - startTime, undefined, ip)

    return NextResponse.json({
      success: true,
      data: materiels,
      pagination: {
        page: data.page,
        limit: data.limit,
        total,
        pages: Math.ceil(total / data.limit),
      },
    })
  } catch (error) {
    logApiError("/api/materiels", "GET", error, undefined, ip)
    return NextResponse.json({ success: false, message: "Erreur interne du serveur" }, { status: 500 })
  }
}

// POST /api/materiels - Créer un nouveau matériel
export async function POST(request: NextRequest) {
  const startTime = Date.now()
  const ip = request.headers.get("x-forwarded-for") || "unknown"

  try {
    await db.connect()

    // Authentification
    const authHeader = request.headers.get("authorization")
    const user = await AuthService.authenticateRequest(authHeader)

    if (!user) {
      logAccess("/api/materiels", "POST", 401, Date.now() - startTime, undefined, ip)
      return NextResponse.json({ success: false, message: "Non autorisé" }, { status: 401 })
    }

    // Vérifier les permissions (seuls les responsables peuvent créer des matériels)
    if (!AuthService.hasPermission(user.role, "responsable")) {
      logAccess("/api/materiels", "POST", 403, Date.now() - startTime, user.id, ip)
      return NextResponse.json({ success: false, message: "Permissions insuffisantes" }, { status: 403 })
    }

    const body = await request.json()

    // Validation des données
    const { isValid, errors, data } = validate(materielValidation.create, body)

    if (!isValid) {
      logAccess("/api/materiels", "POST", 400, Date.now() - startTime, user.id, ip)
      return NextResponse.json({ success: false, message: "Données invalides", errors }, { status: 400 })
    }

    // Vérifier que la catégorie existe
    const categoryExists = await db.exists("categories", { id: data.categorie_id })
    if (!categoryExists) {
      return NextResponse.json({ success: false, message: "Catégorie inexistante" }, { status: 400 })
    }

    // Vérifier l'unicité du numéro de série s'il est fourni
    if (data.numero_serie) {
      const serieExists = await db.exists("materiels", { numero_serie: data.numero_serie })
      if (serieExists) {
        return NextResponse.json({ success: false, message: "Ce numéro de série existe déjà" }, { status: 400 })
      }
    }

    // Insérer le matériel
    const materielData = {
      ...data,
      quantite_disponible: data.quantite_totale,
      created_at: new Date(),
      updated_at: new Date(),
    }

    const materielId = await db.insert("materiels", materielData)

    // Logger l'activité
    await db.insert("activity_logs", {
      user_id: user.id,
      action: "CREATE",
      table_name: "materiels",
      record_id: materielId,
      new_values: JSON.stringify(materielData),
      ip_address: ip,
    })

    logAccess("/api/materiels", "POST", 201, Date.now() - startTime, user.id, ip)

    return NextResponse.json(
      {
        success: true,
        message: "Matériel créé avec succès",
        data: { id: materielId, ...materielData },
      },
      { status: 201 },
    )
  } catch (error) {
    logApiError("/api/materiels", "POST", error, undefined, ip)
    return NextResponse.json({ success: false, message: "Erreur interne du serveur" }, { status: 500 })
  }
}
