#!/bin/bash

# Script de déploiement pour MIT/MISA Emprunt Matériel
# Usage: ./scripts/deploy.sh [environment]

set -e

# Configuration
ENVIRONMENT=${1:-production}
APP_NAME="emprunt-materiel"
DOCKER_IMAGE="mit-misa/emprunt-materiel"
VERSION=$(git rev-parse --short HEAD)

echo "🚀 Déploiement de $APP_NAME en $ENVIRONMENT (version: $VERSION)"

# Vérifier les prérequis
command -v docker >/dev/null 2>&1 || { echo "❌ Docker n'est pas installé" >&2; exit 1; }
command -v docker-compose >/dev/null 2>&1 || { echo "❌ Docker Compose n'est pas installé" >&2; exit 1; }

# Charger les variables d'environnement
if [ -f ".env.$ENVIRONMENT" ]; then
    echo "📋 Chargement des variables d'environnement pour $ENVIRONMENT"
    export $(cat .env.$ENVIRONMENT | grep -v '^#' | xargs)
else
    echo "⚠️  Fichier .env.$ENVIRONMENT non trouvé, utilisation des variables par défaut"
fi

# Build de l'image Docker
echo "🔨 Build de l'image Docker..."
docker build -t $DOCKER_IMAGE:$VERSION -t $DOCKER_IMAGE:latest .

# Arrêter les conteneurs existants
echo "🛑 Arrêt des conteneurs existants..."
docker-compose -f docker-compose.yml -f docker-compose.$ENVIRONMENT.yml down

# Backup de la base de données (production uniquement)
if [ "$ENVIRONMENT" = "production" ]; then
    echo "💾 Backup de la base de données..."
    ./scripts/backup.sh
fi

# Démarrer les nouveaux conteneurs
echo "🚀 Démarrage des nouveaux conteneurs..."
docker-compose -f docker-compose.yml -f docker-compose.$ENVIRONMENT.yml up -d

# Attendre que l'application soit prête
echo "⏳ Attente du démarrage de l'application..."
timeout 60 bash -c 'until curl -f http://localhost:3000/api/health; do sleep 2; done'

# Vérifier le statut
if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
    echo "✅ Déploiement réussi ! L'application est accessible sur http://localhost:3000"
else
    echo "❌ Échec du déploiement"
    docker-compose logs app
    exit 1
fi

# Nettoyer les anciennes images
echo "🧹 Nettoyage des anciennes images..."
docker image prune -f

echo "🎉 Déploiement terminé avec succès !"
