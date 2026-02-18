const path = require('path');
const { app } = require('electron');
const sqlite3 = require('sqlite3').verbose();

let db;

function openDb() {
  if (db) return db;
  const dbPath = path.join(app.getPath('userData'), 'badboard.sqlite');
  db = new sqlite3.Database(dbPath);
  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      saison TEXT, nom TEXT, prenom TEXT, sexe TEXT, date_naissance TEXT,
      age_fin_saison INTEGER, categorie TEXT, email TEXT, telephone TEXT,
      departement TEXT, licence TEXT, adherent_valide TEXT
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      member_id INTEGER,
      tarif REAL, montant_du REAL, montant_recu REAL, montant_restant REAL,
      mode_paiement TEXT, date_paiement TEXT, reductions REAL
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS administrative_status (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      member_id INTEGER,
      certif_medical TEXT, date_certif TEXT, justificatifs TEXT,
      etat_dossier TEXT, date_dernier_etat TEXT
    )`);
  });
  return db;
}

function replaceSeasonData(rows) {
  const database = openDb();
  return new Promise((resolve, reject) => {
    database.serialize(() => {
      database.run('DELETE FROM administrative_status');
      database.run('DELETE FROM payments');
      database.run('DELETE FROM members');
      const insertMember = database.prepare(`INSERT INTO members
      (saison, nom, prenom, sexe, date_naissance, age_fin_saison, categorie, email, telephone, departement, licence, adherent_valide)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

      const insertPayment = database.prepare(`INSERT INTO payments
      (member_id, tarif, montant_du, montant_recu, montant_restant, mode_paiement, date_paiement, reductions)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);

      const insertAdmin = database.prepare(`INSERT INTO administrative_status
      (member_id, certif_medical, date_certif, justificatifs, etat_dossier, date_dernier_etat)
      VALUES (?, ?, ?, ?, ?, ?)`);

      rows.forEach((r) => {
        insertMember.run([
          r.saison, r.nom, r.prenom, r.sexe, r.date_naissance,
          Number(r.age_fin_saison || 0), r.categorie, r.email, r.telephone,
          r.departement, r.licence, r.adherent_valide,
        ], function memberInserted(err) {
          if (err) return;
          const memberId = this.lastID;
          insertPayment.run([
            memberId,
            Number(r.tarif || 0),
            Number(r.montant_du || r.montant || 0),
            Number(r.montant_recu || 0),
            Number(r.montant_restant || 0),
            r.mode_paiement,
            r.date_paiement,
            Number(r.reductions || 0),
          ]);
          insertAdmin.run([
            memberId,
            r.certif_medical,
            r.date_certif,
            r.justificatifs,
            r.etat_dossier,
            r.date_dernier_etat,
          ]);
        });
      });

      insertMember.finalize();
      insertPayment.finalize();
      insertAdmin.finalize((err) => {
        if (err) reject(err);
        else resolve({ inserted: rows.length });
      });
    });
  });
}

module.exports = { openDb, replaceSeasonData };
