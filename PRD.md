# 📄 PRODUCT REQUIREMENTS DOCUMENT

## Nom produit (provisoire)

**BadBoard – Outil bureautique de pilotage pour clubs de badminton**

---

## 1️⃣ Vision produit

BadBoard est une application **100% locale (offline-first)** permettant aux clubs de badminton d’importer un extract CSV issu de Poona afin de :

- Visualiser les statistiques stratégiques du club
- Suivre précisément les paiements et restes à payer
- Identifier rapidement les dossiers incomplets
- Accéder facilement aux contacts pour relances
- Segmenter les adhérents

Aucune donnée n’est envoyée sur un serveur externe.

L’application est un **outil de bureau interne**, non destiné aux adhérents.

---

## 2️⃣ Contraintes majeures

### 🔐 Sécurité & confidentialité

- Aucune connexion réseau obligatoire
- Aucune donnée persistée en cloud
- Données stockées uniquement en local
- Export possible uniquement en CSV/PDF local

### 🧾 Source de données

- Fichier CSV exporté depuis Poona
- Séparateur : `;`
- Encodage : latin1 / utf-8 à détecter automatiquement
- Colonnes variables mais mapping automatique basé sur noms

---

## 3️⃣ Utilisateur cible

Membres du bureau :

- Président
- Trésorier
- Secrétaire

Niveau technique : faible à intermédiaire.

Attente : outil simple, visuel, efficace.

---

## 4️⃣ Stack technique proposée

### 🖥 Architecture

Application desktop locale.

#### Option recommandée

**Electron + React + SQLite**

Pourquoi :

- Fonctionne offline
- Cross-platform (Windows / Mac)
- Accès système fichiers facile
- SQLite = base locale légère
- React = UI moderne et maintenable

Alternative plus légère :

- Tauri + React (plus moderne, plus léger)

Base de données locale :

- SQLite

Graphiques :

- Recharts ou Chart.js

Parsing CSV :

- PapaParse

---

## 5️⃣ Flux principal utilisateur

1. L’utilisateur ouvre l’app
2. Clique sur “Importer un extract CSV”
3. Sélectionne fichier
4. L’app :
   - Parse le CSV
   - Mappe automatiquement les colonnes
   - Nettoie les données
   - Insère en base locale
5. Les onglets se remplissent automatiquement

Possibilité :

- Remplacer la saison existante
- Importer plusieurs saisons

---

## 6️⃣ Structure fonctionnelle

### 🧭 MODULE 1 — Dashboard stratégique (Président)

#### Objectif

Donner une vision globale instantanée du club.

#### Indicateurs clés

À partir des colonnes :

- Saison
- Sexe
- Age fin de saison
- Catégorie
- Département
- Adhérent validé

KPI :

- Nombre total d’adhérents
- Nombre validés
- Taux validation
- Répartition H/F
- Répartition par tranche d’âge :
  - -12
  - 12–17
  - 18–35
  - 35–50
  - 50+
- Moyenne d’âge
- Répartition par catégorie
- Répartition géographique (par département)

Visualisations :

- Graphique camembert H/F
- Histogramme par âge
- Tableau répartition catégorie
- Top 5 départements

---

### 💰 MODULE 2 — Gestion financière complète (Trésorier)

#### Objectif

Suivre précisément qui doit quoi et relancer facilement.

#### Données exploitées

- Tarif
- Montant
- Montant reçu
- Montant restant
- Mode paiement souhaité
- CB : Montant payé
- Réductions
- Date de paiement
- Attente paiement
- Payé
- Email

#### 2.1 Tableau principal : Situation financière

Colonnes affichées :

- Nom / Prénom
- Catégorie
- Tarif
- Réductions
- Montant dû
- Montant reçu
- Montant restant
- Mode paiement
- Statut :
  - 🟢 Payé
  - 🟡 Partiel
  - 🔴 Non payé

Filtres :

- Par catégorie
- Par statut paiement
- Par mode paiement

#### 2.2 Indicateurs financiers globaux

- Total attendu
- Total encaissé
- Total restant
- % d’encaissement
- Total réductions

#### 2.3 Module Relances

Fonction clé :

Bouton : 👉 “Afficher uniquement les adhérents avec reste à payer”

Affichage :

- Liste
- Email cliquable
- Bouton “Copier tous les emails”

Fonction bonus :

- Générer liste emails séparés par virgule
- Export CSV “Relances”

---

### 📂 MODULE 3 — Gestion administrative

#### Objectif

Identifier rapidement les dossiers incomplets.

#### Données exploitées

- Etat de dossier
- Justificatifs fournis
- Certif. Médical
- Date certif. Médical
- Adhérent validé
- Date de dernier état

#### 3.1 Statut visuel dossier

Chaque membre reçoit un statut calculé :

- 🟢 Dossier complet
- 🟡 Pièce manquante
- 🔴 Certificat manquant
- 🔴 Non validé

#### 3.2 Vue “Dossiers à traiter”

Filtre :

- Non validés
- Certificat expiré
- Justificatifs manquants

#### 3.3 Alertes certificat médical

Si date > 12 mois → statut “à renouveler”.

---

### 👥 MODULE 4 — CRM Relationnel

#### Objectif

Segmenter et exploiter intelligemment la base adhérents.

#### Données exploitées

- Nom
- Email
- Téléphone
- Catégorie
- Département
- Saison
- Type de personne

#### 4.1 Recherche intelligente

Recherche par :

- Nom
- Email
- Licence
- Catégorie

#### 4.2 Segmentation rapide

Boutons rapides :

- Tous les jeunes
- Tous les adultes
- Tous les non payés
- Tous les dossiers incomplets
- Tous les validés

#### 4.3 Fiche adhérent détaillée

Contient :

- Infos personnelles
- Situation financière
- Statut administratif
- Historique paiement
- Contacts secondaires

---

## 7️⃣ Modèle de données local (SQLite)

Tables principales :

### Members

- id
- saison
- nom
- prénom
- sexe
- date_naissance
- age_fin_saison
- categorie
- email
- téléphone
- département
- etc.

### Payments

- member_id
- tarif
- montant_du
- montant_reçu
- montant_restant
- mode_paiement
- date_paiement
- reductions

### AdministrativeStatus

- member_id
- certif_medical
- date_certif
- justificatifs
- etat_dossier
- date_dernier_etat

---

## 8️⃣ Règles métier importantes

- Si montant_restant <= 0 → statut payé
- Si montant_reçu > 0 et restant > 0 → partiel
- Si date_certif > 12 mois → expiré
- Si adhérent_validé != “Oui” → non validé

---

## 9️⃣ UX Principes

- Interface sobre
- Navigation par onglets :
  - Dashboard
  - Finances
  - Administratif
  - CRM
- Aucune surcharge
- Actions claires

---

## 🔟 Fonctionnalités non incluses

- Pas de gestion créneaux
- Pas d’accès adhérent
- Pas de paiement en ligne
- Pas de connexion fédérale
- Pas de synchronisation cloud

---

## 11️⃣ Roadmap MVP

### Phase 1

- Import CSV
- Dashboard global
- Tableau financier
- Filtres relance

### Phase 2

- Statuts administratifs dynamiques
- Fiche adhérent détaillée
- Segmentation avancée

### Phase 3

- Export PDF rapport AG
- Multi-saison
- Sauvegarde automatique locale

---

## 🎯 Objectif final

Un outil :

- Simple
- Local
- Sécurisé
- Utilisable par n’importe quel club
- Qui fait gagner 5–10h par mois au bureau
