# Offres Emploi Sérieuse 242

Plateforme d'emploi congolaise — Next.js 14 Full Stack, production-ready.

## Stack technique
- **Framework** : Next.js 14 App Router + TypeScript
- **Auth** : NextAuth.js v5 (Credentials + Google OAuth)
- **Base de données** : PostgreSQL + Prisma ORM
- **Validation** : Zod
- **Temps réel** : Server-Sent Events (SSE) natif
- **Sécurité** : bcrypt, JWT, CSRF via NextAuth, rate limiting, IP hashing

## Structure

\`\`\`
src/
├── app/
│   ├── api/                  # 55 routes API
│   │   ├── auth/             # register, login, forgot-password
│   │   ├── offres/           # liste publique, détail, save
│   │   ├── applications/     # postuler, mes candidatures
│   │   ├── candidat/         # profil, stats, alertes
│   │   ├── rh/               # offres, candidats, stats, entreprise, pipeline
│   │   ├── admin/            # users, offres, entreprises, ads, logs, stats...
│   │   ├── ads/              # serve, track
│   │   ├── messages/         # chat, stream SSE
│   │   ├── notifications/    # in-app notifications
│   │   ├── formations/       # catalogue
│   │   ├── articles/         # blog conseils
│   │   ├── entreprises/      # annuaire, avis
│   │   └── signalements/     # modération
│   ├── dashboard/
│   │   ├── candidat/         # profil, candidatures, alertes, messagerie
│   │   └── rh/               # offres, cvthèque, stats, messagerie
│   └── admin/                # validation, users, entreprises, pubs, blog...
├── lib/
│   ├── auth.ts               # NextAuth v5 config
│   ├── prisma.ts             # Singleton client
│   ├── logger.ts             # Logs système
│   ├── notifications.ts      # Notifs in-app + SSE registry
│   ├── utils.ts              # Formatage, calculs, slugs
│   └── cookies.ts            # Helpers server-side cookies
├── types/
│   ├── index.ts              # Types globaux partagés
│   └── next-auth.d.ts        # Extension types NextAuth
prisma/
├── schema.prisma             # 35 modèles, 20 enums, 81 index
└── seed.ts                   # Super admin + paramètres initiaux
middleware.ts                 # Protection routes par rôle
\`\`\`

## Installation

\`\`\`bash
# 1. Cloner et installer
npm install

# 2. Configurer l'environnement
cp .env.example .env.local
# Remplir DATABASE_URL, NEXTAUTH_SECRET, etc.

# 3. Base de données
npx prisma migrate dev --name init
npx prisma generate
npm run db:seed

# 4. Lancer en développement
npm run dev
\`\`\`

## Sécurité
- Mots de passe hashés avec bcrypt (12 rounds)
- Sessions JWT signées avec NEXTAUTH_SECRET
- Toutes les routes API protégées par vérification de rôle
- IP hashée SHA-256 pour le tracking pubs (jamais stockée en clair)
- Rate limiting sur les endpoints sensibles
- Validation Zod côté serveur sur toutes les entrées
- Transactions Prisma pour les opérations critiques

## Commandes utiles
\`\`\`bash
npm run dev          # Développement
npm run build        # Build production
npm run db:migrate   # Migrations DB
npm run db:seed      # Seed initial
npm run db:studio    # Interface visuelle Prisma
npx prisma generate  # Régénérer le client après modif schema
\`\`\`
