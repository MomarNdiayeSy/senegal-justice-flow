# 🚀 Technologies Backend - e-Justice Sénégal

## Architecture : Lovable Cloud (Supabase)

Ce projet utilise **Lovable Cloud** au lieu d'une stack Node.js/Express traditionnelle. Voici la correspondance des technologies :

## 📊 Comparaison des Technologies

| Votre Liste | Équivalent Lovable Cloud | Status |
|-------------|-------------------------|--------|
| **Node.js** | **Deno** (runtime moderne, sécurisé) | ✅ Intégré |
| **Express.js** | **Deno Edge Functions** | ✅ Intégré |
| **PostgreSQL** | **PostgreSQL Supabase** | ✅ Intégré |
| **Prisma ORM** | **SQL Migrations + Supabase Client** | ✅ Migrations créées |
| **JWT** | **Supabase Auth** (JWT automatique) | ✅ Intégré |
| **bcrypt** | **Supabase Auth** (hash automatique) | ✅ Intégré |
| **Helmet.js** | **Sécurité Supabase** + RLS | ✅ Intégré |
| **CORS** | **CORS Headers** dans Edge Functions | ✅ Configuré |
| **Nodemailer** | **Resend API** | ⚙️ À configurer |
| **Twilio/WhatsApp** | **Twilio API** | ⚙️ À configurer |
| **Multer** | **Supabase Storage** | ✅ Intégré |
| **Jest/Supertest** | **Deno Test** | 📝 À implémenter |
| **Swagger** | **Documentation manuelle** | 📝 À créer |
| **Docker** | **Géré par Lovable Cloud** | ✅ Automatique |

## 🏗️ Structure Backend Actuelle

```
supabase/
├── config.toml                    # Configuration des Edge Functions
├── functions/                     # Edge Functions (équivalent routes Express)
│   ├── send-notification/         # POST /functions/v1/send-notification
│   │   └── index.ts
│   ├── chat-assistant/            # POST /functions/v1/chat-assistant
│   │   └── index.ts
│   ├── send-email/                # POST /functions/v1/send-email
│   │   └── index.ts
│   └── send-sms/                  # POST /functions/v1/send-sms
│       └── index.ts
└── migrations/                    # Migrations SQL (équivalent Prisma)
    ├── 20240101000000_initial_schema.sql
    ├── 20240101000001_user_roles.sql
    ├── 20240101000002_profiles.sql
    ├── 20240101000003_dossiers.sql
    ├── 20240101000004_audiences.sql
    ├── 20240101000005_pieces_jointes.sql
    ├── 20240101000006_decisions.sql
    ├── 20240101000007_notifications.sql
    ├── 20240101000008_notification_preferences.sql
    ├── 20240101000009_audit_logs.sql
    ├── 20240101000010_blog_posts.sql
    └── 20240101000011_documents_publics.sql

docs/
├── DATABASE_SCHEMA.sql            # Schéma complet (équivalent schema.prisma)
├── BACKEND_ROADMAP.md             # Roadmap complète
├── BACKEND_IMPLEMENTATION_GUIDE.md # Guide de déploiement
└── TECHNOLOGIES_BACKEND.md        # Ce fichier
```

## 🔧 Technologies Utilisées

### 1. Runtime & Framework
- **Deno** : Runtime JavaScript/TypeScript moderne et sécurisé
- **Edge Functions** : Fonctions serverless déployées globalement
- **TypeScript** : Typage fort pour tous les fichiers backend

### 2. Base de Données
- **PostgreSQL 15+** : Base de données relationnelle
- **Row Level Security (RLS)** : Sécurité au niveau des lignes
- **Migrations SQL** : Gestion de version du schéma

### 3. Authentification & Sécurité
- **Supabase Auth** : Système d'authentification complet
  - JWT tokens automatiques
  - Hash de mot de passe (bcrypt)
  - Sessions persistantes
  - Refresh tokens
- **RLS Policies** : Contrôle d'accès granulaire
- **CORS** : Configuration dans chaque Edge Function
- **Input Validation** : Validation des données entrantes

### 4. Notifications & Communication
- **Resend** : Service d'envoi d'emails
  - Templates HTML
  - Tracking de livraison
  - API simple
- **Twilio** : SMS et WhatsApp
  - Envoi de SMS
  - Messages WhatsApp
  - Notifications temps réel

### 5. Intelligence Artificielle
- **Lovable AI Gateway** : Accès à des modèles IA
  - Google Gemini 2.5 Flash (par défaut)
  - Google Gemini 2.5 Pro
  - OpenAI GPT-5
  - Streaming de réponses

### 6. Stockage de Fichiers
- **Supabase Storage** : Stockage d'objets
  - Upload de pièces jointes
  - Génération d'URLs signées
  - Policies de sécurité
  - CDN intégré

### 7. Monitoring & Logs
- **Supabase Logs** : Logs centralisés
- **Console Logs** : Debug des Edge Functions
- **Error Tracking** : Gestion des erreurs

## 🚀 Déploiement

Le déploiement est **entièrement automatisé** par Lovable Cloud :
- ✅ Déploiement automatique des Edge Functions
- ✅ Mise à jour instantanée du code
- ✅ Rollback automatique en cas d'erreur
- ✅ Scaling automatique
- ✅ CDN global
- ✅ HTTPS automatique

**Pas besoin de :**
- Docker
- Configuration serveur
- Gestion SSL
- Load balancing
- Scaling manuel

## 📝 APIs Disponibles

### Authentication
```typescript
// Login
POST /auth/v1/token?grant_type=password
Body: { email, password }

// Signup
POST /auth/v1/signup
Body: { email, password, options }

// Logout
POST /auth/v1/logout
```

### Edge Functions
```typescript
// Envoyer une notification
POST /functions/v1/send-notification
Body: { userId, type, titre, message, metadata }

// Chat avec l'IA
POST /functions/v1/chat-assistant
Body: { messages, conversationId }

// Envoyer un email
POST /functions/v1/send-email
Body: { to, subject, html, from }

// Envoyer un SMS
POST /functions/v1/send-sms
Body: { to, message }
```

### Database (via Supabase Client)
```typescript
// Exemple : Récupérer les dossiers
const { data, error } = await supabase
  .from('dossiers')
  .select('*')
  .eq('avocat_id', userId)

// Exemple : Créer une audience
const { data, error } = await supabase
  .from('audiences')
  .insert({
    dossier_id,
    date_audience,
    heure_debut,
    salle,
    type_audience
  })
```

## 🔐 Variables d'Environnement (Secrets)

### Secrets Supabase Automatiques
- `SUPABASE_URL` : URL du projet
- `SUPABASE_ANON_KEY` : Clé publique
- `SUPABASE_SERVICE_ROLE_KEY` : Clé admin
- `LOVABLE_API_KEY` : Accès à l'IA

### Secrets à Configurer
- `RESEND_API_KEY` : Pour les emails
- `TWILIO_ACCOUNT_SID` : Pour les SMS
- `TWILIO_AUTH_TOKEN` : Pour les SMS
- `TWILIO_PHONE_NUMBER` : Numéro d'envoi

## 📚 Prochaines Étapes

### 1. Activation (OBLIGATOIRE)
```bash
# Dans Lovable, activer Lovable Cloud
# Cela créera automatiquement :
# - Base de données PostgreSQL
# - Système d'authentification
# - Storage
# - Edge Functions
```

### 2. Appliquer les Migrations
```sql
-- Exécuter dans l'ordre les fichiers de supabase/migrations/
-- Via l'interface Lovable Cloud ou SQL Editor
```

### 3. Configurer les Secrets
```bash
# Via l'interface Lovable
# Settings → Secrets
# Ajouter : RESEND_API_KEY, TWILIO_*
```

### 4. Tester les Edge Functions
```bash
# Via le frontend ou curl
curl -X POST https://[projet].supabase.co/functions/v1/chat-assistant \
  -H "Authorization: Bearer [token]" \
  -H "Content-Type: application/json" \
  -d '{"messages": [{"role": "user", "content": "Bonjour"}]}'
```

### 5. Documentation API (À créer)
- [ ] Créer un fichier OpenAPI/Swagger
- [ ] Documenter chaque endpoint
- [ ] Ajouter des exemples de requêtes
- [ ] Publier sur un portail développeur

### 6. Tests (À implémenter)
```typescript
// Exemple de test Deno
Deno.test("send-notification should send notification", async () => {
  const response = await fetch("http://localhost:54321/functions/v1/send-notification", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId: "test-user-id",
      type: "audience_modifiee",
      titre: "Test",
      message: "Test notification"
    })
  });
  
  assertEquals(response.status, 200);
});
```

## 🎯 Avantages de Lovable Cloud

✅ **Pas de configuration serveur**
✅ **Scaling automatique**
✅ **Sécurité intégrée** (RLS, JWT, HTTPS)
✅ **Déploiement instantané**
✅ **Monitoring inclus**
✅ **Backup automatique**
✅ **CDN global**
✅ **Coûts optimisés** (pay-per-use)

## 🆚 vs Stack Traditionnelle

| Aspect | Node.js/Express | Lovable Cloud |
|--------|----------------|---------------|
| Setup initial | 2-3 jours | 5 minutes |
| Configuration serveur | Manuelle | Automatique |
| Scaling | Manuel | Automatique |
| Sécurité | À configurer | Intégrée |
| Maintenance | Continue | Minimale |
| Coûts fixes | Serveur 24/7 | Usage réel |
| Déploiement | CI/CD custom | Automatique |

## 📖 Ressources

- [Documentation Lovable Cloud](https://docs.lovable.dev/features/cloud)
- [Documentation Supabase](https://supabase.com/docs)
- [Deno Documentation](https://deno.land/manual)
- [Resend Documentation](https://resend.com/docs)
- [Twilio Documentation](https://www.twilio.com/docs)

## 🤝 Support

Pour toute question sur le backend :
1. Consulter ce document
2. Lire la documentation Lovable Cloud
3. Vérifier les logs dans Lovable
4. Contacter le support Lovable si nécessaire

---

**Note :** Ce backend est conçu pour être évolutif, sécurisé et facile à maintenir. L'architecture serverless de Lovable Cloud permet de se concentrer sur la logique métier plutôt que sur l'infrastructure.
