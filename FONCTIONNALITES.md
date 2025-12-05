# 📚 GUIDE DES FONCTIONNALITÉS - e-Justice Sénégal

Ce document décrit en détail toutes les fonctionnalités développées pour la plateforme e-Justice Sénégal (SmartCourt).

---

## 📋 Table des matières

1. [Authentification et Gestion des Comptes](#1-authentification-et-gestion-des-comptes)
2. [Tableau de Bord par Rôle](#2-tableau-de-bord-par-rôle)
3. [Gestion des Dossiers](#3-gestion-des-dossiers)
4. [Gestion des Audiences](#4-gestion-des-audiences)
5. [Système de Notifications](#5-système-de-notifications)
6. [Gestion des Décisions](#6-gestion-des-décisions)
7. [Instructions Juge → Greffe](#7-instructions-juge--greffe)
8. [Gestion des Salles](#8-gestion-des-salles)
9. [Affichage Numérique Public](#9-affichage-numérique-public)
10. [Statistiques et Rapports](#10-statistiques-et-rapports)
11. [Blog et Actualités](#11-blog-et-actualités)
12. [Chatbot IA](#12-chatbot-ia)

---

## 1. Authentification et Gestion des Comptes

### 1.1 Inscription des utilisateurs

**Chemin** : `/auth` → Onglet "S'inscrire"

**Fonctionnement** :
- L'utilisateur remplit le formulaire avec : Prénom, Nom, Email, Téléphone, Mot de passe, Rôle
- Le champ **Tribunal** apparaît uniquement pour les rôles : Greffier, Juge, Procureur
- Le rôle **Administrateur** n'est pas disponible à l'inscription publique (sécurité)
- Le compte est créé avec le statut **inactif** par défaut

**Workflow d'activation** :
```
Utilisateur s'inscrit → Compte inactif créé → Notification aux greffiers
                                                      ↓
Utilisateur reçoit email ← Greffier active le compte ← Greffier vérifie
```

**Notifications automatiques** :
- ✉️ Email envoyé à tous les greffiers avec les détails du nouveau compte
- 🔔 Notification in-app aux greffiers
- 💬 Message toast à l'utilisateur : "Vous recevrez un email dès que votre compte sera activé"

### 1.2 Connexion

**Chemin** : `/auth` → Onglet "Connexion"

**Vérifications effectuées** :
1. Email existe dans la base
2. Mot de passe correct
3. **Compte actif** (sinon : "Votre compte n'est pas encore activé")

**Après connexion** :
- Redirection automatique vers le tableau de bord correspondant au rôle
- Mise à jour du "dernier accès" dans le profil

### 1.3 Activation des comptes (Greffier/Admin)

**Chemin** : `/greffier/users` ou `/admin/users`

**Actions disponibles** :
| Bouton | Couleur | Action |
|--------|---------|--------|
| ✓ Activer | Vert | Active le compte, envoie email à l'utilisateur |
| ✗ Désactiver | Orange | Suspend le compte, l'utilisateur ne peut plus se connecter |
| ✎ Modifier | Gris | Ouvre le formulaire de modification |
| 🗑 Supprimer | Rouge | Supprime définitivement (Admin uniquement) |

**Restrictions par rôle** :
- **Greffier** : Peut gérer Juge, Procureur, Avocat, Justiciable
- **Admin** : Peut gérer tous les rôles

**Email d'activation** :
Quand un greffier active un compte, l'utilisateur reçoit automatiquement un email professionnel avec :
- Message de bienvenue personnalisé
- Détails du compte (rôle, statut)
- Lien de connexion direct

---

## 2. Tableau de Bord par Rôle

Chaque utilisateur a un tableau de bord personnalisé selon son rôle avec des statistiques et actions rapides.

### 2.1 Administrateur (`/admin/dashboard`)

**Statistiques affichées** :
- Nombre total d'utilisateurs par rôle
- Audiences du jour / de la semaine
- Dossiers en cours vs clôturés
- Alertes système

**Actions disponibles** :
- Gestion des utilisateurs
- Consultation des logs d'audit
- Statistiques nationales
- Configuration système

### 2.2 Greffier (`/greffier/dashboard`)

**Statistiques affichées** :
- Comptes en attente d'activation (avec alerte visuelle)
- Audiences programmées aujourd'hui
- Décisions en attente de validation
- Instructions en cours

**Actions rapides** :
- Créer une audience
- Valider une décision
- Activer un compte
- Gérer les salles

### 2.3 Juge (`/juge/dashboard`)

**Statistiques affichées** :
- Mes audiences du jour
- Décisions en brouillon
- Instructions envoyées
- Taux de traitement

**Actions rapides** :
- Voir mes audiences
- Rédiger une décision
- Envoyer une instruction

### 2.4 Procureur (`/procureur/dashboard`)

**Statistiques affichées** :
- Affaires du ministère public
- Audiences à venir
- Décisions rendues

### 2.5 Avocat (`/avocat/dashboard`)

**Statistiques affichées** :
- Dossiers clients actifs
- Prochaines audiences
- Décisions récentes

### 2.6 Justiciable (`/justiciable/dashboard`)

**Statistiques affichées** :
- Statut de mon dossier
- Prochaine audience
- Dernière décision

---

## 3. Gestion des Dossiers

### 3.1 Création d'un dossier

**Chemin** : `/common/dossiers` → "Nouveau dossier"

**Champs obligatoires** :
- Numéro du dossier (ex: DOS-2025-001)
- Titre/Objet
- Type (Civil, Pénal, Commercial, Administratif, Famille)
- Justiciable (obligatoire)

**Champs optionnels** :
- Juge assigné
- Procureur assigné
- Avocat(s) (sélection multiple)
- Description détaillée

**Workflow** :
```
Création du dossier → Notifications aux parties → Suivi du statut
```

### 3.2 Statuts des dossiers

| Statut | Description |
|--------|-------------|
| 🟢 Ouvert | Dossier nouvellement créé |
| 🟡 En cours | Procédure en cours |
| 🟠 Suspendu | Procédure temporairement arrêtée |
| 🔴 Clos | Dossier terminé |
| ⚫ Archivé | Dossier archivé pour conservation |

### 3.3 Pièces jointes

Chaque dossier peut contenir des documents :
- Types acceptés : PDF, DOC, DOCX, JPG, PNG
- Taille max : 10 Mo par fichier
- Historique des ajouts avec date et auteur

### 3.4 Filtrage des dossiers par rôle

| Rôle | Dossiers visibles |
|------|-------------------|
| Admin | Tous les dossiers |
| Greffier | Tous les dossiers |
| Juge | Dossiers où il est assigné |
| Procureur | Dossiers où il est assigné |
| Avocat | Dossiers de ses clients |
| Justiciable | Uniquement son dossier |

---

## 4. Gestion des Audiences

### 4.1 Création d'une audience

**Chemin** : `/common/audiences` → "Nouvelle audience"

**Workflow en 2 étapes** :

**Étape 1 - Sélection du dossier** :
- Choisir un dossier existant (obligatoire)
- Les champs des parties sont **masqués** jusqu'à la sélection

**Étape 2 - Affichage automatique** :
Une fois le dossier sélectionné, les champs apparaissent avec animation :
- Parties concernées (auto-rempli)
- Juge (hérité du dossier)
- Procureur (hérité du dossier)
- Avocat(s) (hérités du dossier)
- Justiciable (hérité du dossier)

**Champs à remplir** :
- N° Audience (ex: AUD-2025-001)
- Date et Heure
- Salle (avec détection de disponibilité)
- Statut

### 4.2 Détection des conflits de salle

Le système vérifie automatiquement si la salle est disponible :
- 🟢 Point vert = Salle disponible
- 🔴 Point rouge = Salle occupée (désactivée)

Si un conflit est détecté, un message d'erreur s'affiche :
> "La Salle 1 est déjà occupée le 15/01/2025 à 09:00 par l'audience AUD-2025-002"

### 4.3 Statuts des audiences

| Statut | Couleur | Description |
|--------|---------|-------------|
| Prévue | 🟢 Vert | Audience programmée |
| En cours | 🟡 Jaune | Audience en cours |
| Reportée | 🔵 Bleu | Audience reportée à une autre date |
| Terminée | 🔴 Rouge | Audience terminée |

### 4.4 QR Code

Chaque audience génère automatiquement un QR code unique permettant :
- Accès public aux détails de l'audience
- Affichage sur le tableau numérique du tribunal
- Scan par les justiciables pour suivre leur affaire

---

## 5. Système de Notifications

### 5.1 Types de notifications (19 types)

**Catégorie Audiences** :
- `audience_creee` - Nouvelle audience programmée
- `audience_reportee` - Audience reportée
- `audience_annulee` - Audience annulée
- `rappel_audience` - Rappel avant audience

**Catégorie Dossiers** :
- `dossier_cree` - Nouveau dossier créé
- `dossier_modifie` - Dossier modifié
- `dossier_clos` - Dossier clôturé
- `piece_ajoutee` - Nouvelle pièce ajoutée
- `assignation_nouveau_dossier` - Assignation à un dossier

**Catégorie Décisions** :
- `decision_rendue` - Nouvelle décision
- `decision_validee` - Décision validée
- `decision_publiee` - Décision publiée

**Catégorie Instructions** :
- `instruction_envoyee` - Nouvelle instruction
- `instruction_traitee` - Instruction traitée

**Catégorie Procédures** :
- `convocation_recue` - Convocation reçue
- `echeance_proche` - Échéance approchant
- `commentaire_ajoute` - Nouveau commentaire

**Catégorie Administration** :
- `utilisateur_cree` - Nouveau compte créé
- `alerte_securite` - Alerte de sécurité

### 5.2 Canaux de notification

| Canal | Description | Configuration |
|-------|-------------|---------------|
| 📧 Email | Envoi via Resend API | Nécessite RESEND_API_KEY |
| 📱 SMS | Envoi via Twilio | Nécessite compte Twilio |
| 💬 WhatsApp | Envoi via Twilio | Nécessite WhatsApp Business |
| 🔔 In-App | Notifications dans l'application | Toujours actif |

### 5.3 Préférences utilisateur

**Chemin** : `/common/notification-preferences`

Chaque utilisateur peut activer/désactiver les notifications par :
- Type de notification
- Canal de réception

### 5.4 Envoi manuel (Greffier)

**Chemin** : `/greffier/envoi-notifications`

Le greffier peut envoyer manuellement des notifications avec :
- Templates prédéfinis (convocation, report, etc.)
- Sélection des destinataires
- Choix du canal

---

## 6. Gestion des Décisions

### 6.1 Workflow des décisions

```
Juge rédige    →    Juge soumet    →    Greffier valide    →    Greffier publie
(Brouillon)         (En attente)         (Validée)               (Publiée)
                                              ↓
                                         Greffier rejette
                                         (Retour au juge)
```

### 6.2 États des décisions

| État | Qui peut modifier | Actions disponibles |
|------|-------------------|---------------------|
| Brouillon | Juge | Modifier, Soumettre |
| En attente | - | Valider, Rejeter (Greffier) |
| Validée | - | Publier (Greffier) |
| Rejetée | Juge | Modifier, Re-soumettre |
| Publiée | - | Consultation uniquement |

### 6.3 Création d'une décision (Juge)

**Chemin** : `/juge/decisions` → "Nouvelle décision"

**Champs** :
- Dossier concerné
- Audience liée
- Type de décision
- Contenu/Dispositif
- Fichier PDF (optionnel)

### 6.4 Validation (Greffier)

**Chemin** : `/greffier/validation-decisions`

Le greffier voit toutes les décisions en attente et peut :
- ✓ Valider : La décision passe en "Validée"
- ✗ Rejeter : La décision retourne au juge avec commentaire

### 6.5 Publication

Après validation, le greffier peut publier la décision :
- Notifications envoyées à toutes les parties
- Décision visible dans les dossiers clients (Avocat)
- Décision visible pour le justiciable

---

## 7. Instructions Juge → Greffe

### 7.1 Création d'une instruction (Juge)

**Chemin** : `/juge/instructions` → "Nouvelle instruction"

**Types d'instructions** :
- Report d'audience
- Demande de documents
- Convocation de témoin
- Autre

**Champs** :
- Dossier concerné
- Type d'instruction
- Description détaillée
- Priorité (Normale, Haute, Urgente)

### 7.2 Traitement (Greffier)

**Chemin** : `/greffier/instructions`

**Workflow** :
```
Instruction créée → Greffier prend en charge → Greffier complète
     (Juge)              (En cours)              (Traitée)
```

**Actions du greffier** :
- Prendre en charge : L'instruction passe en "En cours"
- Compléter : Ajouter le résultat/réponse
- Notification au juge

---

## 8. Gestion des Salles

### 8.1 Liste des salles

**Chemin** : `/greffier/gestion-salles`

**Informations par salle** :
- Nom de la salle
- Capacité (nombre de places)
- Équipements (vidéoconférence, micro, etc.)
- Statut (Disponible, Occupée, Maintenance)

### 8.2 Vues disponibles

| Vue | Description |
|-----|-------------|
| 📊 Grille | Vue en grille avec créneaux horaires |
| 📋 Liste | Liste détaillée des salles |
| 📅 Calendrier | Vue calendrier mensuel |

### 8.3 Créneaux horaires

6 créneaux standards par jour :
- 08:00 - 10:00
- 10:00 - 12:00
- 12:00 - 14:00
- 14:00 - 16:00
- 16:00 - 18:00
- 18:00 - 20:00

### 8.4 États des salles

- 🟢 Vert = Libre
- 🔴 Rouge = Occupée
- ⚫ Gris = Indisponible (maintenance)

---

## 9. Affichage Numérique Public

### 9.1 Tableau d'affichage

**Chemin** : `/greffier/affichage` (gestion) et `/public-display` (affichage public)

**Fonctionnalités** :
- Affichage des audiences du jour
- Rafraîchissement automatique (30 secondes)
- QR codes pour chaque audience
- Mode plein écran pour affichage sur écran du tribunal

### 9.2 Informations affichées

Pour chaque audience :
- Numéro d'audience
- Heure
- Salle
- Parties (anonymisées si nécessaire)
- Statut (Prévue, En cours, Terminée)
- QR Code d'accès

### 9.3 Accès public via QR Code

**Chemin** : `/audience/:uuid` (public, sans authentification)

Les justiciables peuvent scanner le QR code pour voir :
- Détails de leur audience
- Statut en temps réel
- Informations de salle

---

## 10. Statistiques et Rapports

### 10.1 Statistiques Greffier

**Chemin** : `/greffier/stats`

**Métriques** :
- Audiences par mois
- Taux de report
- Répartition par type d'affaire
- Charge par salle

### 10.2 Statistiques Juge

**Chemin** : `/juge/stats`

**Métriques** :
- Dossiers traités
- Délai moyen de traitement
- Décisions rendues
- Taux de report personnel

### 10.3 Statistiques Procureur

**Chemin** : `/procureur/stats`

**Métriques** :
- Affaires du ministère public
- Répartition par type d'infraction
- Résultats des poursuites

### 10.4 Statistiques Admin (National)

**Chemin** : `/admin/stats`

**Métriques nationales** :
- Total dossiers par tribunal
- Performance par juridiction
- Délais moyens nationaux
- Bottlenecks identifiés

### 10.5 Export des données

Formats disponibles :
- 📄 PDF (rapport formaté)
- 📊 Excel (données brutes)

---

## 11. Blog et Actualités

### 11.1 Consultation (Public)

**Chemin** : `/blog`

Articles visibles par tous :
- Actualités juridiques
- Mises à jour de la plateforme
- Informations pratiques

### 11.2 Gestion (Admin)

**Actions** :
- Créer un article
- Modifier un article
- Publier/Dépublier
- Supprimer

**Champs d'un article** :
- Titre
- Contenu (éditeur riche)
- Image de couverture
- Tags/Catégories
- Date de publication

---

## 12. Chatbot IA

### 12.1 Accès

**Chemin** : Page d'accueil `/` → Bouton flottant en bas à droite

### 12.2 Fonctionnalités

Le chatbot peut répondre aux questions sur :
- Navigation dans la plateforme
- Procédures judiciaires
- Fonctionnalités disponibles
- FAQ générales

### 12.3 Technologie

- Utilise Lovable AI (Gemini Flash)
- Contexte spécifique e-Justice intégré
- Réponses en temps réel (streaming)

---

## 📱 Responsive Design

Toutes les interfaces sont 100% responsives :

| Appareil | Adaptations |
|----------|-------------|
| 📱 Mobile | Menu hamburger, tableaux scrollables, boutons empilés |
| 📱 Tablette | Sidebar rétractable, grilles adaptatives |
| 💻 Desktop | Sidebar complète, tableaux larges, actions inline |

---

## 🔐 Sécurité

### Mesures implémentées

1. **Authentification**
   - JWT avec access token (7 jours) et refresh token (30 jours)
   - Hash bcrypt (12 rounds) pour les mots de passe

2. **Autorisation**
   - Filtrage des données par rôle (frontend et backend)
   - Middleware de vérification des permissions
   - Actions restreintes selon le rôle

3. **Audit**
   - Logging de toutes les actions sensibles
   - Historique des connexions
   - Détection d'activités suspectes

4. **Validation**
   - Validation des entrées côté client et serveur
   - Protection contre les injections

---

## 📞 Support

Pour toute question :
- Documentation technique : `/docs`
- Email : support@ejustice.sn

---

**Version** : 2.0.0  
**Dernière mise à jour** : Décembre 2025  
**Équipe** : e-Justice Sénégal
