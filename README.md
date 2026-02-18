# BadBoard

Application desktop locale (offline-first) pour le pilotage d'un club de badminton.

## Fonctionnalités implémentées (MVP v1)

- Import CSV (séparateur `;`) depuis l'interface.
- Dashboard avec indicateurs globaux (adhérents, validés, taux de validation, reste à payer).
- Vue Finances avec indicateurs de trésorerie, filtre relances et copie emails.
- Vue Administratif avec statuts de dossier calculés.
- Vue CRM avec recherche multi-critères (nom/email/licence/catégorie).
- Persistance locale SQLite (Electron main process) avec tables `members`, `payments`, `administrative_status`.

## Stack

- Electron
- React (Vite)
- SQLite (`sqlite3`)
- PapaParse

## Lancer en mode web (UI)

```bash
npm install
npm run dev
```

## Build UI

```bash
npm run build
```

## PRD

Les spécifications produit détaillées sont dans [`PRD.md`](./PRD.md).
