# Guide d'Implémentation Backend - e-Justice Sénégal

## 📋 Vue d'ensemble

Ce guide explique comment déployer et configurer le backend Node.js/Express/PostgreSQL pour la plateforme e-Justice Sénégal.

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                          │
│                    http://localhost:5173                     │
└─────────────────────────────────────────────────────────────┘
                              │
                    API REST (JWT Auth)
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND (Node.js)                         │
│                    http://localhost:3001                     │
│  ┌─────────┐  ┌────────────┐  ┌────────────┐               │
│  │ Express │──│ Controllers│──│ Services   │               │
│  │ Routes  │  │            │  │            │               │
│  └─────────┘  └────────────┘  └────────────┘               │
│       │                              │                       │
│       ▼                              ▼                       │
│  ┌─────────┐                  ┌────────────┐               │
│  │Middleware│                 │  Prisma    │               │
│  │(Auth,RLS)│                 │   ORM      │               │
│  └─────────┘                  └────────────┘               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    PostgreSQL 15+                            │
│                    Port: 5432                                │
└─────────────────────────────────────────────────────────────┘
```

## 📁 Structure du Backend

```
backend/
├── prisma/
│   ├── schema.prisma           # Modèles de données (14 tables)
│   ├── migrations/             # Migrations SQL auto-générées
│   └── seed.ts                 # Données de test
├── src/
│   ├── config/
│   │   ├── env.ts             # Variables d'environnement
│   │   └── prisma.ts          # Client Prisma singleton
│   ├── controllers/           # Logique métier
│   │   ├── auth.controller.ts     # Inscription, connexion
│   │   ├── user.controller.ts     # CRUD utilisateurs
│   │   ├── dossier.controller.ts  # Gestion dossiers
│   │   ├── audience.controller.ts # Gestion audiences
│   │   ├── decision.controller.ts # Décisions judiciaires
│   │   ├── instruction.controller.ts # Instructions juge→greffe
│   │   ├── notification.controller.ts # Notifications
│   │   ├── blog.controller.ts     # Articles blog
│   │   ├── document.controller.ts # Documents publics
│   │   ├── salle.controller.ts    # Gestion salles
│   │   ├── ai.controller.ts       # Chatbot IA
│   │   └── admin.controller.ts    # Admin & stats
│   ├── middleware/
│   │   ├── auth.ts            # Authentification JWT
│   │   ├── errorHandler.ts    # Gestion erreurs globale
│   │   ├── validate.ts        # Validation express-validator
│   │   ├── rateLimiter.ts     # Rate limiting
│   │   └── notFoundHandler.ts # 404 handler
│   ├── routes/                # Définition des routes
│   │   ├── auth.routes.ts
│   │   ├── user.routes.ts
│   │   ├── dossier.routes.ts
│   │   ├── audience.routes.ts
│   │   ├── decision.routes.ts
│   │   ├── instruction.routes.ts
│   │   ├── notification.routes.ts
│   │   ├── blog.routes.ts
│   │   ├── document.routes.ts
│   │   ├── salle.routes.ts
│   │   ├── ai.routes.ts
│   │   └── admin.routes.ts
│   ├── services/              # Services métier
│   │   ├── notification.service.ts  # Email/SMS/WhatsApp
│   │   ├── audit.service.ts         # Logs d'audit
│   │   └── stats.service.ts         # Statistiques
│   ├── utils/
│   │   ├── logger.ts          # Winston logger
│   │   ├── jwt.ts             # Génération/vérification JWT
│   │   └── ApiError.ts        # Classe erreur personnalisée
│   └── index.ts               # Point d'entrée Express
├── logs/                      # Fichiers de logs
├── uploads/                   # Fichiers uploadés
├── .env.example              # Template variables env
├── docker-compose.yml        # Config Docker
├── Dockerfile                # Image Docker
├── package.json
└── tsconfig.json
```

## 🚀 Installation rapide

### Prérequis
- Node.js 18+
- PostgreSQL 15+
- npm ou yarn

### Étapes

```bash
# 1. Aller dans le dossier backend
cd backend

# 2. Installer les dépendances
npm install

# 3. Configurer l'environnement
cp .env.example .env
# Éditer .env avec vos valeurs

# 4. Démarrer PostgreSQL (Docker ou local)
docker-compose up -d postgres
# OU utiliser PostgreSQL local

# 5. Générer le client Prisma
npm run prisma:generate

# 6. Appliquer les migrations
npm run prisma:migrate

# 7. (Optionnel) Seeder la base
npm run prisma:seed

# 8. Démarrer le serveur
npm run dev
```

## ⚙️ Configuration

### Variables d'environnement (.env)

```env
# ═══════════════════════════════════════════════════════════
# SERVEUR
# ═══════════════════════════════════════════════════════════
NODE_ENV=development
PORT=3001

# ═══════════════════════════════════════════════════════════
# BASE DE DONNÉES
# ═══════════════════════════════════════════════════════════
DATABASE_URL="postgresql://postgres:password@localhost:5432/ejustice?schema=public"

# ═══════════════════════════════════════════════════════════
# JWT
# ═══════════════════════════════════════════════════════════
JWT_SECRET="votre-cle-secrete-longue-et-complexe-minimum-32-caracteres"
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# ═══════════════════════════════════════════════════════════
# CORS
# ═══════════════════════════════════════════════════════════
CORS_ORIGIN=http://localhost:5173

# ═══════════════════════════════════════════════════════════
# EMAIL (Resend)
# ═══════════════════════════════════════════════════════════
RESEND_API_KEY=re_xxxxxxxxxxxxx
EMAIL_FROM=noreply@votredomaine.com
EMAIL_FROM_NAME=e-Justice Sénégal

# ═══════════════════════════════════════════════════════════
# SMS/WHATSAPP (Twilio)
# ═══════════════════════════════════════════════════════════
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+221xxxxxxxxx
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886

# ═══════════════════════════════════════════════════════════
# IA
# ═══════════════════════════════════════════════════════════
AI_PROVIDER=lovable
LOVABLE_AI_KEY=votre-cle-lovable
# OU
# AI_PROVIDER=openai
# OPENAI_API_KEY=sk-xxxxxxxxxxxxx

# ═══════════════════════════════════════════════════════════
# SÉCURITÉ
# ═══════════════════════════════════════════════════════════
BCRYPT_ROUNDS=12
SESSION_SECRET=votre-session-secret

# ═══════════════════════════════════════════════════════════
# FICHIERS
# ═══════════════════════════════════════════════════════════
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads
ALLOWED_FILE_TYPES=pdf,doc,docx,jpg,jpeg,png

# ═══════════════════════════════════════════════════════════
# RATE LIMITING
# ═══════════════════════════════════════════════════════════
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# ═══════════════════════════════════════════════════════════
# LOGGING
# ═══════════════════════════════════════════════════════════
LOG_LEVEL=info
LOG_FILE=./logs/app.log

# ═══════════════════════════════════════════════════════════
# ADMIN INITIAL
# ═══════════════════════════════════════════════════════════
ADMIN_EMAIL=admin@ejustice.sn
ADMIN_PASSWORD=Admin123!
```

## 📊 Modèles de données (Prisma)

### Tables principales

| Table | Description | Relations |
|-------|-------------|-----------|
| `User` | Utilisateurs | Profile, Roles, Notifications |
| `Profile` | Profils étendus | User |
| `UserRole` | Rôles utilisateurs | User |
| `Dossier` | Dossiers judiciaires | Audiences, Pieces, Historique |
| `Audience` | Audiences/Hearings | Dossier, Salle, Participants |
| `Decision` | Décisions judiciaires | Dossier, Juge |
| `Instruction` | Instructions juge→greffe | Juge, Greffier |
| `Notification` | Notifications multi-canal | User |
| `NotificationPreference` | Préférences notifications | User |
| `Salle` | Salles d'audience | Audiences |
| `BlogPost` | Articles blog | Auteur |
| `DocumentPublic` | Documents publics | - |
| `AuditLog` | Logs d'audit | User |
| `HistoriqueDossier` | Historique dossiers | Dossier |

### Enums

```prisma
enum Role {
  ADMIN
  GREFFIER
  JUGE
  PROCUREUR
  AVOCAT
  JUSTICIABLE
}

enum StatutDossier {
  OUVERT
  EN_COURS
  SUSPENDU
  CLOS
  ARCHIVE
}

enum StatutAudience {
  PROGRAMMEE
  EN_COURS
  TERMINEE
  REPORTEE
  ANNULEE
}

enum TypeNotification {
  AUDIENCE_CREEE
  AUDIENCE_REPORTEE
  AUDIENCE_ANNULEE
  RAPPEL_AUDIENCE
  DOSSIER_CREE
  DOSSIER_MODIFIE
  DOSSIER_CLOS
  PIECE_AJOUTEE
  DECISION_RENDUE
  DECISION_VALIDEE
  DECISION_PUBLIEE
  INSTRUCTION_ENVOYEE
  INSTRUCTION_TRAITEE
  CONVOCATION_RECUE
  ECHEANCE_PROCHE
  COMMENTAIRE_AJOUTE
  UTILISATEUR_CREE
  ALERTE_SECURITE
  ASSIGNATION_NOUVEAU_DOSSIER
}

enum CanalNotification {
  EMAIL
  SMS
  WHATSAPP
  IN_APP
}
```

## 🔌 API Endpoints

### Authentification (`/api/auth`)

```
POST /register          # Inscription (compte inactif)
POST /login             # Connexion
POST /logout            # Déconnexion
POST /refresh-token     # Renouveler token
POST /forgot-password   # Mot de passe oublié
POST /reset-password    # Réinitialiser MDP
```

### Utilisateurs (`/api/users`)

```
GET    /me              # Mon profil
PUT    /me              # Modifier mon profil
GET    /                # Liste utilisateurs (Admin/Greffier)
POST   /                # Créer utilisateur (Admin/Greffier)
GET    /:id             # Profil utilisateur
POST   /:id/activate    # Activer compte (Admin/Greffier)
POST   /:id/deactivate  # Désactiver compte (Admin/Greffier)
DELETE /:id             # Supprimer (Admin)
```

### Dossiers (`/api/dossiers`)

```
GET    /                # Liste (filtrée par rôle)
POST   /                # Créer
GET    /:id             # Détails
PUT    /:id             # Modifier
DELETE /:id             # Supprimer
POST   /:id/pieces      # Ajouter pièce
PUT    /:id/statut      # Changer statut
```

### Audiences (`/api/audiences`)

```
GET    /                # Liste (filtrée par rôle)
POST   /                # Créer
GET    /:id             # Détails
PUT    /:id             # Modifier
DELETE /:id             # Annuler
GET    /public          # Affichage public
GET    /public/:uuid    # Détails publics (QR code)
POST   /:id/reporter    # Reporter
```

### Décisions (`/api/decisions`)

```
GET    /                # Mes décisions
POST   /                # Créer (Juge)
GET    /:id             # Détails
PUT    /:id             # Modifier (Juge)
POST   /:id/soumettre   # Soumettre validation
POST   /:id/valider     # Valider (Greffier)
POST   /:id/rejeter     # Rejeter (Greffier)
POST   /:id/publier     # Publier (Greffier)
```

### Instructions (`/api/instructions`)

```
GET    /                # Liste
POST   /                # Créer (Juge)
GET    /:id             # Détails
PUT    /:id/prendre     # Prendre en charge (Greffier)
PUT    /:id/completer   # Compléter (Greffier)
PUT    /:id/annuler     # Annuler (Juge)
```

### Notifications (`/api/notifications`)

```
GET    /                # Mes notifications
PUT    /:id/read        # Marquer comme lue
PUT    /read-all        # Tout marquer comme lu
GET    /preferences     # Mes préférences
PUT    /preferences     # Modifier préférences
POST   /send            # Envoyer (Greffier)
```

### Salles (`/api/salles`)

```
GET    /                # Liste des salles
POST   /                # Créer (Greffier)
GET    /:id             # Détails
PUT    /:id             # Modifier
DELETE /:id             # Supprimer
GET    /disponibles     # Salles disponibles
```

## 🔐 Sécurité

### Middleware d'authentification

```typescript
// Exemple d'utilisation
router.get('/protected', authenticate, (req, res) => {
  // req.user contient { userId, email, roles }
});

// Avec vérification de rôle
router.get('/admin-only', authenticate, requireRole('ADMIN'), handler);
```

### Filtrage par rôle

Le backend filtre automatiquement les données selon le rôle :

```typescript
// dossier.controller.ts - Exemple
if (userRoles.includes('JUGE')) {
  where.jugeId = userId;
} else if (userRoles.includes('AVOCAT')) {
  where.avocats = { some: { avocatId: userId } };
} else if (userRoles.includes('JUSTICIABLE')) {
  where.justiciableId = userId;
}
```

## 📧 Service de notifications

### Canaux supportés

1. **Email** (Resend API)
2. **SMS** (Twilio API)
3. **WhatsApp** (Twilio API)
4. **In-App** (Base de données)

### Utilisation

```typescript
import { createNotification, sendEmail } from '../services/notification.service';

// Notification complète
await createNotification({
  userId: 'uuid',
  type: 'AUDIENCE_CREEE',
  titre: 'Nouvelle audience',
  message: 'Vous avez une audience le...',
  canal: 'EMAIL',
  actionUrl: '/audiences/xxx',
});

// Email direct
await sendEmail({
  to: 'user@example.com',
  subject: 'Sujet',
  html: '<h1>Contenu</h1>',
});
```

## 🐳 Docker

### docker-compose.yml

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: ejustice
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build: .
    ports:
      - "3001:3001"
    environment:
      DATABASE_URL: postgresql://postgres:password@postgres:5432/ejustice
    depends_on:
      - postgres

volumes:
  postgres_data:
```

### Commandes Docker

```bash
# Démarrer tout
docker-compose up -d

# Voir les logs
docker-compose logs -f backend

# Arrêter
docker-compose down

# Nettoyer (⚠️ supprime les données)
docker-compose down -v
```

## 🧪 Tests

```bash
# Tests unitaires
npm test

# Tests avec couverture
npm run test:coverage

# Mode watch
npm run test:watch
```

## 📈 Monitoring

### Logs

Les logs sont écrits dans :
- Console (développement)
- `logs/combined.log` (tous les logs)
- `logs/error.log` (erreurs uniquement)

### Format des logs

```
2025-12-05 10:30:00 [info]: User logged in: user@example.com
2025-12-05 10:30:05 [info]: Audience created: AUD-2025-001
2025-12-05 10:30:10 [error]: Failed to send email: Connection timeout
```

## 🚀 Déploiement

### Variables de production

```env
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host:5432/ejustice
JWT_SECRET=production-secret-very-long
CORS_ORIGIN=https://votre-domaine.com
```

### Plateformes recommandées

1. **Railway** - Simple, intégration GitHub
2. **Heroku** - Mature, add-ons PostgreSQL
3. **DigitalOcean** - App Platform + Managed DB
4. **AWS** - ECS/EC2 + RDS

## ✅ Checklist de déploiement

- [ ] Variables d'environnement configurées
- [ ] Base de données PostgreSQL provisionnée
- [ ] Migrations appliquées (`prisma migrate deploy`)
- [ ] Utilisateur admin créé (via seed ou manuellement)
- [ ] CORS configuré avec le domaine frontend
- [ ] SSL/HTTPS activé
- [ ] Rate limiting configuré
- [ ] Logs configurés
- [ ] Backups automatiques de la DB

---

**Version:** 2.0  
**Date:** Décembre 2025  
**Équipe:** e-Justice Sénégal
