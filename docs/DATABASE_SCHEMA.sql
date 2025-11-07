-- ============================================
-- SCHÉMA COMPLET BASE DE DONNÉES E-JUSTICE
-- ============================================

-- 1. TYPES ÉNUMÉRÉS
-- ============================================

-- Rôles de l'application
CREATE TYPE public.app_role AS ENUM (
  'admin',
  'juge', 
  'greffier',
  'avocat',
  'procureur',
  'justiciable'
);

-- Statuts des dossiers
CREATE TYPE public.statut_dossier AS ENUM (
  'ouvert',
  'en_cours',
  'clos',
  'archive'
);

-- Types d'affaires
CREATE TYPE public.type_affaire AS ENUM (
  'penal',
  'civil',
  'commercial',
  'administratif',
  'social'
);

-- Types de parties
CREATE TYPE public.type_partie AS ENUM (
  'demandeur',
  'defendeur',
  'plaignant',
  'prevenu',
  'temoin'
);

-- Statuts des audiences
CREATE TYPE public.statut_audience AS ENUM (
  'programmee',
  'en_cours',
  'terminee',
  'reportee',
  'annulee'
);

-- Canaux de notification
CREATE TYPE public.canal_notification AS ENUM (
  'email',
  'sms',
  'whatsapp',
  'push'
);

-- Statuts des notifications
CREATE TYPE public.statut_notification AS ENUM (
  'en_attente',
  'envoye',
  'echoue',
  'lu'
);

-- Statuts des articles
CREATE TYPE public.statut_article AS ENUM (
  'brouillon',
  'publie',
  'archive'
);

-- 2. TABLES UTILISATEURS
-- ============================================

-- Table des rôles utilisateurs (SÉCURITÉ: table séparée pour éviter escalade de privilèges)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, role)
);

-- Table des profils utilisateurs
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nom TEXT NOT NULL,
  prenom TEXT NOT NULL,
  email TEXT NOT NULL,
  telephone TEXT,
  adresse TEXT,
  matricule TEXT UNIQUE, -- Pour les professionnels
  specialite TEXT, -- Pour avocats
  juridiction TEXT, -- Pour juges
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABLES DOSSIERS
-- ============================================

-- Table principale des dossiers
CREATE TABLE public.dossiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero_dossier TEXT UNIQUE NOT NULL,
  titre TEXT NOT NULL,
  description TEXT,
  type_affaire type_affaire NOT NULL,
  statut statut_dossier DEFAULT 'ouvert',
  date_ouverture TIMESTAMPTZ DEFAULT NOW(),
  date_cloture TIMESTAMPTZ,
  juge_id UUID REFERENCES auth.users(id),
  greffier_id UUID REFERENCES auth.users(id),
  procureur_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Parties au dossier
CREATE TABLE public.parties_dossier (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dossier_id UUID REFERENCES public.dossiers(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  type_partie type_partie NOT NULL,
  avocat_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Documents et pièces
CREATE TABLE public.pieces_dossier (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dossier_id UUID REFERENCES public.dossiers(id) ON DELETE CASCADE,
  titre TEXT NOT NULL,
  description TEXT,
  type_piece TEXT NOT NULL,
  fichier_url TEXT NOT NULL,
  fichier_nom TEXT NOT NULL,
  taille_fichier BIGINT,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Historique des dossiers
CREATE TABLE public.historique_dossier (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dossier_id UUID REFERENCES public.dossiers(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Commentaires sur dossiers
CREATE TABLE public.commentaires_dossier (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dossier_id UUID REFERENCES public.dossiers(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  commentaire TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABLES AUDIENCES
-- ============================================

-- Table principale des audiences
CREATE TABLE public.audiences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dossier_id UUID REFERENCES public.dossiers(id) ON DELETE CASCADE,
  numero_audience TEXT UNIQUE NOT NULL,
  date_heure TIMESTAMPTZ NOT NULL,
  salle TEXT NOT NULL,
  type_audience TEXT NOT NULL,
  statut statut_audience DEFAULT 'programmee',
  juge_id UUID REFERENCES auth.users(id),
  greffier_id UUID REFERENCES auth.users(id),
  duree_estimee INTEGER, -- en minutes
  ordre_jour TEXT,
  qr_code TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Participants aux audiences
CREATE TABLE public.participants_audience (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audience_id UUID REFERENCES public.audiences(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  role_participant TEXT NOT NULL,
  presence BOOLEAN DEFAULT FALSE,
  heure_arrivee TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Procès-verbaux
CREATE TABLE public.proces_verbaux (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audience_id UUID REFERENCES public.audiences(id) ON DELETE CASCADE,
  contenu TEXT NOT NULL,
  redige_par UUID REFERENCES auth.users(id),
  signe BOOLEAN DEFAULT FALSE,
  date_signature TIMESTAMPTZ,
  fichier_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. SYSTÈME DE NOTIFICATIONS
-- ============================================

-- Préférences de notifications
CREATE TABLE public.notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type_notification TEXT NOT NULL,
  email BOOLEAN DEFAULT TRUE,
  sms BOOLEAN DEFAULT FALSE,
  whatsapp BOOLEAN DEFAULT FALSE,
  push BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, type_notification)
);

-- Notifications
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type_notification TEXT NOT NULL,
  titre TEXT NOT NULL,
  message TEXT NOT NULL,
  canal canal_notification NOT NULL,
  statut statut_notification DEFAULT 'en_attente',
  metadata JSONB,
  lu BOOLEAN DEFAULT FALSE,
  date_lecture TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rappels automatiques
CREATE TABLE public.rappels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  type_rappel TEXT NOT NULL,
  reference_id UUID NOT NULL,
  date_rappel TIMESTAMPTZ NOT NULL,
  envoye BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. BLOG ET ACTUALITÉS
-- ============================================

-- Articles de blog
CREATE TABLE public.articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titre TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  contenu TEXT NOT NULL,
  extrait TEXT,
  image_url TEXT,
  auteur_id UUID REFERENCES auth.users(id),
  categorie TEXT NOT NULL,
  tags TEXT[],
  statut statut_article DEFAULT 'brouillon',
  date_publication TIMESTAMPTZ,
  vues INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Commentaires sur articles
CREATE TABLE public.commentaires_article (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID REFERENCES public.articles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  commentaire TEXT NOT NULL,
  modere BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. PAIEMENTS
-- ============================================

-- Paiements
CREATE TABLE public.paiements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  dossier_id UUID REFERENCES public.dossiers(id),
  montant DECIMAL(10,2) NOT NULL,
  devise TEXT DEFAULT 'XOF',
  statut TEXT NOT NULL,
  stripe_payment_id TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. AUDIT ET LOGS
-- ============================================

-- Logs d'audit
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. CHATBOT IA
-- ============================================

-- Base de connaissances chatbot
CREATE TABLE public.chatbot_knowledge (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  reponse TEXT NOT NULL,
  categorie TEXT,
  tags TEXT[],
  utilisation_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conversations chatbot
CREATE TABLE public.chatbot_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  session_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages chatbot
CREATE TABLE public.chatbot_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES public.chatbot_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. STORAGE BUCKETS
-- ============================================

-- Buckets seront créés via les migrations

-- 11. INDEX POUR PERFORMANCE
-- ============================================

-- Index dossiers
CREATE INDEX idx_dossiers_numero ON public.dossiers(numero_dossier);
CREATE INDEX idx_dossiers_statut ON public.dossiers(statut);
CREATE INDEX idx_dossiers_juge ON public.dossiers(juge_id);
CREATE INDEX idx_dossiers_type ON public.dossiers(type_affaire);

-- Index audiences
CREATE INDEX idx_audiences_date ON public.audiences(date_heure);
CREATE INDEX idx_audiences_numero ON public.audiences(numero_audience);
CREATE INDEX idx_audiences_dossier ON public.audiences(dossier_id);
CREATE INDEX idx_audiences_statut ON public.audiences(statut);

-- Index notifications
CREATE INDEX idx_notifications_user ON public.notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_statut ON public.notifications(statut);
CREATE INDEX idx_notifications_lu ON public.notifications(lu);

-- Index articles
CREATE INDEX idx_articles_slug ON public.articles(slug);
CREATE INDEX idx_articles_statut ON public.articles(statut);
CREATE INDEX idx_articles_date_publication ON public.articles(date_publication DESC);

-- Index audit
CREATE INDEX idx_audit_user ON public.audit_logs(user_id, created_at DESC);
CREATE INDEX idx_audit_table ON public.audit_logs(table_name, created_at DESC);

-- 12. VUES POUR STATISTIQUES
-- ============================================

-- Vue statistiques générales
CREATE OR REPLACE VIEW public.stats_generales AS
SELECT 
  (SELECT COUNT(*) FROM public.dossiers) as total_dossiers,
  (SELECT COUNT(*) FROM public.dossiers WHERE statut = 'en_cours') as dossiers_en_cours,
  (SELECT COUNT(*) FROM public.audiences WHERE date_heure > NOW()) as audiences_a_venir,
  (SELECT COUNT(*) FROM auth.users) as total_utilisateurs,
  (SELECT COUNT(*) FROM public.audiences WHERE date_heure::date = CURRENT_DATE) as audiences_aujourdhui;

-- Vue audiences publiques
CREATE OR REPLACE VIEW public.audiences_publiques AS
SELECT 
  a.numero_audience,
  a.date_heure,
  a.salle,
  a.type_audience,
  d.numero_dossier,
  d.type_affaire,
  a.statut
FROM public.audiences a
JOIN public.dossiers d ON a.dossier_id = d.id
WHERE a.date_heure::date = CURRENT_DATE
  AND a.statut IN ('programmee', 'en_cours')
ORDER BY a.date_heure;

-- 13. TRIGGERS
-- ============================================

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Appliquer le trigger sur les tables pertinentes
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.dossiers
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.audiences
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.articles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Trigger pour créer un profil automatiquement
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, nom, prenom, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nom', ''),
    COALESCE(NEW.raw_user_meta_data->>'prenom', ''),
    NEW.email
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger pour logger les actions dans historique_dossier
CREATE OR REPLACE FUNCTION public.log_dossier_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    INSERT INTO public.historique_dossier (dossier_id, user_id, action, details)
    VALUES (
      NEW.id,
      auth.uid(),
      'Modification dossier',
      jsonb_build_object(
        'old', to_jsonb(OLD),
        'new', to_jsonb(NEW)
      )
    );
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO public.historique_dossier (dossier_id, user_id, action, details)
    VALUES (
      NEW.id,
      auth.uid(),
      'Création dossier',
      to_jsonb(NEW)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER log_dossier_changes_trigger
  AFTER INSERT OR UPDATE ON public.dossiers
  FOR EACH ROW EXECUTE FUNCTION public.log_dossier_changes();
