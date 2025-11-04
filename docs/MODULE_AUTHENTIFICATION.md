# 🔐 MODULE D'AUTHENTIFICATION & GESTION DES UTILISATEURS

## Vue d'ensemble

Ce module fournit un système complet d'authentification et de gestion des utilisateurs pour la plateforme e-Justice Sénégal.

## ✨ Fonctionnalités implémentées

### 1. Authentification sécurisée

#### Connexion
- ✅ Validation de l'email et du mot de passe
- ✅ Messages d'erreur détaillés et sécurisés
- ✅ Journalisation automatique de toutes les tentatives de connexion
- ✅ Détection des tentatives de connexion échouées
- ✅ Redirection automatique selon le rôle de l'utilisateur
- ✅ Mise à jour du dernier accès

#### Inscription
- ✅ Formulaire complet avec validation
- ✅ Vérification de l'unicité de l'email
- ✅ Validation du format email
- ✅ Validation de la force du mot de passe (minimum 6 caractères)
- ✅ Validation du numéro de téléphone
- ✅ Attribution automatique de rôle
- ✅ Journalisation de la création de compte

### 2. Gestion des utilisateurs (Administration)

#### CRUD complet
- ✅ **Création** : Ajout de nouveaux utilisateurs avec tous les champs requis
- ✅ **Lecture** : Affichage de la liste complète des utilisateurs avec filtrage
- ✅ **Modification** : Édition des informations utilisateur
- ✅ **Suppression** : Suppression avec confirmation et journalisation

#### Fonctionnalités avancées
- ✅ Recherche par nom, prénom ou email
- ✅ Badges de rôles colorés pour identification rapide
- ✅ Validation des données (email, téléphone)
- ✅ Interface intuitive avec dialogues modaux
- ✅ Messages de confirmation pour chaque action

### 3. Profil utilisateur

#### Informations personnelles
- ✅ Photo de profil avec upload (simulé en mode local)
- ✅ Prénom, Nom
- ✅ Email
- ✅ Téléphone
- ✅ Tribunal d'affectation
- ✅ Rôle/Fonction (lecture seule)

#### Mode édition
- ✅ Activation/désactivation du mode édition
- ✅ Upload de photo avec prévisualisation
- ✅ Validation des modifications
- ✅ Annulation des changements
- ✅ Sauvegarde avec confirmation

#### Sécurité & Activité
- ✅ Affichage du dernier accès
- ✅ Historique des 5 dernières connexions
- ✅ Détails : date, heure, adresse IP
- ✅ Distinction visuelle connexion/déconnexion

### 4. Journalisation & Audit

#### Logs automatiques pour :
- ✅ Connexions réussies (avec détails de l'utilisateur)
- ✅ Tentatives de connexion échouées (email invalide ou mot de passe incorrect)
- ✅ Déconnexions
- ✅ Création d'utilisateurs
- ✅ Modification d'utilisateurs
- ✅ Suppression d'utilisateurs
- ✅ Création d'audiences
- ✅ Modification d'audiences
- ✅ Suppression d'audiences
- ✅ Création de dossiers
- ✅ Modification de dossiers

#### Page d'audit complète
- ✅ Vue chronologique avec timeline
- ✅ Filtrage par utilisateur
- ✅ Filtrage par période (aujourd'hui, 7 jours, 30 jours)
- ✅ Recherche dans les logs
- ✅ Détection automatique d'activités suspectes
- ✅ Alertes visuelles pour actions critiques
- ✅ Export CSV des logs
- ✅ Statistiques en temps réel

### 5. Gestion des rôles et permissions

#### Rôles disponibles
1. **Administrateur** (`admin`)
   - Gestion complète des utilisateurs
   - Accès aux logs d'audit
   - Statistiques système
   - Configuration

2. **Greffier** (`greffier`)
   - Création et gestion des audiences
   - Gestion des salles
   - Génération d'affichages

3. **Juge** (`juge`)
   - Consultation des audiences assignées
   - Rédaction de décisions
   - Accès aux dossiers

4. **Procureur** (`procureur`)
   - Suivi des affaires du ministère public
   - Accès aux réquisitoires
   - Consultation des audiences

5. **Avocat** (`avocat`)
   - Gestion des dossiers clients
   - Téléversement de pièces
   - Notifications d'audiences

6. **Justiciable** (`justiciable`)
   - Consultation de son affaire
   - Informations sur son audience
   - Accès au résumé du dossier

## 🔒 Sécurité

### Mesures implémentées

1. **Authentification**
   - Validation côté client et serveur (simulée)
   - Messages d'erreur génériques (pour éviter l'énumération d'utilisateurs)
   - Journalisation de toutes les tentatives

2. **Gestion des sessions**
   - Stockage sécurisé dans localStorage
   - Mise à jour automatique du dernier accès
   - Déconnexion manuelle avec journalisation

3. **Audit & Traçabilité**
   - Tous les événements sont tracés
   - Adresses IP enregistrées (simulées)
   - Détection d'activités suspectes (3+ tentatives échouées)
   - Timeline complète des actions

4. **Validation des données**
   - Format email vérifié
   - Numéro de téléphone validé
   - Mot de passe avec longueur minimale
   - Unicité des emails

## 📝 Comptes de test

Pour tester l'application, utilisez ces comptes :

| Email | Mot de passe | Rôle |
|-------|-------------|------|
| admin@justice.sn | 123456 | Administrateur |
| greffier@justice.sn | 123456 | Greffier |
| juge.ba@justice.sn | 123456 | Juge |
| procureur@justice.sn | 123456 | Procureur |
| avocat.sy@justice.sn | 123456 | Avocat |
| justiciable@justice.sn | 123456 | Justiciable |

⚠️ **Note** : Le mot de passe par défaut pour tous les nouveaux utilisateurs créés est `123456`

## 🎨 Interface utilisateur

### Caractéristiques
- ✅ Design moderne et responsive
- ✅ Animations fluides avec Framer Motion
- ✅ Feedback visuel pour toutes les actions
- ✅ Toasts de notification
- ✅ Thème cohérent avec le design system
- ✅ Support du mode sombre

### Pages principales
1. `/auth` - Page de connexion/inscription
2. `/profile` - Profil utilisateur avec historique de connexions
3. `/admin/users` - Gestion des utilisateurs (admin uniquement)
4. `/admin/audit` - Journal d'audit (admin uniquement)

## 🚀 Utilisation

### Connexion
1. Accédez à `/auth`
2. Entrez vos identifiants
3. Cliquez sur "Se connecter"
4. Vous êtes redirigé vers votre tableau de bord selon votre rôle

### Inscription
1. Accédez à `/auth`
2. Cliquez sur l'onglet "S'inscrire"
3. Remplissez tous les champs
4. Sélectionnez votre rôle
5. Cliquez sur "S'inscrire"

### Modification du profil
1. Accédez à `/profile`
2. Cliquez sur "Modifier le profil"
3. Modifiez les informations souhaitées
4. Cliquez sur "Enregistrer"

### Gestion des utilisateurs (Admin)
1. Accédez à `/admin/users`
2. Pour créer : Cliquez sur "Nouvel utilisateur"
3. Pour modifier : Cliquez sur le menu (⋮) puis "Modifier"
4. Pour supprimer : Cliquez sur le menu (⋮) puis "Supprimer"

### Consultation des logs (Admin)
1. Accédez à `/admin/audit`
2. Utilisez la recherche pour filtrer
3. Cliquez sur "Filtres" pour affiner par utilisateur ou période
4. Exportez en CSV si nécessaire

## 🔄 Évolutions futures

### Prochaines fonctionnalités
- [ ] Authentification à deux facteurs (2FA)
- [ ] Réinitialisation de mot de passe par email
- [ ] Gestion de sessions multiples
- [ ] Verrouillage de compte après X tentatives échouées
- [ ] Politique de mot de passe renforcée
- [ ] Upload de photo vers un service cloud
- [ ] Notifications en temps réel
- [ ] Intégration avec un vrai backend (Lovable Cloud/Supabase)

## 📚 Technologies utilisées

- **React** - Framework frontend
- **TypeScript** - Typage statique
- **Tailwind CSS** - Framework CSS
- **shadcn/ui** - Composants UI
- **Framer Motion** - Animations
- **React Router** - Navigation
- **Context API** - Gestion d'état globale

## 🎯 Architecture

```
src/
├── contexts/
│   └── AppContext.tsx          # État global, authentification, CRUD
├── pages/
│   ├── Auth.tsx                # Connexion/Inscription
│   ├── common/
│   │   └── Profile.tsx         # Profil utilisateur
│   └── admin/
│       ├── Users.tsx           # Gestion des utilisateurs
│       └── Audit.tsx           # Journal d'audit
├── components/
│   ├── DashboardLayout.tsx     # Layout principal
│   ├── ProtectedRoute.tsx      # Protection des routes
│   └── ui/                     # Composants shadcn
└── hooks/
    └── use-toast.ts            # Hook pour notifications
```

## 📞 Support

Pour toute question ou problème, consultez :
- La documentation complète dans `/docs`
- Les commentaires dans le code source
- Les types TypeScript pour les interfaces

---

**Version** : 1.0.0  
**Dernière mise à jour** : Février 2025  
**Auteur** : e-Justice Sénégal
