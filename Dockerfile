# Dockerfile pour l'application MIT/MISA Emprunt Matériel
FROM node:18-alpine AS base

# Installer les dépendances système nécessaires
RUN apk add --no-cache libc6-compat

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de configuration des dépendances
COPY package.json package-lock.json* ./

# Installer les dépendances
RUN npm ci --only=production && npm cache clean --force

# Étape de build
FROM base AS builder
WORKDIR /app

# Copier les dépendances installées
COPY --from=base /app/node_modules ./node_modules

# Copier le code source
COPY . .

# Variables d'environnement pour le build
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production

# Build de l'application
RUN npm run build

# Étape de production
FROM node:18-alpine AS runner
WORKDIR /app

# Créer un utilisateur non-root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copier les fichiers nécessaires
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Créer les répertoires nécessaires
RUN mkdir -p /app/logs /app/uploads
RUN chown -R nextjs:nodejs /app/logs /app/uploads

# Variables d'environnement
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1
ENV PORT 3000

# Exposer le port
EXPOSE 3000

# Changer vers l'utilisateur non-root
USER nextjs

# Commande de démarrage
CMD ["node", "server.js"]
