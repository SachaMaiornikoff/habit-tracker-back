#!/bin/bash

# Script de lancement du projet habit-tracker-back

set -e

echo "🚀 Lancement du projet habit-tracker-back..."

# Installation des dépendances
echo "📦 Installation des dépendances..."
npm install

# Génération du client Prisma
echo "🔧 Génération du client Prisma..."
npx prisma generate

# Lancement du serveur de développement
echo "🌐 Démarrage du serveur de développement..."
npm run dev
