# 🏛️ e-Justice Sénégal - Backend API

Backend Node.js/Express/PostgreSQL pour la plateforme e-Justice du Sénégal.

## 📋 Prérequis

- **Node.js** 18+ 
- **PostgreSQL** 15+
- **npm** ou **yarn**

## 🚀 Installation

### 1. Installer les dépendances

```bash
cd backend
npm install
```

### 2. Configuration de l'environnement

Copier `.env.example` vers `.env` et configurer :

```bash
cp .env.example .env
```

Modifier les variables dans `.env` :

```env
DATABASE_URL="postgresql://user:password@localhost:5432/ejustice?schema=public"
JWT_SECRET="your-super-secret-jwt-key"
PORT=3001
# ... autres variables
```

### 3. Configuration de la base de données

#### Option A : Docker (Recommandé)

```bash
docker-compose up -d postgres
```

#### Option B : PostgreSQL local

Installer PostgreSQL et créer la base :

```sql
CREATE DATABASE ejustice;
CREATE USER ejustice_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE ejustice TO ejustice_user;
```

### 4. Migrations Prisma

```bash
# Générer le client Prisma
npm run prisma:generate

# Appliquer les migrations
npm run prisma:migrate

# (Optionnel) Ouvrir Prisma Studio
npm run prisma:studio
```

### 5. Démarrer le serveur

```bash
# Mode développement (avec hot reload)
npm run dev

# Mode production
npm run build
npm start
```

Le serveur démarre sur `http://localhost:3001`

## 📁 Structure du Projet

```
backend/
├── prisma/
│   ├── schema.prisma           # Modèles de données
│   └── migrations/             # Migrations SQL
├── src/
│   ├── config/
│   │   ├── env.ts             # Configuration environnement
│   │   └── prisma.ts          # Client Prisma
│   ├── controllers/           # Logique métier
│   │   ├── auth.controller.ts
│   │   ├── dossier.controller.ts
│   │   └── ...
│   ├── middleware/            # Middlewares Express
│   │   ├── auth.ts            # Authentification JWT
│   │   ├── errorHandler.ts   # Gestion des erreurs
│   │   ├── validate.ts        # Validation des données
│   │   └── rateLimiter.ts     # Limitation de requêtes
│   ├── routes/                # Routes API
│   │   ├── auth.routes.ts
│   │   ├── dossier.routes.ts
│   │   └── ...
│   ├── services/              # Services métier
│   │   ├── email.service.ts
│   │   ├── sms.service.ts
│   │   ├── ai.service.ts
│   │   └── ...
│   ├── utils/                 # Utilitaires
│   │   ├── logger.ts
│   │   ├── jwt.ts
│   │   └── ApiError.ts
│   └── index.ts               # Point d'entrée
├── tests/                     # Tests
├── uploads/                   # Fichiers uploadés
├── logs/                      # Logs applicatifs
├── .env.example              # Variables d'environnement
├── docker-compose.yml        # Configuration Docker
├── Dockerfile                # Image Docker
├── package.json
└── tsconfig.json
```

## 🔌 API Endpoints

### 🔐 Authentification (`/api/auth`)

| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/register` | Inscription |
| POST | `/login` | Connexion |
| POST | `/logout` | Déconnexion |
| POST | `/refresh-token` | Renouveler le token |
| POST | `/forgot-password` | Mot de passe oublié |
| POST | `/reset-password` | Réinitialiser mot de passe |

### 👤 Utilisateurs (`/api/users`)

| Méthode | Route | Description | Auth |
|---------|-------|-------------|------|
| GET | `/me` | Profil actuel | ✅ |
| PUT | `/me` | Modifier profil | ✅ |
| GET | `/:id` | Profil utilisateur | ✅ |

### 📂 Dossiers (`/api/dossiers`)

| Méthode | Route | Description | Auth |
|---------|-------|-------------|------|
| GET | `/` | Liste dossiers | ✅ |
| POST | `/` | Créer dossier | ✅ |
| GET | `/:id` | Détails dossier | ✅ |
| PUT | `/:id` | Modifier dossier | ✅ |
| DELETE | `/:id` | Supprimer dossier | ✅ |
| POST | `/:id/pieces` | Ajouter pièce | ✅ |

### 🏛️ Audiences (`/api/audiences`)

| Méthode | Route | Description | Auth |
|---------|-------|-------------|------|
| GET | `/` | Liste audiences | ✅ |
| POST | `/` | Créer audience | ✅ |
| GET | `/:id` | Détails audience | ✅ |
| PUT | `/:id` | Modifier audience | ✅ |
| DELETE | `/:id` | Annuler audience | ✅ |
| GET | `/public` | Audiences publiques | ❌ |

### 🔔 Notifications (`/api/notifications`)

| Méthode | Route | Description | Auth |
|---------|-------|-------------|------|
| GET | `/` | Mes notifications | ✅ |
| PUT | `/:id/read` | Marquer comme lue | ✅ |
| GET | `/preferences` | Mes préférences | ✅ |
| PUT | `/preferences` | Modifier préférences | ✅ |

### 📝 Blog (`/api/blog`)

| Méthode | Route | Description | Auth |
|---------|-------|-------------|------|
| GET | `/` | Liste articles | ❌ |
| GET | `/:slug` | Article | ❌ |
| POST | `/` | Créer article | ✅ Admin |
| PUT | `/:id` | Modifier article | ✅ Admin |
| DELETE | `/:id` | Supprimer article | ✅ Admin |

### 📄 Documents (`/api/documents`)

| Méthode | Route | Description | Auth |
|---------|-------|-------------|------|
| GET | `/public` | Documents publics | ❌ |
| GET | `/:id` | Télécharger document | ❌ |
| POST | `/` | Upload document | ✅ Admin |

### 🤖 IA (`/api/ai`)

| Méthode | Route | Description | Auth |
|---------|-------|-------------|------|
| POST | `/chat` | Chat avec IA | ✅ |
| POST | `/suggest` | Suggestions IA | ✅ |

### ⚙️ Admin (`/api/admin`)

| Méthode | Route | Description | Auth |
|---------|-------|-------------|------|
| GET | `/users` | Liste utilisateurs | ✅ Admin |
| PUT | `/users/:id/role` | Changer rôle | ✅ Admin |
| GET | `/stats` | Statistiques | ✅ Admin |
| GET | `/audit-logs` | Logs d'audit | ✅ Admin |

## 🔒 Authentification

L'API utilise **JWT (JSON Web Tokens)** :

1. Login via `/api/auth/login`
2. Recevoir `accessToken` et `refreshToken`
3. Inclure le token dans les requêtes :

```bash
Authorization: Bearer <accessToken>
```

**Expiration :**
- Access Token : 7 jours
- Refresh Token : 30 jours

## 🧪 Tests

```bash
# Tests unitaires
npm test

# Tests avec couverture
npm run test:coverage

# Mode watch
npm run test:watch
```

## 🐳 Docker

### Démarrer avec Docker Compose

```bash
# Démarrer tous les services
docker-compose up -d

# Voir les logs
docker-compose logs -f

# Arrêter les services
docker-compose down

# Nettoyer (⚠️ supprime les données)
docker-compose down -v
```

### Build l'image

```bash
docker build -t ejustice-backend .
```

## 🔧 Scripts NPM

| Script | Description |
|--------|-------------|
| `npm run dev` | Mode développement avec hot reload |
| `npm run build` | Compiler TypeScript |
| `npm start` | Démarrer en production |
| `npm run prisma:generate` | Générer client Prisma |
| `npm run prisma:migrate` | Appliquer migrations |
| `npm run prisma:studio` | Ouvrir Prisma Studio |
| `npm test` | Lancer les tests |
| `npm run lint` | Vérifier le code |
| `npm run format` | Formater le code |

## 📧 Configuration Email (Resend)

1. Créer un compte sur [resend.com](https://resend.com)
2. Valider un domaine dans Resend
3. Créer une clé API
4. Ajouter dans `.env` :

```env
RESEND_API_KEY=re_xxxxxxxxxxxxx
EMAIL_FROM=noreply@votredomaine.com
```

## 📱 Configuration SMS (Twilio)

1. Créer un compte sur [twilio.com](https://twilio.com)
2. Obtenir un numéro de téléphone
3. Récupérer les identifiants
4. Ajouter dans `.env` :

```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+221xxxxxxxxx
```

## 🤖 Configuration IA

### Option A : Lovable AI (Recommandé)

```env
AI_PROVIDER=lovable
LOVABLE_AI_KEY=your-lovable-ai-key
```

### Option B : OpenAI

```env
AI_PROVIDER=openai
OPENAI_API_KEY=sk-xxxxxxxxxxxxx
```

## 🌍 Déploiement

### Heroku

```bash
heroku create ejustice-backend
heroku addons:create heroku-postgresql:hobby-dev
git push heroku main
```

### Railway

```bash
railway up
railway add postgresql
railway link
```

### DigitalOcean App Platform

1. Connecter le repo GitHub
2. Configurer les variables d'environnement
3. Ajouter PostgreSQL managed database
4. Déployer

## 🔐 Sécurité

- ✅ Helmet.js pour sécuriser les headers HTTP
- ✅ Rate limiting pour prévenir les attaques DDoS
- ✅ Validation des données avec express-validator
- ✅ Hash des mots de passe avec bcrypt
- ✅ JWT pour l'authentification
- ✅ CORS configuré
- ✅ Row Level Security (RLS) au niveau base de données

## 📊 Monitoring

Les logs sont écrits dans :
- Console (développement)
- `logs/combined.log` (tous les logs)
- `logs/error.log` (erreurs uniquement)

## 🤝 Contribution

1. Créer une branche : `git checkout -b feature/ma-fonctionnalite`
2. Commit : `git commit -m "Ajout de ma fonctionnalité"`
3. Push : `git push origin feature/ma-fonctionnalite`
4. Créer une Pull Request

## 📝 License

MIT

## 📞 Support

Pour toute question :
- Email : support@ejustice.sn
- Documentation : `/docs`

---

**Créé avec ❤️ pour la Justice Sénégalaise**
