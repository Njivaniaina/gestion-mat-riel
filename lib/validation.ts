import Joi from "joi"

// Schémas de validation pour les utilisateurs
export const userValidation = {
  register: Joi.object({
    email: Joi.string().email().required().messages({
      "string.email": "Format d'email invalide",
      "any.required": "L'email est requis",
    }),
    password: Joi.string()
      .min(8)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .required()
      .messages({
        "string.min": "Le mot de passe doit contenir au moins 8 caractères",
        "string.pattern.base": "Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre",
        "any.required": "Le mot de passe est requis",
      }),
    nom: Joi.string().min(2).max(100).required().messages({
      "string.min": "Le nom doit contenir au moins 2 caractères",
      "string.max": "Le nom ne peut pas dépasser 100 caractères",
      "any.required": "Le nom est requis",
    }),
    prenom: Joi.string().min(2).max(100).required().messages({
      "string.min": "Le prénom doit contenir au moins 2 caractères",
      "string.max": "Le prénom ne peut pas dépasser 100 caractères",
      "any.required": "Le prénom est requis",
    }),
    role: Joi.string().valid("etudiant", "professeur", "responsable").required().messages({
      "any.only": "Le rôle doit être étudiant, professeur ou responsable",
      "any.required": "Le rôle est requis",
    }),
    numero_etudiant: Joi.string()
      .pattern(/^\d{7}$/)
      .when("role", {
        is: "etudiant",
        then: Joi.required(),
        otherwise: Joi.optional(),
      })
      .messages({
        "string.pattern.base": "Le numéro étudiant doit contenir exactement 7 chiffres",
        "any.required": "Le numéro étudiant est requis pour les étudiants",
      }),
    telephone: Joi.string()
      .pattern(/^(\+261|0)[0-9]{9}$/)
      .optional()
      .messages({
        "string.pattern.base": "Format de téléphone invalide (ex: +261123456789 ou 0123456789)",
      }),
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),

  update: Joi.object({
    nom: Joi.string().min(2).max(100).optional(),
    prenom: Joi.string().min(2).max(100).optional(),
    telephone: Joi.string()
      .pattern(/^(\+261|0)[0-9]{9}$/)
      .optional(),
    adresse: Joi.string().max(500).optional(),
  }),

  changePassword: Joi.object({
    oldPassword: Joi.string().required(),
    newPassword: Joi.string()
      .min(8)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .required(),
  }),
}

// Schémas de validation pour les matériels
export const materielValidation = {
  create: Joi.object({
    nom: Joi.string().min(2).max(200).required().messages({
      "string.min": "Le nom doit contenir au moins 2 caractères",
      "string.max": "Le nom ne peut pas dépasser 200 caractères",
      "any.required": "Le nom est requis",
    }),
    description: Joi.string().min(10).max(1000).required().messages({
      "string.min": "La description doit contenir au moins 10 caractères",
      "string.max": "La description ne peut pas dépasser 1000 caractères",
      "any.required": "La description est requise",
    }),
    numero_serie: Joi.string().max(100).optional(),
    marque: Joi.string().max(100).optional(),
    modele: Joi.string().max(100).optional(),
    categorie_id: Joi.number().integer().positive().required().messages({
      "number.base": "La catégorie doit être un nombre",
      "number.positive": "La catégorie doit être positive",
      "any.required": "La catégorie est requise",
    }),
    quantite_totale: Joi.number().integer().min(1).max(1000).required().messages({
      "number.min": "La quantité doit être au moins 1",
      "number.max": "La quantité ne peut pas dépasser 1000",
      "any.required": "La quantité totale est requise",
    }),
    prix_unitaire: Joi.number().positive().optional().messages({
      "number.positive": "Le prix doit être positif",
    }),
    etat: Joi.string().valid("excellent", "bon", "moyen", "mauvais", "hors_service").required(),
    localisation: Joi.string().max(200).optional(),
    date_acquisition: Joi.date().optional(),
    garantie_fin: Joi.date().optional(),
    notes: Joi.string().max(1000).optional(),
  }),

  update: Joi.object({
    nom: Joi.string().min(2).max(200).optional(),
    description: Joi.string().min(10).max(1000).optional(),
    numero_serie: Joi.string().max(100).optional(),
    marque: Joi.string().max(100).optional(),
    modele: Joi.string().max(100).optional(),
    categorie_id: Joi.number().integer().positive().optional(),
    quantite_totale: Joi.number().integer().min(1).max(1000).optional(),
    quantite_disponible: Joi.number().integer().min(0).optional(),
    prix_unitaire: Joi.number().positive().optional(),
    etat: Joi.string().valid("excellent", "bon", "moyen", "mauvais", "hors_service").optional(),
    localisation: Joi.string().max(200).optional(),
    date_acquisition: Joi.date().optional(),
    garantie_fin: Joi.date().optional(),
    notes: Joi.string().max(1000).optional(),
  }),
}

// Schémas de validation pour les demandes d'emprunt
export const demandeValidation = {
  create: Joi.object({
    materiel_id: Joi.number().integer().positive().required(),
    quantite_demandee: Joi.number().integer().min(1).max(10).required().messages({
      "number.min": "La quantité doit être au moins 1",
      "number.max": "La quantité ne peut pas dépasser 10",
    }),
    date_debut: Joi.date().min("now").required().messages({
      "date.min": "La date de début ne peut pas être dans le passé",
    }),
    date_fin: Joi.date().greater(Joi.ref("date_debut")).required().messages({
      "date.greater": "La date de fin doit être après la date de début",
    }),
    motif: Joi.string().min(10).max(500).required().messages({
      "string.min": "Le motif doit contenir au moins 10 caractères",
      "string.max": "Le motif ne peut pas dépasser 500 caractères",
    }),
    projet: Joi.string().min(3).max(200).required().messages({
      "string.min": "Le nom du projet doit contenir au moins 3 caractères",
      "string.max": "Le nom du projet ne peut pas dépasser 200 caractères",
    }),
    urgence: Joi.string().valid("faible", "normale", "elevee", "urgente").required(),
  }),

  approve: Joi.object({
    statut: Joi.string().valid("approuvee", "refusee").required(),
    commentaire_responsable: Joi.string().max(500).optional(),
  }),
}

// Schémas de validation pour les emprunts
export const empruntValidation = {
  return: Joi.object({
    etat_retour: Joi.string().valid("excellent", "bon", "moyen", "mauvais", "endommage").required(),
    commentaire_retour: Joi.string().max(500).optional(),
    frais_degats: Joi.number().min(0).optional(),
  }),
}

// Schémas de validation pour les catégories
export const categorieValidation = {
  create: Joi.object({
    nom: Joi.string().min(2).max(100).required(),
    description: Joi.string().max(500).optional(),
    couleur: Joi.string()
      .pattern(/^#[0-9A-F]{6}$/i)
      .optional(),
    icone: Joi.string().max(50).optional(),
  }),

  update: Joi.object({
    nom: Joi.string().min(2).max(100).optional(),
    description: Joi.string().max(500).optional(),
    couleur: Joi.string()
      .pattern(/^#[0-9A-F]{6}$/i)
      .optional(),
    icone: Joi.string().max(50).optional(),
  }),
}

// Fonction utilitaire pour valider les données
export const validate = (schema: Joi.ObjectSchema, data: any) => {
  const { error, value } = schema.validate(data, {
    abortEarly: false,
    stripUnknown: true,
  })

  if (error) {
    const errors = error.details.map((detail) => ({
      field: detail.path.join("."),
      message: detail.message,
    }))
    return { isValid: false, errors, data: null }
  }

  return { isValid: true, errors: [], data: value }
}

// Validation des paramètres de requête
export const queryValidation = {
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sort: Joi.string().optional(),
    order: Joi.string().valid("asc", "desc").default("desc"),
  }),

  search: Joi.object({
    q: Joi.string().min(1).max(100).optional(),
    category: Joi.number().integer().positive().optional(),
    status: Joi.string().optional(),
    date_from: Joi.date().optional(),
    date_to: Joi.date().optional(),
  }),
}
