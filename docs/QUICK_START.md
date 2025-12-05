# 🚀 Guide de Démarrage Rapide - e-Justice Sénégal

Ce guide vous permettra de lancer le projet en moins de 10 minutes.

## Prérequis

- **Node.js** 18+ ([installer avec nvm](https://github.com/nvm-sh/nvm))
- **PostgreSQL** 15+ ([installer](https://www.postgresql.org/download/)) ou **Docker**
- **Git**

## Installation en 5 étapes

### 1️⃣ Cloner le projet

```bash
git clone https://github.com/votre-username/ejustice-senegal.git
cd ejustice-senegal
```

### 2️⃣ Installer les dépendances

```bash
# Frontend (racine du projet)
npm install

# Backend
cd backend
npm install
cd ..
```

### 3️⃣ Configurer l'environnement

```bash
# Frontend
cp .env.example .env

# Backend
cd backend
cp .env.example .env
```

Éditez `backend/.env` et configurez au minimum :

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/ejustice"
JWT_SECRET="votre-cle-secrete-minimum-32-caracteres"
CORS_ORIGIN=http://localhost:5173
```

### 4️⃣ Préparer la base de données

**Option A : Avec Docker (recommandé)**

```bash
cd backend
docker-compose up -d postgres
```

**Option B : PostgreSQL local**

```sql
CREATE DATABASE ejustice;
```

Puis appliquez les migrations :

```bash
cd backend
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed  # Optionnel: données de test
```

### 5️⃣ Lancer l'application

**Terminal 1 - Backend :**

```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend :**

```bash
npm run dev
```

## 🎉 C'est prêt !

- **Frontend** : http://localhost:5173
- **Backend API** : http://localhost:3001
- **Prisma Studio** : `npm run prisma:studio` (dans /backend)

## Comptes de test

| Email | Mot de passe | Rôle |
|-------|-------------|------|
| admin@ejustice.sn | Admin123! | Admin |
| greffier@ejustice.sn | Greffier123! | Greffier |
| juge@ejustice.sn | Juge123! | Juge |
| procureur@ejustice.sn | Procureur123! | Procureur |
| avocat@ejustice.sn | Avocat123! | Avocat |
| justiciable@ejustice.sn | Justiciable123! | Justiciable |

## Prochaines étapes

1. **Configurer les emails** : Créez un compte [Resend](https://resend.com) et ajoutez `RESEND_API_KEY` dans `.env`
2. **Configurer les SMS** : Créez un compte [Twilio](https://twilio.com) pour les notifications SMS/WhatsApp
3. **Explorer la documentation** : Voir `/docs` pour les guides détaillés

## Problèmes courants

### Erreur de connexion à PostgreSQL

```bash
# Vérifiez que PostgreSQL est démarré
docker-compose ps  # Si Docker
# ou
pg_isready  # Si local
```

### Port 3001 déjà utilisé

```bash
# Modifier PORT dans backend/.env
PORT=3002
```

### Migrations échouées

```bash
cd backend
npx prisma migrate reset  # ⚠️ Efface les données
npm run prisma:migrate
```

## Support

- 📚 Documentation complète : `/docs`
- 📧 Email : support@ejustice.sn

---

**Bon développement ! ⚖️**
