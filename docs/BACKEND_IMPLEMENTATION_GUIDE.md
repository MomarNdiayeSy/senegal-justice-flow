# Guide d'Implémentation Backend - e-Justice Sénégal

## 📋 Vue d'ensemble

Ce guide explique comment utiliser les fichiers backend créés pour implémenter la plateforme e-Justice Sénégal avec Lovable Cloud (Supabase).

## 📁 Structure des Fichiers

```
supabase/
├── migrations/              # Migrations SQL pour la base de données
│   ├── 20250101000001_initial_schema.sql
│   ├── 20250101000002_rls_security_functions.sql
│   ├── 20250101000003_dossiers_tables.sql
│   ├── 20250101000004_dossiers_rls_policies.sql
│   ├── 20250101000005_audiences_tables.sql
│   ├── 20250101000006_audiences_rls_policies.sql
│   ├── 20250101000007_notifications_tables.sql
│   ├── 20250101000008_notifications_rls_policies.sql
│   ├── 20250101000009_blog_tables.sql
│   ├── 20250101000010_blog_rls_policies.sql
│   ├── 20250101000011_autres_tables.sql
│   └── 20250101000012_storage_buckets.sql
├── functions/              # Edge Functions
│   ├── send-notification/
│   ├── chat-assistant/
│   ├── send-email/
│   └── send-sms/
└── config.toml            # Configuration Supabase

docs/
├── DATABASE_SCHEMA.sql    # Schéma complet de la base de données
├── BACKEND_ROADMAP.md     # Feuille de route détaillée
└── BACKEND_IMPLEMENTATION_GUIDE.md  # Ce fichier
```

## 🚀 Étapes d'Implémentation

### 1. Activer Lovable Cloud

1. Dans votre projet Lovable, activez Lovable Cloud
2. Cela créera automatiquement une instance Supabase

### 2. Appliquer les Migrations SQL

Les migrations sont numérotées dans l'ordre d'exécution. Appliquez-les dans l'ordre :

#### Migration 1 : Schéma Initial
- Crée les types énumérés de base
- Crée les tables `user_roles` et `profiles`
- Configure les triggers pour la création automatique de profils

#### Migration 2 : Fonctions de Sécurité
- Crée la fonction `has_role()` (SECURITY DEFINER)
- Configure les policies RLS pour `user_roles` et `profiles`

#### Migration 3 : Tables Dossiers
- Crée toutes les tables liées aux dossiers
- Configure les index pour la performance
- Ajoute les triggers de logging

#### Migration 4 : Policies RLS Dossiers
- Configure toutes les policies d'accès pour les dossiers
- Définit les permissions par rôle

#### Migration 5 : Tables Audiences
- Crée les tables d'audiences, participants et PV
- Crée la vue publique `audiences_publiques`

#### Migration 6 : Policies RLS Audiences
- Configure les accès aux audiences par rôle

#### Migration 7 : Tables Notifications
- Crée le système complet de notifications
- Ajoute la fonction `send_notification()`
- Crée les préférences par défaut

#### Migration 8 : Policies RLS Notifications
- Configure les accès aux notifications

#### Migration 9 : Tables Blog
- Crée les tables articles et commentaires
- Ajoute les triggers de génération de slug

#### Migration 10 : Policies RLS Blog
- Configure l'accès public aux articles publiés

#### Migration 11 : Autres Tables
- Crée les tables paiements, audit, chatbot
- Crée la vue `stats_generales`

#### Migration 12 : Storage Buckets
- Crée les buckets de stockage
- Configure les policies d'accès aux fichiers

### 3. Configurer les Secrets

Dans les paramètres Lovable Cloud, ajoutez les secrets suivants :

```bash
# Pour les emails (Resend)
RESEND_API_KEY=votre_cle_resend

# Pour les SMS (Twilio) - optionnel
TWILIO_ACCOUNT_SID=votre_account_sid
TWILIO_AUTH_TOKEN=votre_auth_token
TWILIO_PHONE_NUMBER=votre_numero_twilio

# Lovable AI (déjà configuré automatiquement)
LOVABLE_API_KEY=auto_genere
```

### 4. Déployer les Edge Functions

Les edge functions sont déjà créées dans `supabase/functions/`. Elles seront déployées automatiquement.

#### send-notification
- Envoie des notifications selon les préférences utilisateur
- Utilise la fonction SQL `send_notification()`

#### chat-assistant
- Chatbot IA utilisant Lovable AI (Gemini Flash)
- Streaming des réponses en temps réel
- Contexte e-Justice intégré

#### send-email
- Envoi d'emails via Resend
- Utilisé par le système de notifications

#### send-sms
- Envoi de SMS via Twilio
- Utilisé par le système de notifications

### 5. Créer un Utilisateur Admin Initial

Après l'installation, créez un premier utilisateur admin :

```sql
-- 1. Créer l'utilisateur (via l'interface Supabase ou signup)
-- 2. Lui attribuer le rôle admin
INSERT INTO public.user_roles (user_id, role)
VALUES ('uuid-de-lutilisateur', 'admin');
```

## 🔐 Sécurité

### Row Level Security (RLS)

Toutes les tables ont le RLS activé. Les policies définissent :

- **Admin** : Accès complet à tout
- **Greffier** : Création et gestion des dossiers/audiences
- **Juge** : Accès aux dossiers/audiences assignés
- **Procureur** : Accès aux dossiers assignés
- **Avocat** : Accès aux dossiers de leurs clients
- **Justiciable** : Accès à leurs propres dossiers

### Fonction has_role()

```sql
-- Vérifier si un utilisateur a un rôle
SELECT public.has_role(auth.uid(), 'admin');
```

Cette fonction est `SECURITY DEFINER` pour éviter les problèmes de récursion RLS.

## 📊 Vues Importantes

### stats_generales
Statistiques globales de la plateforme :
```sql
SELECT * FROM public.stats_generales;
```

### audiences_publiques
Audiences du jour pour l'affichage public :
```sql
SELECT * FROM public.audiences_publiques;
```

## 🔔 Système de Notifications

### Envoyer une Notification

```typescript
// Via l'edge function
const { data, error } = await supabase.functions.invoke('send-notification', {
  body: {
    userId: 'uuid',
    type: 'audience_programmee',
    titre: 'Nouvelle audience',
    message: 'Vous avez une audience programmée le...',
    metadata: { audienceId: 'uuid' }
  }
});

// Via SQL directement
SELECT public.send_notification(
  'uuid-utilisateur',
  'audience_programmee',
  'Nouvelle audience',
  'Vous avez une audience programmée le...',
  '{"audienceId": "uuid"}'::jsonb
);
```

### Types de Notifications

Les 12 types disponibles :
1. `audience_programmee`
2. `audience_modifiee`
3. `audience_annulee`
4. `rappel_audience`
5. `dossier_cree`
6. `dossier_clos`
7. `piece_ajoutee`
8. `decision_rendue`
9. `convocation_recue`
10. `echeance_proche`
11. `commentaire_ajoute`
12. `assignation_nouveau_dossier`

## 🤖 Chatbot IA

### Utilisation

```typescript
// Appeler le chatbot
const { data, error } = await supabase.functions.invoke('chat-assistant', {
  body: {
    messages: [
      { role: 'user', content: 'Comment créer un dossier ?' }
    ]
  }
});
```

Le chatbot utilise Lovable AI (Gemini Flash) avec un contexte spécifique e-Justice.

## 📦 Storage

### Buckets Créés

1. **avatars** (public) - Photos de profil
2. **dossiers-documents** (privé) - Documents des dossiers
3. **articles-images** (public) - Images des articles
4. **proces-verbaux** (privé) - Fichiers PV

### Upload d'un Fichier

```typescript
const { data, error } = await supabase.storage
  .from('dossiers-documents')
  .upload(`${dossierId}/${filename}`, file);
```

## 🧪 Tests et Validation

### 1. Vérifier les Tables

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

### 2. Vérifier les Policies RLS

```sql
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';
```

### 3. Tester les Rôles

```sql
-- Créer un utilisateur test
-- Lui assigner un rôle
-- Vérifier l'accès aux données
```

## 📈 Monitoring

### Logs d'Audit

Toutes les actions sur les dossiers sont loggées :

```sql
SELECT * FROM public.audit_logs
ORDER BY created_at DESC
LIMIT 100;
```

### Historique des Dossiers

```sql
SELECT * FROM public.historique_dossier
WHERE dossier_id = 'uuid'
ORDER BY created_at DESC;
```

## 🔄 Maintenance

### Backup

Les backups sont automatiques avec Lovable Cloud.

### Ajouter un Nouveau Type de Notification

1. Ajouter le type dans les préférences par défaut
2. Mettre à jour la fonction `create_default_notification_preferences()`
3. Documenter le nouveau type

### Ajouter une Nouvelle Table

1. Créer une nouvelle migration SQL
2. Activer le RLS : `ALTER TABLE ... ENABLE ROW LEVEL SECURITY;`
3. Créer les policies RLS appropriées
4. Ajouter les index nécessaires

## 🆘 Dépannage

### Erreur "infinite recursion in RLS"
➡️ Utilisez la fonction `has_role()` au lieu de queries directes dans les policies

### Les données ne s'affichent pas
➡️ Vérifiez que le RLS est activé et que les policies sont correctes

### Edge function timeout
➡️ Vérifiez les logs dans l'onglet Functions de Supabase

## 📚 Ressources

- [Documentation Lovable Cloud](https://docs.lovable.dev/features/cloud)
- [Documentation Supabase](https://supabase.com/docs)
- [BACKEND_ROADMAP.md](./BACKEND_ROADMAP.md) - Feuille de route complète

## ✅ Checklist de Déploiement

- [ ] Lovable Cloud activé
- [ ] Migrations SQL appliquées dans l'ordre
- [ ] Secrets configurés (RESEND_API_KEY minimum)
- [ ] Premier utilisateur admin créé
- [ ] Edge functions déployées
- [ ] Storage buckets créés
- [ ] Tests de sécurité RLS effectués
- [ ] Documentation utilisateur rédigée

---

**Version:** 1.0  
**Date:** 2025-01-07  
**Équipe:** e-Justice Sénégal
