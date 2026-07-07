/* Générateur de données de démonstration réalistes pour Private Corner.
   Produit un fichier SQL idempotent (DELETE ciblé sur namespace UUID + INSERT).
   Aucune connexion DB : émet du SQL, appliqué ensuite via le MCP Supabase. */

const CABINET = "00000000-0000-0000-0000-0000000000c1";
const CONSEILLER = "7b88309f-8fae-4ae2-b7d1-1603c211d7d4";

const FUND = {
  merieux: "6fccd824-d6b6-4e57-845e-6e0f0765a75e",
  semi: "4864e215-69ef-46cf-95ba-808e06d43a80",
  credit: "3135badb-591d-4bbe-a8ae-7a4decb41e7f",
  eqt: "9ed3acd1-020f-4d9c-b3d4-dbd9db051845",
  keensight: "aabc1bfc-2a55-46da-9a8b-f635a7df4009",
  tikehau: "3f36fbdb-0723-43fa-819c-639195f323a5",
  blueowl: "43b1ad12-0c17-4688-ae86-debbcd1f2727",
  secondary: "d7a00d07-f3d5-4b2a-9b7c-3e41010d125e",
  emmo: "600aa4fc-1ac1-4047-af40-d135d418ba48",
  wealth: "efc642fd-f38a-400d-ac8a-415042612d6e",
  usmid: "6610f58e-445b-44e0-8d07-3e960b0cf809",
  meridiam: "30dc0f72-e1c0-42b1-a4ac-4d554a9ecb87",
};
const PACING = {
  merieux: "innovation", semi: "buyout", credit: "credit", eqt: "buyout",
  keensight: "growth", tikehau: "growth", blueowl: "gpstakes",
  secondary: "secondary", emmo: "buyout", wealth: "buyout", usmid: "buyout",
  meridiam: "infra",
};

/* ------- UUID déterministes par namespace (idempotence du seed) ------- */
function uuid(ns, i, j = 0) {
  const a = String(ns).padStart(4, "0");
  const b = String(i).padStart(4, "0");
  const c = String(j).padStart(12, "0");
  return `dada${a}-${b}-4000-8000-${c}`;
}

const sqlStr = (v) =>
  v === null || v === undefined ? "null" : `'${String(v).replace(/'/g, "''")}'`;
const sqlNum = (v) => (v === null || v === undefined ? "null" : String(v));
const sqlJson = (o) => `'${JSON.stringify(o).replace(/'/g, "''")}'::jsonb`;
const sqlBool = (b) => (b ? "true" : "false");

/* ------- Définition des investisseurs -------
   established=true → possède des positions antérieures (appels payés + distributions). */
const investors = [
  {
    key: 1, first: "Jean-Philippe", last: "Arnaud", ref: "PC-2021-014",
    email: "jp.arnaud@monteverde-invest.fr", phone: "+33 6 12 44 87 03",
    address: "18 avenue Montaigne, 75008 Paris", birth: "1962-03-14",
    status: "actif", risk: "offensif", experience: "averti", horizon: 12,
    liquidity: "forte", patrimoine: 4200000, established: true,
    profession: "Chef d'entreprise (cédant)", statutPro: "dirigeant",
    revenus: "gt_500k", origine: ["cession", "epargne"], situation: "marie",
    enfants: 3, ppe: "non", tmi: "45", ifi: "oui", ifiMontant: 2100000,
    parts: 2, resid: "france",
    notes: "Cédant industriel (2020). Recherche de réemploi long terme et de diversification non cotée. Sensible au reporting et à la qualité des gérants.",
  },
  {
    key: 2, first: "Camille", last: "Rousseau", ref: "PC-2023-041",
    email: "camille.rousseau@nova-tech.io", phone: "+33 6 78 21 55 90",
    address: "7 quai de Bourbon, 69005 Lyon", birth: "1979-09-02",
    status: "actif", risk: "dynamique", experience: "averti", horizon: 10,
    liquidity: "moyenne", patrimoine: 2800000, established: false,
    profession: "Dirigeante fondatrice (SaaS)", statutPro: "dirigeant",
    revenus: "250_500k", origine: ["professionnel", "epargne"], situation: "pacse",
    enfants: 2, ppe: "non", tmi: "45", ifi: "non", ifiMontant: 0,
    parts: 2, resid: "france",
    notes: "Fondatrice tech, forte appétence croissance et innovation. Souhaite conserver de la liquidité pour d'éventuels réinvestissements pros.",
  },
  {
    key: 3, first: "Henri", last: "de Montfort", ref: "PC-2019-006",
    email: "h.demontfort@orange.fr", phone: "+33 6 09 33 71 22",
    address: "22 boulevard Carnot, 06400 Cannes", birth: "1957-06-25",
    status: "actif", risk: "equilibre", experience: "averti", horizon: 8,
    liquidity: "faible", patrimoine: 6500000, established: true,
    profession: "Retraité (ancien banquier d'affaires)", statutPro: "retraite",
    revenus: "100_250k", origine: ["epargne", "heritage", "immobilier"], situation: "marie",
    enfants: 2, ppe: "non", tmi: "41", ifi: "oui", ifiMontant: 3400000,
    parts: 2, resid: "france",
    notes: "Patrimoine mature, priorité transmission et revenus complémentaires. Déjà exposé au non-coté via millésimes antérieurs.",
  },
  {
    key: 4, first: "Sophie", last: "Lemaître", ref: "PC-2023-058",
    email: "dr.lemaitre@chirurgie-lyon.fr", phone: "+33 6 51 88 24 17",
    address: "14 rue Vaubecour, 69002 Lyon", birth: "1974-11-30",
    status: "actif", risk: "dynamique", experience: "initie", horizon: 11,
    liquidity: "moyenne", patrimoine: 3100000, established: false,
    profession: "Chirurgienne libérale", statutPro: "independant",
    revenus: "250_500k", origine: ["professionnel", "immobilier"], situation: "divorce",
    enfants: 2, ppe: "non", tmi: "45", ifi: "oui", ifiMontant: 1250000,
    parts: 2.5, resid: "france",
    notes: "Profession libérale, revenus élevés. Recherche capitalisation et réduction de la fiscalité sur les revenus du patrimoine.",
  },
  {
    key: 5, first: "Marc", last: "Delaunay", ref: "PC-2024-072",
    email: "marc.delaunay@gmail.com", phone: "+33 6 62 40 19 88",
    address: "31 rue de la République, 44000 Nantes", birth: "1966-01-18",
    status: "actif", risk: "equilibre", experience: "initie", horizon: 9,
    liquidity: "moyenne", patrimoine: 2200000, established: false,
    profession: "Directeur général (ETI)", statutPro: "dirigeant",
    revenus: "250_500k", origine: ["professionnel", "epargne"], situation: "marie",
    enfants: 3, ppe: "non", tmi: "41", ifi: "non", ifiMontant: 0,
    parts: 2.5, resid: "france",
    notes: "Cadre dirigeant, épargne régulière. Premier accès au non-coté, prudent sur le rythme d'appel.",
  },
  {
    key: 6, first: "Élodie", last: "Fontaine", ref: "PC-2020-011",
    email: "elodie.fontaine@protonmail.com", phone: "+33 6 14 77 63 09",
    address: "5 place des Vosges, 75004 Paris", birth: "1984-04-07",
    status: "actif", risk: "offensif", experience: "averti", horizon: 13,
    liquidity: "forte", patrimoine: 5000000, established: true,
    profession: "Investisseuse privée", statutPro: "sans_emploi",
    revenus: "100_250k", origine: ["heritage", "cession"], situation: "celibataire",
    enfants: 0, ppe: "non", tmi: "45", ifi: "oui", ifiMontant: 1800000,
    parts: 1, resid: "france",
    notes: "Patrimoine issu d'une transmission familiale. Horizon long, forte tolérance au risque, appétence impact et innovation.",
  },
  {
    key: 7, first: "Thomas", last: "Berger", ref: "PC-2024-089",
    email: "thomas@berger-ventures.com", phone: "+33 6 33 90 12 45",
    address: "9 rue du Sentier, 75002 Paris", birth: "1978-08-21",
    status: "actif", risk: "offensif", experience: "averti", horizon: 12,
    liquidity: "moyenne", patrimoine: 1900000, established: false,
    profession: "Entrepreneur série (tech)", statutPro: "dirigeant",
    revenus: "100_250k", origine: ["cession", "professionnel"], situation: "marie",
    enfants: 1, ppe: "non", tmi: "41", ifi: "non", ifiMontant: 0,
    parts: 2, resid: "france",
    notes: "Business angel actif. Cherche à professionnaliser sa poche non cotée via des fonds institutionnels.",
  },
  {
    key: 8, first: "Nathalie", last: "Girard", ref: "PC-2024-095",
    email: "nathalie.girard@outlook.fr", phone: "+33 6 71 05 38 26",
    address: "48 cours Gambetta, 33000 Bordeaux", birth: "1969-12-05",
    status: "actif", risk: "prudent", experience: "initie", horizon: 8,
    liquidity: "faible", patrimoine: 1600000, established: false,
    profession: "Directrice administrative et financière", statutPro: "salarie",
    revenus: "100_250k", origine: ["epargne", "professionnel"], situation: "marie",
    enfants: 2, ppe: "non", tmi: "41", ifi: "non", ifiMontant: 0,
    parts: 2, resid: "france",
    notes: "Profil prudent, sensible à la préservation du capital et à la dette privée / infrastructure.",
  },
  {
    key: 9, first: "Antoine", last: "Mercier", ref: "PC-2019-002",
    email: "a.mercier@mercier-family.office", phone: "+33 6 08 55 47 91",
    address: "3 avenue Foch, 75116 Paris", birth: "1964-02-28",
    status: "actif", risk: "dynamique", experience: "averti", horizon: 14,
    liquidity: "forte", patrimoine: 8200000, established: true,
    profession: "Family officer", statutPro: "dirigeant",
    revenus: "gt_500k", origine: ["heritage", "cession", "immobilier"], situation: "marie",
    enfants: 4, ppe: "oui", ppeDetail: true, tmi: "45", ifi: "oui", ifiMontant: 4200000,
    parts: 3, resid: "france",
    notes: "Family office multigénérationnel. Programme de commitments récurrent, allocation cible non cotée > 30 %. Exigeant sur la sélection et la transparisation.",
  },
  /* --- deux profils moins avancés (prospect / qualification en cours) --- */
  {
    key: 10, first: "Laurent", last: "Petit", ref: "PC-2026-118",
    email: "laurent.petit@gmail.com", phone: "+33 6 44 27 61 30",
    address: "26 rue Sainte-Catherine, 31000 Toulouse", birth: "1981-05-16",
    status: "prospect", risk: "dynamique", experience: "novice", horizon: 10,
    liquidity: "moyenne", patrimoine: 1200000, established: false, partial: true,
    profession: "Cadre supérieur (aéronautique)", statutPro: "salarie",
    revenus: "100_250k", origine: ["epargne"], situation: "marie",
    enfants: 2, ppe: "non", tmi: "41", ifi: "non", ifiMontant: 0,
    parts: 2, resid: "france",
    notes: "Prospect en cours de qualification. Premier rendez-vous réalisé, questionnaires partiellement complétés.",
  },
  {
    key: 11, first: "Isabelle", last: "Moreau", ref: "PC-2026-124",
    email: "isabelle.moreau@wanadoo.fr", phone: "+33 6 90 18 74 52",
    address: "12 rue de la Paix, 67000 Strasbourg", birth: "1971-07-09",
    status: "prospect", risk: null, experience: "novice", horizon: null,
    liquidity: null, patrimoine: 900000, established: false, veryPartial: true,
    profession: "Pharmacienne titulaire", statutPro: "independant",
    revenus: "100_250k", origine: ["professionnel"], situation: "marie",
    enfants: 1, ppe: "non", tmi: "41", ifi: "non", ifiMontant: 0,
    parts: 2, resid: "france",
    notes: "Contact entrant via recommandation. À qualifier — RDV de découverte à planifier.",
  },
];

/* ------- Constructeurs de questionnaires (clés exactes du schéma) ------- */
function kyc(inv) {
  return {
    situation_familiale: inv.situation,
    nb_enfants: inv.enfants,
    profession: inv.profession,
    statut_pro: inv.statutPro,
    revenus_annuels: inv.revenus,
    origine_patrimoine: inv.origine,
    ppe: inv.ppe,
  };
}
function adequacy(inv) {
  const byRisk = {
    prudent: { na: "limitee", nb: "bonne", reac: "attendre", cap: "10_25", obj: "preservation", ops: "1_5" },
    equilibre: { na: "bonne", nb: "bonne", reac: "attendre", cap: "25_50", obj: "croissance", ops: "6_20" },
    dynamique: { na: "bonne", nb: "limitee", reac: "renforcer", cap: "25_50", obj: "croissance", ops: "6_20" },
    offensif: { na: "experte", nb: "bonne", reac: "renforcer", cap: "gt_50", obj: "croissance", ops: "gt_20" },
  }[inv.risk];
  const nonCote = inv.established ? "experte" : inv.experience === "averti" ? "bonne" : inv.experience === "initie" ? "limitee" : "aucune";
  return {
    conn_actions: byRisk.na,
    conn_obligataire: byRisk.nb,
    conn_non_cote: nonCote,
    conn_immobilier: "bonne",
    nb_operations: byRisk.ops,
    reaction_baisse: byRisk.reac,
    capacite_perte: byRisk.cap,
    objectif_principal: inv.risk === "prudent" ? "preservation" : inv.key === 3 || inv.key === 9 ? "transmission" : byRisk.obj,
  };
}
function esg(inv) {
  const wants = [1, 2, 6, 9].includes(inv.key);
  if (!wants) return { integration: "non", part_durable: 0, alignement_taxonomie: 0, pai: "non", exclusions: [], thematiques: [] };
  return {
    integration: "oui",
    part_durable: inv.key === 6 ? 40 : 20,
    alignement_taxonomie: inv.key === 6 ? 20 : 10,
    pai: "oui",
    exclusions: inv.key === 6 ? ["fossiles", "charbon", "armement"] : ["fossiles", "charbon"],
    thematiques: inv.key === 6 ? ["climat", "biodiversite"] : ["climat", "gouvernance"],
  };
}
function tax(inv) {
  const env = [];
  if (["actions_fonds"].length) {} // placeholder
  const enveloppes = inv.patrimoine > 2000000 ? ["pea", "av", "per", "compte_titres"] : ["pea", "av"];
  const objectifs = inv.ifi === "oui" ? ["reduction_ifi", "capitalisation", "transmission"] : inv.key === 1 ? ["report_150ob", "capitalisation"] : ["capitalisation", "transmission"];
  return {
    residence_fiscale: inv.resid,
    pays_residence: "",
    tmi: inv.tmi,
    assujetti_ifi: inv.ifi,
    patrimoine_immobilier: inv.ifiMontant,
    parts_foyer: inv.parts,
    enveloppes,
    objectifs_fiscaux: objectifs,
  };
}

/* ------- Patrimoine (client_assets) : réparti par classe, somme ≈ patrimoine ------- */
function buildAssets(inv) {
  const P = inv.patrimoine;
  const rows = [];
  const add = (category, support, label, value, extra = {}) =>
    rows.push({ category, support, label, value: Math.round(value), envelope: extra.env ?? null, geography: extra.geo ?? null, note: extra.note ?? null });

  // Immobilier (résidence principale + locatif / SCPI)
  add("immobilier", "residence_principale", "Résidence principale", P * 0.28, { note: inv.address.split(",").slice(-1)[0].trim() });
  if (P > 1500000) add("immobilier", "immobilier_locatif", "Immobilier locatif", P * 0.14);
  if (P > 3000000) add("immobilier", "scpi", "SCPI de rendement", P * 0.05, { geo: "Europe" });

  // Actions & fonds cotés
  add("actions_fonds", "actions", "Portefeuille actions (CTO)", P * 0.10, { env: "cto", geo: "Mondial diversifié" });
  add("actions_fonds", "etf", "ETF actions monde (PEA)", P * 0.07, { env: "pea", geo: "Mondial diversifié" });
  add("actions_fonds", "fonds_euro", "Fonds euro (assurance-vie)", P * 0.08, { env: "assurance_vie", geo: "France" });
  if (P > 2000000) add("actions_fonds", "produits_structures", "Produits structurés", P * 0.04, { env: "assurance_vie", geo: "Europe" });

  // Private Equity antérieur (uniquement établis) — reflète les millésimes distribués
  if (inv.established) {
    add("private_equity", "private_equity", "Fonds de PE (millésimes antérieurs)", P * 0.12, { geo: "Europe", note: "Engagements 2018–2021, en cours de distribution" });
    add("private_equity", "startups_pme", "Participations directes (business angel)", P * 0.03, { geo: "France" });
  } else if (inv.experience === "averti") {
    add("private_equity", "startups_pme", "Participations directes", P * 0.03, { geo: "France" });
  }

  // Épargne & liquidités
  add("epargne", "livret", "Livrets réglementés", Math.min(60000, P * 0.02));
  add("epargne", "compte_courant", "Trésorerie disponible", P * 0.06);

  // Crypto / autres pour quelques profils offensifs
  if (inv.risk === "offensif") add("crypto", "crypto", "Cryptoactifs (BTC/ETH)", P * 0.03, { geo: "Mondial diversifié" });
  if (inv.key === 1 || inv.key === 9) add("autres", "montres", "Montres & objets de collection", P * 0.02);

  return rows;
}

/* ------- Allocations (simulations) + lignes ------- */
const FUND_MENU = {
  prudent: [["credit", 0.4], ["meridiam", 0.3], ["secondary", 0.3]],
  equilibre: [["eqt", 0.3], ["secondary", 0.25], ["credit", 0.2], ["meridiam", 0.25]],
  dynamique: [["eqt", 0.3], ["keensight", 0.25], ["blueowl", 0.2], ["semi", 0.25]],
  offensif: [["keensight", 0.28], ["merieux", 0.24], ["semi", 0.24], ["tikehau", 0.24]],
};
const OBJECTIVES = {
  prudent: ["rendement", "decorrelation"],
  equilibre: ["diversification", "rendement", "croissance"],
  dynamique: ["croissance", "diversification", "acces"],
  offensif: ["croissance", "impact", "acces"],
};

function roundTicket(v, min) {
  const step = min <= 25000 ? 25000 : 25000;
  const r = Math.max(min, Math.round(v / step) * step);
  return r;
}

function buildAllocation(inv) {
  // Enveloppe ≈ 12–22 % du patrimoine, arrondie à 50k
  const pct = inv.risk === "prudent" ? 0.1 : inv.risk === "offensif" ? 0.22 : 0.15;
  let envelope = Math.round((inv.patrimoine * pct) / 50000) * 50000;
  envelope = Math.max(200000, envelope);
  const menu = FUND_MENU[inv.risk] || FUND_MENU.equilibre;

  // Répartit l'enveloppe sur les fonds, tickets ≥ 100k (multiples de 25k)
  let lines = menu.map(([k, w]) => ({ k, amount: roundTicket(envelope * w, 100000) }));
  // Ajuste pour coller à l'enveloppe : mets l'écart sur la 1re ligne
  const sum = lines.reduce((s, l) => s + l.amount, 0);
  lines[0].amount += envelope - sum;
  if (lines[0].amount < 100000) lines[0].amount = 100000;
  const finalEnvelope = lines.reduce((s, l) => s + l.amount, 0);

  const strategies = [...new Set(lines.map((l) => PACING[l.k]))];
  return {
    envelope: finalEnvelope,
    risk: inv.risk,
    horizon: inv.horizon || 10,
    objectives: OBJECTIVES[inv.risk] || OBJECTIVES.equilibre,
    strategies,
    esg: [1, 2, 6, 9].includes(inv.key),
    diversification: inv.risk === "offensif" ? "large" : inv.risk === "prudent" ? "concentre" : "equilibre",
    scenario: inv.risk === "offensif" ? "optimiste" : inv.risk === "prudent" ? "prudent" : "central",
    distPace: inv.established ? 1 : 0,
    lines,
  };
}

/* ------- Dates utilitaires ------- */
function iso(d) { return d.toISOString().replace("T", " ").slice(0, 19) + "+00"; }
function daysAgo(n) { const d = new Date("2026-07-07T10:00:00Z"); d.setUTCDate(d.getUTCDate() - n); return d; }
function at(baseDaysAgo, hour = 10, min = 0) {
  const d = daysAgo(baseDaysAgo); d.setUTCHours(hour, min, 0, 0); return d;
}

/* ================= Génération du SQL ================= */
const clientIds = investors.map((inv) => uuid(1, inv.key));
const allocIds = investors.map((inv) => uuid(3, inv.key));

let out = [];
out.push("-- =====================================================================");
out.push("-- Données de démonstration réalistes — investisseurs, patrimoines,");
out.push("-- allocations, souscriptions, flux (appels/distributions) et timeline.");
out.push("-- Idempotent : purge du namespace UUID dédié puis réinsertion.");
out.push("-- =====================================================================");
out.push("begin;");
out.push("");
out.push("-- 1. Purge ciblée (les allocations passent en client_id NULL au delete client :");
out.push("--    on les supprime donc explicitement, ce qui cascade lignes + souscriptions).");
const idList = clientIds.map((x) => `'${x}'`).join(", ");
out.push(`delete from public.allocations where client_id in (${idList});`);
out.push(`delete from public.clients where id in (${idList});`);
out.push("");

/* ---- clients ---- */
out.push("-- 2. Clients (identité + qualification complète)");
for (const inv of investors) {
  const cid = uuid(1, inv.key);
  const created = iso(daysAgo(inv.status === "prospect" ? 40 : 380 - inv.key * 20));
  const updated = iso(daysAgo(inv.veryPartial ? 25 : 4));
  const emptyQ = "'{}'::jsonb";
  const kycJson = inv.veryPartial
    ? sqlJson({ situation_familiale: inv.situation, profession: inv.profession, statut_pro: inv.statutPro })
    : sqlJson(kyc(inv));
  const adqJson = inv.veryPartial ? emptyQ : inv.partial ? sqlJson({ conn_actions: "bonne", conn_non_cote: "aucune", objectif_principal: "croissance" }) : sqlJson(adequacy(inv));
  const esgJson = inv.veryPartial || inv.partial ? emptyQ : sqlJson(esg(inv));
  const taxJson = inv.veryPartial ? emptyQ : inv.partial ? sqlJson({ residence_fiscale: "france", tmi: inv.tmi }) : sqlJson(tax(inv));
  out.push(
    `insert into public.clients (id, cabinet_id, conseiller_id, reference, first_name, last_name, email, phone, address, birth_date, nationality, status, patrimoine_financier, risk_profile, experience, horizon_years, liquidity, notes, kyc, adequacy, esg_profile, tax, created_at, updated_at) values (` +
    `'${cid}', '${CABINET}', '${CONSEILLER}', ${sqlStr(inv.ref)}, ${sqlStr(inv.first)}, ${sqlStr(inv.last)}, ${sqlStr(inv.email)}, ${sqlStr(inv.phone)}, ${sqlStr(inv.address)}, ${sqlStr(inv.birth)}, 'Française', ${sqlStr(inv.status)}, ${sqlNum(inv.patrimoine)}, ${sqlStr(inv.risk)}, ${sqlStr(inv.experience)}, ${sqlNum(inv.horizon)}, ${sqlStr(inv.liquidity)}, ${sqlStr(inv.notes)}, ${kycJson}, ${adqJson}, ${esgJson}, ${taxJson}, '${created}', '${updated}');`
  );
}
out.push("");

/* ---- client_assets ---- */
out.push("-- 3. Patrimoine détaillé (client_assets)");
for (const inv of investors) {
  if (inv.veryPartial) continue; // pas encore de patrimoine renseigné
  const cid = uuid(1, inv.key);
  const assets = buildAssets(inv);
  assets.forEach((a, idx) => {
    const aid = uuid(2, inv.key, idx + 1);
    out.push(
      `insert into public.client_assets (id, client_id, cabinet_id, category, support, label, value, envelope, geography, note) values (` +
      `'${aid}', '${cid}', '${CABINET}', ${sqlStr(a.category)}, ${sqlStr(a.support)}, ${sqlStr(a.label)}, ${sqlNum(a.value)}, ${sqlStr(a.envelope)}, ${sqlStr(a.geography)}, ${sqlStr(a.note)});`
    );
  });
}
out.push("");

/* ---- allocations + lines + subscriptions ---- */
out.push("-- 4. Allocations (simulations), lignes et bulletins de souscription");
const subscribedKeys = new Set([1, 2, 3, 4, 6, 9]); // ont concrétisé au moins une souscription
for (const inv of investors) {
  if (inv.veryPartial) continue; // prospect non qualifié : pas de simulation
  const cid = uuid(1, inv.key);
  const aid = uuid(3, inv.key);
  const al = buildAllocation(inv);
  const subscribed = subscribedKeys.has(inv.key);
  const status = subscribed ? "subscribed" : inv.partial ? "draft" : "proposed";
  const aCreated = iso(daysAgo(inv.established ? 300 : 60));
  const aUpdated = iso(daysAgo(subscribed ? 20 : 6));
  const name = `Allocation ${inv.first} ${inv.last}`;
  out.push(
    `insert into public.allocations (id, cabinet_id, conseiller_id, client_id, name, envelope_amount, risk_profile, horizon_years, objectives, strategies, esg, diversification, scenario, dist_pace, status, created_at, updated_at) values (` +
    `'${aid}', '${CABINET}', '${CONSEILLER}', '${cid}', ${sqlStr(name)}, ${sqlNum(al.envelope)}, ${sqlStr(al.risk)}, ${sqlNum(al.horizon)}, ${sqlJson(al.objectives)}, ${sqlJson(al.strategies)}, ${sqlBool(al.esg)}, ${sqlStr(al.diversification)}, ${sqlStr(al.scenario)}, ${sqlNum(al.distPace)}, ${sqlStr(status)}, '${aCreated}', '${aUpdated}');`
  );
  al.lines.forEach((l, idx) => {
    const lid = uuid(4, inv.key, idx + 1);
    out.push(
      `insert into public.allocation_lines (id, allocation_id, fund_id, amount, created_at) values (` +
      `'${lid}', '${aid}', '${FUND[l.k]}', ${sqlNum(l.amount)}, '${aCreated}');`
    );
  });
  // Bulletins de souscription pour les allocations concrétisées
  if (subscribed) {
    const shortId = aid.slice(0, 8).toUpperCase();
    const statuses = ["received", "signed", "sent"]; // dégradé réaliste
    al.lines.forEach((l, idx) => {
      const sid = uuid(5, inv.key, idx + 1);
      const st = idx < 2 ? statuses[Math.min(idx, 2)] : (idx % 2 ? "signed" : "sent");
      const ref = `PC-${shortId}-${String(idx + 1).padStart(2, "0")}`;
      const gen = iso(daysAgo(inv.established ? 210 : 25));
      out.push(
        `insert into public.subscriptions (id, allocation_id, fund_id, cabinet_id, reference, amount, status, generated_at) values (` +
        `'${sid}', '${aid}', '${FUND[l.k]}', '${CABINET}', ${sqlStr(ref)}, ${sqlNum(l.amount)}, ${sqlStr(st)}, '${gen}');`
      );
    });
  }
}
out.push("");

/* ---- client_documents ---- */
out.push("-- 5. Documents (checklist KYC)");
const DOCS = [
  ["Pièce d'identité", "identite"],
  ["Justificatif de domicile", "domicile"],
  ["RIB", "rib"],
  ["Avis d'imposition", "fiscal"],
  ["Justificatif d'origine des fonds", "loi"],
];
for (const inv of investors) {
  if (inv.veryPartial) continue;
  const cid = uuid(1, inv.key);
  DOCS.forEach((d, idx) => {
    if (inv.partial && idx > 1) return; // prospect : dossier incomplet
    const did = uuid(6, inv.key, idx + 1);
    let st = "valide";
    if (inv.partial) st = idx === 0 ? "recu" : "manquant";
    else if (idx === 4 && !inv.established) st = "recu";
    const created = iso(daysAgo(inv.status === "prospect" ? 30 : 200 - inv.key * 5));
    out.push(
      `insert into public.client_documents (id, client_id, cabinet_id, name, doc_type, status, created_at) values (` +
      `'${did}', '${cid}', '${CABINET}', ${sqlStr(d[0])}, ${sqlStr(d[1])}, ${sqlStr(st)}, '${created}');`
    );
  });
}
out.push("");

/* ---- client_events (timeline) ---- */
out.push("-- 6. Timeline relationnelle (événements, flux appels/distributions)");
let evCounter = 0;
function ev(inv, i, type, actor, title, body, data, when) {
  const cid = uuid(1, inv.key);
  const eid = uuid(7, inv.key, i);
  out.push(
    `insert into public.client_events (id, client_id, cabinet_id, type, actor, title, body, data, occurred_at) values (` +
    `'${eid}', '${cid}', '${CABINET}', ${sqlStr(type)}, ${sqlStr(actor)}, ${sqlStr(title)}, ${sqlStr(body)}, ${sqlJson(data || {})}, '${iso(when)}');`
  );
}
for (const inv of investors) {
  let i = 0;
  const base = inv.status === "prospect" ? 40 : 380 - inv.key * 20;
  ev(inv, ++i, "client_created", "conseiller", "Dossier créé", null, {}, at(base, 9, 15));
  ev(inv, ++i, "meeting", "conseiller", "Rendez-vous de découverte", "Point patrimonial global et objectifs d'investissement.", {}, at(base - 2, 14, 30));

  if (inv.veryPartial) {
    ev(inv, ++i, "phone_call", "conseiller", "Premier échange téléphonique", "Prise de contact suite recommandation. RDV de découverte à planifier.", {}, at(base - 5, 11, 0));
    continue;
  }

  ev(inv, ++i, "questionnaire_updated", "conseiller", "Questionnaires de qualification complétés", "KYC, adéquation, ESG et fiscalité renseignés.", {}, at(base - 6, 16, 0));
  ev(inv, ++i, "login", "client", "Connexion au portail", null, {}, at(base - 8, 20, 12));
  ev(inv, ++i, "fund_viewed", "client", "Consultation d'un fonds", "Fiche fonds consultée depuis le portail.", {}, at(base - 8, 20, 20));

  // Positions antérieures : appels payés + distributions encaissées (fonds antérieurs)
  if (inv.established) {
    const legacy = [
      { name: "Ardian Buyout Fund VII (millésime 2018)", call: Math.round(inv.patrimoine * 0.05), dist: Math.round(inv.patrimoine * 0.03), cd: base - 40, dd: base - 25 },
      { name: "Eurazeo Growth II (millésime 2019)", call: Math.round(inv.patrimoine * 0.04), dist: Math.round(inv.patrimoine * 0.025), cd: base - 60, dd: base - 18 },
      { name: "Tikehau Private Debt IV (millésime 2020)", call: Math.round(inv.patrimoine * 0.03), dist: Math.round(inv.patrimoine * 0.02), cd: base - 90, dd: base - 12 },
    ];
    for (const lg of legacy) {
      ev(inv, ++i, "capital_call", "systeme", `Appel de fonds — ${lg.name}`, "Appel de capital honoré par virement.", { amount: lg.call, state: "payee", fund: lg.name }, at(lg.cd, 10, 0));
      ev(inv, ++i, "distribution", "systeme", `Distribution — ${lg.name}`, "Distribution encaissée (retour de capital + plus-value).", { amount: lg.dist, state: "encaissee", fund: lg.name }, at(lg.dd, 10, 0));
    }
    // Une distribution récente supplémentaire
    ev(inv, ++i, "distribution", "systeme", "Distribution — Ardian Secondary Fund VI", "Distribution partielle du millésime secondaire.", { amount: Math.round(inv.patrimoine * 0.015), state: "encaissee", fund: "Ardian Secondary Fund VI" }, at(base - 6, 9, 30));
  }

  if (inv.partial) {
    ev(inv, ++i, "note", "conseiller", "À relancer", "Qualification à finaliser avant proposition d'allocation.", {}, at(base - 10, 17, 0));
    continue;
  }

  // Parcours de proposition
  const al = buildAllocation(inv);
  const propDay = inv.established ? 300 : 60;
  ev(inv, ++i, "proposal_created", "conseiller", `Proposition d'allocation — ${formatEuro(al.envelope)}`, "Note d'allocation multi-fonds générée depuis le moteur.", { amount: al.envelope, allocation_id: uuid(3, inv.key) }, at(propDay, 15, 0));
  ev(inv, ++i, "proposal_sent", "conseiller", "Proposition envoyée au client", null, { allocation_id: uuid(3, inv.key) }, at(propDay - 1, 9, 0));
  ev(inv, ++i, "proposal_viewed", "client", "Proposition consultée", null, { allocation_id: uuid(3, inv.key) }, at(propDay - 1, 21, 40));

  if (subscribedKeys.has(inv.key)) {
    const subDay = inv.established ? 210 : 25;
    ev(inv, ++i, "subscription_created", "conseiller", "Bulletins de souscription générés", "Bulletins émis par compartiment.", { amount: al.envelope, allocation_id: uuid(3, inv.key) }, at(subDay, 11, 0));
    ev(inv, ++i, "subscription_signed", "client", "Bulletins signés électroniquement", "Signature électronique reçue.", { allocation_id: uuid(3, inv.key) }, at(subDay - 3, 18, 20));
    ev(inv, ++i, "email", "conseiller", "Confirmation d'enregistrement", "Accusé de réception de la société de gestion transmis.", {}, at(subDay - 5, 10, 0));
  } else {
    ev(inv, ++i, "phone_call", "conseiller", "Suivi de la proposition", "Échange sur le rythme d'appel et la fiscalité.", {}, at(propDay - 4, 11, 30));
  }
}
out.push("");
out.push("commit;");

function formatEuro(v) {
  return new Intl.NumberFormat("fr-FR").format(v) + " €";
}

process.stdout.write(out.join("\n"));
