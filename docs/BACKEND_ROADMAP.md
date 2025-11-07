# Feuille de Route Backend - e-Justice Sénégal

## Vue d'ensemble

Ce document détaille toutes les fonctionnalités backend à développer pour la plateforme e-Justice Sénégal. Le backend sera implémenté avec Lovable Cloud (Supabase).

---

## 1. Authentification et Gestion des Utilisateurs

### 1.1 Système d'Authentification
- [ ] **Inscription des utilisateurs**
  - Validation email
  - Confirmation par email
  - Validation des données (email, mot de passe fort)
  
- [ ] **Connexion**
  - Authentification email/mot de passe
  - Session management
  - JWT tokens
  - Rate limiting pour prévenir les attaques
  
- [ ] **Réinitialisation de mot de passe**
  - Email de réinitialisation
  - Token sécurisé à durée limitée
  - Validation du nouveau mot de passe

- [ ] **Authentification à deux facteurs (2FA)**
  - SMS OTP
  - Email OTP
  - Application authenticator

### 1.2 Gestion des Rôles et Permissions

#### Tables à créer:
```sql
-- Table des rôles
create type public.app_role as enum (
  'admin',
  'juge', 
  'greffier',
  'avocat',
  'procureur',
  'justiciable'
);

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  created_at timestamp with time zone default now(),
  unique (user_id, role)
);
```

- [ ] **Fonction de vérification de rôle**
  - Security definer function pour éviter RLS récursif
  - Vérification côté serveur uniquement
  
- [ ] **Policies RLS par rôle**
  - Admin: accès complet
  - Juge: gestion audiences et décisions
  - Greffier: enregistrement et gestion administrative
  - Avocat: accès dossiers clients
  - Procureur: gestion poursuites
  - Justiciable: consultation dossiers personnels

### 1.3 Profils Utilisateurs

#### Table profiles:
```sql
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nom text not null,
  prenom text not null,
  email text not null,
  telephone text,
  adresse text,
  matricule text unique, -- Pour les professionnels
  specialite text, -- Pour avocats
  juridiction text, -- Pour juges
  avatar_url text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);
```

- [ ] Création automatique du profil à l'inscription
- [ ] Mise à jour du profil
- [ ] Upload d'avatar (Supabase Storage)
- [ ] Historique des modifications

---

## 2. Gestion des Dossiers

### 2.1 Structure des Dossiers

#### Table dossiers:
```sql
create type public.statut_dossier as enum (
  'ouvert',
  'en_cours',
  'clos',
  'archive'
);

create type public.type_affaire as enum (
  'penal',
  'civil',
  'commercial',
  'administratif',
  'social'
);

create table public.dossiers (
  id uuid primary key default gen_random_uuid(),
  numero_dossier text unique not null,
  titre text not null,
  description text,
  type_affaire type_affaire not null,
  statut statut_dossier default 'ouvert',
  date_ouverture timestamp with time zone default now(),
  date_cloture timestamp with time zone,
  juge_id uuid references auth.users(id),
  greffier_id uuid references auth.users(id),
  procureur_id uuid references auth.users(id),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);
```

- [ ] **CRUD dossiers**
  - Création par greffier
  - Lecture selon rôle
  - Mise à jour statut
  - Archivage

- [ ] **Assignation des acteurs**
  - Juge
  - Greffier
  - Procureur
  - Avocats

- [ ] **Parties au dossier**
```sql
create type public.type_partie as enum (
  'demandeur',
  'defendeur',
  'plaignant',
  'prevenu',
  'temoin'
);

create table public.parties_dossier (
  id uuid primary key default gen_random_uuid(),
  dossier_id uuid references public.dossiers(id) on delete cascade,
  user_id uuid references auth.users(id),
  type_partie type_partie not null,
  avocat_id uuid references auth.users(id),
  created_at timestamp with time zone default now()
);
```

### 2.2 Documents et Pièces

#### Table pieces_dossier:
```sql
create table public.pieces_dossier (
  id uuid primary key default gen_random_uuid(),
  dossier_id uuid references public.dossiers(id) on delete cascade,
  titre text not null,
  description text,
  type_piece text not null,
  fichier_url text not null,
  fichier_nom text not null,
  taille_fichier bigint,
  uploaded_by uuid references auth.users(id),
  created_at timestamp with time zone default now()
);
```

- [ ] **Upload de documents**
  - Supabase Storage pour fichiers
  - Validation type de fichier (PDF, DOC, images)
  - Limite de taille
  - Scan antivirus

- [ ] **Gestion des pièces**
  - Ajout/suppression
  - Téléchargement sécurisé
  - Versionning
  - Signature électronique

### 2.3 Historique et Commentaires

```sql
create table public.historique_dossier (
  id uuid primary key default gen_random_uuid(),
  dossier_id uuid references public.dossiers(id) on delete cascade,
  user_id uuid references auth.users(id),
  action text not null,
  details jsonb,
  created_at timestamp with time zone default now()
);

create table public.commentaires_dossier (
  id uuid primary key default gen_random_uuid(),
  dossier_id uuid references public.dossiers(id) on delete cascade,
  user_id uuid references auth.users(id),
  commentaire text not null,
  created_at timestamp with time zone default now()
);
```

- [ ] Logging automatique des actions
- [ ] Commentaires par acteurs autorisés
- [ ] Notifications sur nouveau commentaire

---

## 3. Gestion des Audiences

### 3.1 Planification des Audiences

#### Table audiences:
```sql
create type public.statut_audience as enum (
  'programmee',
  'en_cours',
  'terminee',
  'reportee',
  'annulee'
);

create table public.audiences (
  id uuid primary key default gen_random_uuid(),
  dossier_id uuid references public.dossiers(id) on delete cascade,
  numero_audience text unique not null,
  date_heure timestamp with time zone not null,
  salle text not null,
  type_audience text not null,
  statut statut_audience default 'programmee',
  juge_id uuid references auth.users(id),
  greffier_id uuid references auth.users(id),
  duree_estimee integer, -- en minutes
  ordre_jour text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);
```

- [ ] **Création d'audience**
  - Vérification disponibilité salle
  - Vérification disponibilité juge
  - Génération QR code
  
- [ ] **Modification/Report**
  - Notifications automatiques aux parties
  - Historique des modifications
  
- [ ] **Annulation**
  - Motif obligatoire
  - Notification à tous les participants

### 3.2 Participants aux Audiences

```sql
create table public.participants_audience (
  id uuid primary key default gen_random_uuid(),
  audience_id uuid references public.audiences(id) on delete cascade,
  user_id uuid references auth.users(id),
  role_participant text not null,
  presence boolean default false,
  heure_arrivee timestamp with time zone,
  created_at timestamp with time zone default now()
);
```

- [ ] Gestion de la liste des participants
- [ ] Enregistrement de présence
- [ ] Convocations automatiques

### 3.3 Procès-Verbaux

```sql
create table public.proces_verbaux (
  id uuid primary key default gen_random_uuid(),
  audience_id uuid references public.audiences(id) on delete cascade,
  contenu text not null,
  redige_par uuid references auth.users(id),
  signe boolean default false,
  date_signature timestamp with time zone,
  fichier_url text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);
```

- [ ] Rédaction par greffier
- [ ] Signature électronique
- [ ] Génération PDF
- [ ] Archivage automatique

---

## 4. Système de Notifications

### 4.1 Configuration des Notifications

#### Table notification_preferences:
```sql
create type public.canal_notification as enum (
  'email',
  'sms',
  'whatsapp',
  'push'
);

create table public.notification_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  type_notification text not null,
  email boolean default true,
  sms boolean default false,
  whatsapp boolean default false,
  push boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique (user_id, type_notification)
);
```

### 4.2 Types de Notifications

Les 12 types à implémenter:

1. **audience_programmee** - Nouvelle audience planifiée
2. **audience_modifiee** - Modification d'audience
3. **audience_annulee** - Annulation d'audience
4. **rappel_audience** - Rappel 24h avant
5. **dossier_cree** - Création d'un nouveau dossier
6. **dossier_clos** - Clôture d'un dossier
7. **piece_ajoutee** - Nouveau document ajouté
8. **decision_rendue** - Décision de justice rendue
9. **convocation_recue** - Convocation reçue
10. **echeance_proche** - Échéance imminente
11. **commentaire_ajoute** - Nouveau commentaire
12. **assignation_nouveau_dossier** - Assignation à un dossier

### 4.3 Table des Notifications

```sql
create type public.statut_notification as enum (
  'en_attente',
  'envoye',
  'echoue',
  'lu'
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  type_notification text not null,
  titre text not null,
  message text not null,
  canal canal_notification not null,
  statut statut_notification default 'en_attente',
  metadata jsonb,
  lu boolean default false,
  date_lecture timestamp with time zone,
  created_at timestamp with time zone default now()
);
```

### 4.4 Edge Functions pour Notifications

- [ ] **send-email**
  - Intégration SendGrid ou Resend
  - Templates HTML
  - Tracking d'ouverture
  
- [ ] **send-sms**
  - Intégration Twilio
  - Gestion des crédits SMS
  - Fallback si échec
  
- [ ] **send-whatsapp**
  - Twilio WhatsApp Business API
  - Templates pré-approuvés
  
- [ ] **notification-scheduler**
  - Cron job pour rappels
  - Envoi différé
  - Retry en cas d'échec

### 4.5 Système de Rappels Automatiques

```sql
create table public.rappels (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  type_rappel text not null,
  reference_id uuid not null, -- ID de l'audience/dossier
  date_rappel timestamp with time zone not null,
  envoye boolean default false,
  created_at timestamp with time zone default now()
);
```

- [ ] Rappel 24h avant audience
- [ ] Rappel échéance dossier
- [ ] Rappel documents à fournir

---

## 5. Affichage Public

### 5.1 Rôles Anonymes

- [ ] Table pour sessions d'affichage public
- [ ] Génération de tokens temporaires
- [ ] Limitation des données affichées

### 5.2 API Publique

```sql
-- Vue publique des audiences du jour
create view public.audiences_publiques as
select 
  a.numero_audience,
  a.date_heure,
  a.salle,
  a.type_audience,
  d.numero_dossier,
  d.type_affaire
from public.audiences a
join public.dossiers d on a.dossier_id = d.id
where a.date_heure::date = current_date
  and a.statut = 'programmee';
```

- [ ] Edge function pour affichage public
- [ ] Mise à jour en temps réel
- [ ] QR code pour accès direct

---

## 6. Blog et Actualités

### 6.1 Gestion du Blog

#### Table articles:
```sql
create type public.statut_article as enum (
  'brouillon',
  'publie',
  'archive'
);

create table public.articles (
  id uuid primary key default gen_random_uuid(),
  titre text not null,
  slug text unique not null,
  contenu text not null,
  extrait text,
  image_url text,
  auteur_id uuid references auth.users(id),
  categorie text not null,
  tags text[],
  statut statut_article default 'brouillon',
  date_publication timestamp with time zone,
  vues integer default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);
```

- [ ] **CRUD articles**
  - Création (admin/greffier)
  - Édition avec preview
  - Publication programmée
  - Archivage
  
- [ ] **Catégories et tags**
  - Gestion des catégories
  - Recherche par tag
  - Filtrage
  
- [ ] **Commentaires**
```sql
create table public.commentaires_article (
  id uuid primary key default gen_random_uuid(),
  article_id uuid references public.articles(id) on delete cascade,
  user_id uuid references auth.users(id),
  commentaire text not null,
  modere boolean default false,
  created_at timestamp with time zone default now()
);
```

- [ ] **Statistiques**
  - Compteur de vues
  - Articles populaires
  - Analytics

---

## 7. Statistiques et Rapports (Admin)

### 7.1 Dashboard Statistiques

- [ ] **Statistiques générales**
```sql
-- Vue pour stats admin
create view public.stats_generales as
select 
  (select count(*) from public.dossiers) as total_dossiers,
  (select count(*) from public.dossiers where statut = 'en_cours') as dossiers_en_cours,
  (select count(*) from public.audiences where date_heure > now()) as audiences_a_venir,
  (select count(*) from auth.users) as total_utilisateurs;
```

- [ ] **Rapports périodiques**
  - Rapport mensuel automatique
  - Rapport annuel
  - Export PDF/Excel
  
- [ ] **Analytics temps réel**
  - Utilisateurs actifs
  - Actions en cours
  - Performance système

### 7.2 Logs d'Audit

```sql
create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  action text not null,
  table_name text not null,
  record_id uuid,
  old_values jsonb,
  new_values jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone default now()
);
```

- [ ] Logging automatique via trigger
- [ ] Recherche et filtrage
- [ ] Export pour conformité
- [ ] Rétention selon politique

---

## 8. Intégrations Externes

### 8.1 Système de Paiement (Stripe)

- [ ] **Edge function stripe-checkout**
  - Paiement des amendes
  - Frais de justice
  - Webhooks pour confirmation
  
- [ ] **Table paiements**
```sql
create table public.paiements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  dossier_id uuid references public.dossiers(id),
  montant decimal(10,2) not null,
  devise text default 'XOF',
  statut text not null,
  stripe_payment_id text,
  created_at timestamp with time zone default now()
);
```

### 8.2 Signature Électronique

- [ ] Intégration DocuSign ou solution locale
- [ ] Validation des signatures
- [ ] Certificats numériques

### 8.3 Archivage Légal

- [ ] Conformité normes archivage
- [ ] Export pour administration
- [ ] Sauvegarde hors site

---

## 9. Chatbot IA (Lovable AI)

### 9.1 Edge Function Chat

- [ ] **chat-assistant**
  - Utilisation Lovable AI Gateway
  - Modèle: google/gemini-2.5-flash
  - Context: documentation judiciaire sénégalaise
  - Streaming des réponses
  
- [ ] **Fonctionnalités**
  - FAQ automatique
  - Recherche de jurisprudence
  - Explication des procédures
  - Assistance navigation

### 9.2 Base de Connaissances

```sql
create table public.chatbot_knowledge (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  reponse text not null,
  categorie text,
  tags text[],
  utilisation_count integer default 0,
  created_at timestamp with time zone default now()
);
```

---

## 10. Sécurité et Performance

### 10.1 Sécurité

- [ ] **RLS (Row Level Security)**
  - Policies par table
  - Fonction has_role pour éviter récursion
  - Tests complets
  
- [ ] **Rate Limiting**
  - Limitation par endpoint
  - Protection DDoS
  - Throttling utilisateur
  
- [ ] **Validation des données**
  - Backend validation
  - SQL injection prevention
  - XSS protection
  
- [ ] **Audit de sécurité**
  - Scan régulier
  - Mise à jour dépendances
  - Penetration testing

### 10.2 Performance

- [ ] **Indexation**
```sql
-- Indexes pour performance
create index idx_dossiers_numero on public.dossiers(numero_dossier);
create index idx_audiences_date on public.audiences(date_heure);
create index idx_notifications_user on public.notifications(user_id, created_at);
```

- [ ] **Caching**
  - Cache Redis pour données fréquentes
  - CDN pour assets statiques
  - Query caching
  
- [ ] **Monitoring**
  - APM (Application Performance Monitoring)
  - Alerts sur erreurs
  - Métriques temps réel

---

## 11. Backup et Disaster Recovery

### 11.1 Sauvegardes

- [ ] **Base de données**
  - Backup quotidien automatique
  - Point-in-time recovery
  - Réplication
  
- [ ] **Fichiers (Storage)**
  - Backup des documents
  - Versionning
  - Geo-redundancy

### 11.2 Plan de Reprise

- [ ] Documentation procédures
- [ ] Tests de restauration
- [ ] RTO/RPO définis

---

## 12. Tests et CI/CD

### 12.1 Tests

- [ ] **Tests unitaires**
  - Edge functions
  - Policies RLS
  - Fonctions SQL
  
- [ ] **Tests d'intégration**
  - Workflows complets
  - API endpoints
  
- [ ] **Tests de charge**
  - Performance sous charge
  - Scalabilité

### 12.2 Déploiement

- [ ] Pipeline CI/CD
- [ ] Environnements (dev, staging, prod)
- [ ] Migrations automatiques
- [ ] Rollback strategy

---

## Priorités de Développement

### Phase 1 (MVP) - 4 semaines
1. ✅ Authentification de base
2. ✅ Gestion des rôles
3. Profils utilisateurs
4. CRUD dossiers basique
5. Planification audiences

### Phase 2 - 4 semaines
6. Notifications email/SMS
7. Upload documents
8. Procès-verbaux
9. Affichage public
10. Blog

### Phase 3 - 4 semaines
11. Statistiques admin
12. Audit logs
13. Chatbot IA
14. Paiements
15. Rapports avancés

### Phase 4 - 4 semaines
16. Signature électronique
17. Archivage légal
18. Optimisations performance
19. Tests de sécurité
20. Documentation complète

---

## Ressources Nécessaires

### Services Externes
- **Lovable Cloud** (Supabase) - Base de données et backend
- **Lovable AI** - Chatbot intelligent
- **SendGrid** ou **Resend** - Emails transactionnels
- **Twilio** - SMS et WhatsApp
- **Stripe** - Paiements en ligne
- **CDN** - Distribution de contenu

### Secrets à Configurer
```bash
SENDGRID_API_KEY=xxx
TWILIO_ACCOUNT_SID=xxx
TWILIO_AUTH_TOKEN=xxx
STRIPE_SECRET_KEY=xxx
STRIPE_WEBHOOK_SECRET=xxx
```

---

## Conformité et Réglementation

### RGPD et Protection des Données
- [ ] Consentement utilisateur
- [ ] Droit à l'oubli
- [ ] Portabilité des données
- [ ] Registre des traitements

### Conformité Juridique Sénégalaise
- [ ] Loi sur la signature électronique
- [ ] Archivage légal des décisions
- [ ] Confidentialité des données judiciaires
- [ ] Accès contrôlé information sensible

---

## Maintenance et Support

### Documentation
- [ ] Guide administrateur
- [ ] Guide utilisateur par rôle
- [ ] API documentation
- [ ] Guide de dépannage

### Support
- [ ] Ticketing system
- [ ] Formation utilisateurs
- [ ] Hotline technique
- [ ] FAQ évolutive

---

## Métriques de Succès

### KPIs Techniques
- Uptime > 99.9%
- Response time < 200ms
- Zéro data loss
- 100% des audits sécurité passés

### KPIs Métier
- Réduction 50% temps traitement dossier
- 90% satisfaction utilisateurs
- 100% audiences digitalisées
- Adoption 80% acteurs judiciaires

---

**Document maintenu par:** Équipe Développement e-Justice
**Dernière mise à jour:** 2025-01-07
**Version:** 1.0
