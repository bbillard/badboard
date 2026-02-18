import React from 'react';
import { createRoot } from 'react-dom/client';
import Papa from 'papaparse';
import './styles.css';

const tabs = ['Dashboard', 'Finances', 'Administratif', 'CRM'];

const money = (v) => `${Number(v || 0).toFixed(2)} €`;

function statusPaiement(r) {
  const restant = Number(r.montant_restant || 0);
  const recu = Number(r.montant_recu || 0);
  if (restant <= 0) return 'Payé';
  if (recu > 0) return 'Partiel';
  return 'Non payé';
}

function dossierStatus(r) {
  if (r.adherent_valide !== 'Oui') return 'Non validé';
  if (!r.certif_medical || r.certif_medical === 'Non') return 'Certificat manquant';
  if (!r.justificatifs || r.justificatifs === 'Non') return 'Pièce manquante';
  return 'Dossier complet';
}

function App() {
  const [rows, setRows] = React.useState([]);
  const [activeTab, setActiveTab] = React.useState('Dashboard');
  const [onlyRelance, setOnlyRelance] = React.useState(false);
  const [search, setSearch] = React.useState('');

  const importCsv = (file) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      delimiter: ';',
      complete: async (res) => {
        const importedRows = res.data;
        setRows(importedRows);
        if (window.badboard?.replaceSeasonData) {
          await window.badboard.replaceSeasonData(importedRows);
        }
      },
    });
  };

  const valides = rows.filter((r) => r.adherent_valide === 'Oui').length;
  const total = rows.length;
  const restantTotal = rows.reduce((s, r) => s + Number(r.montant_restant || 0), 0);
  const duTotal = rows.reduce((s, r) => s + Number(r.montant_du || 0), 0);
  const recuTotal = rows.reduce((s, r) => s + Number(r.montant_recu || 0), 0);

  const financeRows = rows.filter((r) => (onlyRelance ? Number(r.montant_restant || 0) > 0 : true));
  const emailsRelance = financeRows.filter((r) => Number(r.montant_restant || 0) > 0).map((r) => r.email).filter(Boolean);

  const crmRows = rows.filter((r) => {
    const q = search.toLowerCase();
    return [r.nom, r.prenom, r.email, r.licence, r.categorie].join(' ').toLowerCase().includes(q);
  });

  return (
    <div className="app">
      <header>
        <h1>BadBoard</h1>
        <p>Outil local de pilotage pour clubs de badminton</p>
      </header>

      <div className="toolbar">
        <label className="import">
          Importer un extract CSV
          <input type="file" accept=".csv" onChange={(e) => e.target.files?.[0] && importCsv(e.target.files[0])} />
        </label>
      </div>

      <nav>
        {tabs.map((tab) => (
          <button key={tab} className={activeTab === tab ? 'active' : ''} onClick={() => setActiveTab(tab)}>{tab}</button>
        ))}
      </nav>

      {activeTab === 'Dashboard' && (
        <section className="grid">
          <div className="card"><h3>Adhérents</h3><p>{total}</p></div>
          <div className="card"><h3>Validés</h3><p>{valides}</p></div>
          <div className="card"><h3>Taux validation</h3><p>{total ? ((valides / total) * 100).toFixed(1) : 0}%</p></div>
          <div className="card"><h3>Reste à payer</h3><p>{money(restantTotal)}</p></div>
        </section>
      )}

      {activeTab === 'Finances' && (
        <section>
          <div className="grid">
            <div className="card"><h3>Total attendu</h3><p>{money(duTotal)}</p></div>
            <div className="card"><h3>Total encaissé</h3><p>{money(recuTotal)}</p></div>
            <div className="card"><h3>Total restant</h3><p>{money(restantTotal)}</p></div>
            <div className="card"><h3>% encaissement</h3><p>{duTotal ? ((recuTotal / duTotal) * 100).toFixed(1) : 0}%</p></div>
          </div>
          <div className="toolbar">
            <button onClick={() => setOnlyRelance((v) => !v)}>{onlyRelance ? 'Afficher tous les adhérents' : 'Afficher uniquement les adhérents avec reste à payer'}</button>
            <button onClick={() => navigator.clipboard.writeText(emailsRelance.join(','))}>Copier tous les emails</button>
          </div>
          <table>
            <thead><tr><th>Nom</th><th>Prénom</th><th>Catégorie</th><th>Montant dû</th><th>Montant reçu</th><th>Montant restant</th><th>Email</th><th>Statut</th></tr></thead>
            <tbody>
              {financeRows.map((r, i) => <tr key={i}><td>{r.nom}</td><td>{r.prenom}</td><td>{r.categorie}</td><td>{money(r.montant_du)}</td><td>{money(r.montant_recu)}</td><td>{money(r.montant_restant)}</td><td>{r.email}</td><td>{statusPaiement(r)}</td></tr>)}
            </tbody>
          </table>
        </section>
      )}

      {activeTab === 'Administratif' && (
        <section>
          <table>
            <thead><tr><th>Nom</th><th>Prénom</th><th>État dossier</th><th>Certif médical</th><th>Justificatifs</th><th>Validé</th></tr></thead>
            <tbody>
              {rows.map((r, i) => <tr key={i}><td>{r.nom}</td><td>{r.prenom}</td><td>{dossierStatus(r)}</td><td>{r.certif_medical || 'Non'}</td><td>{r.justificatifs || 'Non'}</td><td>{r.adherent_valide || 'Non'}</td></tr>)}
            </tbody>
          </table>
        </section>
      )}

      {activeTab === 'CRM' && (
        <section>
          <div className="toolbar">
            <input placeholder="Rechercher nom, email, licence, catégorie" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <table>
            <thead><tr><th>Nom</th><th>Prénom</th><th>Email</th><th>Téléphone</th><th>Catégorie</th><th>Département</th><th>Saison</th></tr></thead>
            <tbody>
              {crmRows.map((r, i) => <tr key={i}><td>{r.nom}</td><td>{r.prenom}</td><td>{r.email}</td><td>{r.telephone}</td><td>{r.categorie}</td><td>{r.departement}</td><td>{r.saison}</td></tr>)}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
