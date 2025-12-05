# ⚖️ e-Justice Sénégal (SmartCourt)

Plateforme complète de gestion judiciaire pour le Sénégal - Un système moderne de gestion des audiences, dossiers et notifications pour la Justice sénégalaise.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Node](https://img.shields.io/badge/node-18+-brightgreen.svg)

## 📋 Table des matières

- [Aperçu](#-aperçu)
- [Fonctionnalités](#-fonctionnalités)
- [Architecture](#-architecture)
- [Prérequis](#-prérequis)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Démarrage](#-démarrage)
- [Structure du projet](#-structure-du-projet)
- [Rôles utilisateurs](#-rôles-utilisateurs)
- [Documentation](#-documentation)
- [Déploiement](#-déploiement)
- [Contribution](#-contribution)

## 🎯 Aperçu

e-Justice Sénégal est une plateforme web complète permettant la gestion numérique des procédures judiciaires. Elle offre une interface intuitive pour 6 types d'utilisateurs différents avec des fonctionnalités adaptées à chaque rôle.

## ✨ Fonctionnalités

### Modules principaux

- **🔐 Authentification & Gestion des utilisateurs** : RBAC avec 6 rôles, activation des comptes par greffier
- **🏛️ Gestion des audiences** : Création, planification, QR codes, historique
- **📂 Dossiers judiciaires** : Suivi complet, pièces jointes, archivage
- **🔔 Notifications** : Email, SMS, WhatsApp, in-app (19 types)
- **📺 Affichage numérique** : Tableau d'affichage temps réel pour les tribunaux
- **📊 Statistiques & Analytics** : Tableaux de bord avec prédictions IA
- **📝 Blog** : Actualités juridiques et mises à jour

### Fonctionnalités clés

- ✅ Interface 100% responsive (mobile, tablette, desktop)
- ✅ Notifications automatiques multi-canaux
- ✅ Génération de QR codes pour les audiences
- ✅ Export PDF et Excel des données
- ✅ Détection des conflits de salles
- ✅ Workflow de validation des décisions
- ✅ Audit trail complet

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
│              React + TypeScript + TailwindCSS                │
│                     (Port 5173)                              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                        BACKEND                               │
│              Node.js + Express + Prisma                      │
│                     (Port 3001)                              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                       DATABASE                               │
│                    PostgreSQL 15+                            │
│                     (Port 5432)                              │
└─────────────────────────────────────────────────────────────┘
```

## 💻 Prérequis

### Frontend
- **Node.js** 18+
- **npm** 9+ ou **yarn** 1.22+

### Backend
- **Node.js** 18+
- **PostgreSQL** 15+
- **npm** 9+

### Optionnel (pour les notifications)
- Compte [Resend](https://resend.com) pour les emails
- Compte [Twilio](https://twilio.com) pour SMS/WhatsApp

## 🚀 Installation

### Étape 1 : Cloner le projet

```bash
git clone https://github.com/votre-username/ejustice-senegal.git
cd ejustice-senegal
```

### Étape 2 : Installer les dépendances Frontend

```bash
# À la racine du projet
npm install
```

### Étape 3 : Installer les dépendances Backend

```bash
cd backend
npm install
cd ..
```

## ⚙️ Configuration

### Configuration Frontend

1. Copier le fichier d'environnement :

```bash
cp .env.example .env
```

2. Modifier `.env` :

```env
VITE_API_URL=http://localhost:3001/api
```

### Configuration Backend

1. Copier le fichier d'environnement :

```bash
cd backend
cp .env.example .env
```

2. Modifier `backend/.env` :

```env
# Base de données PostgreSQL
DATABASE_URL="postgresql://postgres:password@localhost:5432/ejustice?schema=public"

# JWT (générer une clé secrète forte)
JWT_SECRET="votre-cle-secrete-super-longue-et-complexe"
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# Serveur
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173

# Email (Resend - optionnel)
RESEND_API_KEY=re_xxxxxxxxxxxxx
EMAIL_FROM=noreply@votredomaine.com
EMAIL_FROM_NAME=e-Justice Sénégal

# SMS/WhatsApp (Twilio - optionnel)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+221xxxxxxxxx
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886

# IA (optionnel)
AI_PROVIDER=lovable
LOVABLE_AI_KEY=votre-cle-lovable

# Sécurité
BCRYPT_ROUNDS=12
```

### Configuration de la base de données

#### Option A : Avec Docker (Recommandé)

```bash
cd backend
docker-compose up -d postgres
```

#### Option B : PostgreSQL local

1. Installer PostgreSQL 15+
2. Créer la base de données :

```sql
CREATE DATABASE ejustice;
CREATE USER ejustice_user WITH PASSWORD 'votre_mot_de_passe';
GRANT ALL PRIVILEGES ON DATABASE ejustice TO ejustice_user;
```

3. Mettre à jour `DATABASE_URL` dans `.env`

### Initialisation de la base de données

```bash
cd backend

# Générer le client Prisma
npm run prisma:generate

# Appliquer les migrations
npm run prisma:migrate

# (Optionnel) Seeder avec des données de test
npm run prisma:seed

# (Optionnel) Ouvrir Prisma Studio pour visualiser les données
npm run prisma:studio
```

## 🏃 Démarrage

### Démarrer le Backend

```bash
cd backend
npm run dev
```

Le serveur API démarre sur `http://localhost:3001`

### Démarrer le Frontend

Dans un nouveau terminal :

```bash
# À la racine du projet
npm run dev
```

L'application démarre sur `http://localhost:5173`

### Démarrage avec Docker (tout-en-un)

```bash
cd backend
docker-compose up -d
```

Cela démarre :
- PostgreSQL sur le port 5432
- Backend API sur le port 3001

Puis démarrer le frontend :

```bash
npm run dev
```

## 📁 Structure du projet

```
ejustice-senegal/
├── src/                          # Frontend React
│   ├── components/               # Composants réutilisables
│   │   ├── ui/                   # Composants shadcn/ui
│   │   └── dashboards/           # Dashboards par rôle
│   ├── contexts/                 # Contextes React (AppContext)
│   ├── hooks/                    # Hooks personnalisés
│   ├── pages/                    # Pages par rôle
│   │   ├── admin/               # Pages administrateur
│   │   ├── greffier/            # Pages greffier
│   │   ├── juge/                # Pages juge
│   │   ├── procureur/           # Pages procureur
│   │   ├── avocat/              # Pages avocat
│   │   ├── justiciable/         # Pages justiciable
│   │   └── common/              # Pages communes
│   ├── services/                # Services API
│   └── lib/                     # Utilitaires
├── backend/                      # Backend Node.js
│   ├── prisma/                  # Schéma et migrations
│   ├── src/
│   │   ├── config/              # Configuration
│   │   ├── controllers/         # Contrôleurs API
│   │   ├── middleware/          # Middlewares
│   │   ├── routes/              # Routes Express
│   │   ├── services/            # Services métier
│   │   └── utils/               # Utilitaires
│   └── docker-compose.yml       # Configuration Docker
├── docs/                         # Documentation
├── public/                       # Assets statiques
└── supabase/                     # Edge functions (optionnel)
```

## 👥 Rôles utilisateurs

| Rôle | Description | Accès principal |
|------|-------------|-----------------|
| **Admin** | Superviseur national | Tous les modules, statistiques nationales |
| **Greffier** | Greffier de tribunal | Gestion utilisateurs, audiences, salles |
| **Juge** | Magistrat | Décisions, instructions, audiences assignées |
| **Procureur** | Ministère public | Affaires du parquet, réquisitions |
| **Avocat** | Avocat inscrit | Dossiers clients, documents |
| **Justiciable** | Citoyen | Consultation de son dossier |

### Comptes de test (après seed)

| Email | Mot de passe | Rôle |
|-------|-------------|------|
| admin@ejustice.sn | Admin123! | Admin |
| greffier@ejustice.sn | Greffier123! | Greffier |
| juge@ejustice.sn | Juge123! | Juge |
| procureur@ejustice.sn | Procureur123! | Procureur |
| avocat@ejustice.sn | Avocat123! | Avocat |
| justiciable@ejustice.sn | Justiciable123! | Justiciable |

## 📚 Documentation

- [Guide d'implémentation Backend](docs/BACKEND_IMPLEMENTATION_GUIDE.md)
- [Roadmap Backend](docs/BACKEND_ROADMAP.md)
- [Schéma de base de données](docs/DATABASE_SCHEMA.sql)
- [Module d'authentification](docs/MODULE_AUTHENTIFICATION.md)
- [Technologies Backend](docs/TECHNOLOGIES_BACKEND.md)

## 🌐 Déploiement

### Frontend (Lovable)

1. Ouvrir [Lovable](https://lovable.dev/projects/a5647b72-d5f4-4178-a223-bbde92b49515)
2. Cliquer sur **Share → Publish**

### Backend

#### Option 1 : Railway

```bash
cd backend
railway up
railway add postgresql
```

#### Option 2 : Heroku

```bash
cd backend
heroku create ejustice-backend
heroku addons:create heroku-postgresql:hobby-dev
git push heroku main
```

#### Option 3 : DigitalOcean

1. Créer une App sur DigitalOcean App Platform
2. Connecter le repo GitHub
3. Ajouter PostgreSQL managed database
4. Configurer les variables d'environnement

### Variables d'environnement de production

```env
NODE_ENV=production
DATABASE_URL=postgresql://...
JWT_SECRET=...
CORS_ORIGIN=https://votre-domaine.com
```

## 🔐 Sécurité

- ✅ Authentification JWT avec refresh tokens
- ✅ Hash des mots de passe (bcrypt, 12 rounds)
- ✅ Rate limiting sur les endpoints sensibles
- ✅ Validation des données entrantes
- ✅ CORS configuré
- ✅ Headers sécurisés (Helmet.js)
- ✅ Filtrage des données par rôle
- ✅ Audit trail des actions

## 🤝 Contribution

1. Forker le projet
2. Créer une branche : `git checkout -b feature/ma-fonctionnalite`
3. Commit : `git commit -m "Ajout de ma fonctionnalité"`
4. Push : `git push origin feature/ma-fonctionnalite`
5. Créer une Pull Request

## 📝 License

MIT

## 📞 Support

- Email : support@ejustice.sn
- Documentation : `/docs`

---

**Créé avec ❤️ pour la Justice Sénégalaise**
