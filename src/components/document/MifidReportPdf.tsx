import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import { PDF, AMF_AGREMENT } from "@/lib/pdf/theme";
import { assetClassFor, fundFacts } from "@/lib/catalog";
import { type ExposureSlice } from "@/lib/fonds/transparence";
import { consolidateFromPairs } from "@/lib/allocation/exposure";
import { pdfEuro, pdfMultiple, pdfPercent } from "@/lib/pdf/format";
import { MIFID_STATUS_LABEL, VEHICLE_LABEL } from "@/lib/funds";
import type { ProposalData } from "@/lib/pdf/data";
import type { MifidStatus, Vehicle } from "@/types/domain";

/* doc-mifid-report — rapport MiFID / AMF détaillé généré depuis la simulation :
   catégorisation, profil type & score de dynamisme, allocation, exposition
   consolidée, comparatif de scénarios, argumentaire, adéquation et mentions. */

const s = StyleSheet.create({
  page: { fontFamily: PDF.font, fontSize: 10, color: PDF.slate, backgroundColor: PDF.white },
  cover: { backgroundColor: PDF.base, color: PDF.white, padding: 40 },
  brandRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  brand: { fontSize: 11, letterSpacing: 3, color: PDF.white, fontFamily: PDF.fontBold },
  eyebrow: { fontSize: 8, letterSpacing: 2, color: PDF.coral, textTransform: "uppercase" },
  title: { fontSize: 22, marginTop: 8, color: PDF.white, fontFamily: PDF.fontBold },
  metaRow: { flexDirection: "row", marginTop: 22, gap: 22, flexWrap: "wrap" },
  metaItem: { flexDirection: "column", width: "30%" },
  metaLabel: { fontSize: 7, letterSpacing: 1.5, color: PDF.mist, textTransform: "uppercase" },
  metaValue: { fontSize: 10, marginTop: 3, color: PDF.white },
  kpiRow: { flexDirection: "row", marginTop: 24, gap: 20 },
  kpi: { flexGrow: 1 },
  kpiValue: { fontSize: 15, color: PDF.white, fontFamily: PDF.fontBold },
  kpiLabel: { fontSize: 7, letterSpacing: 1, color: PDF.mist, textTransform: "uppercase", marginTop: 3 },
  body: { padding: 40 },
  h2: { fontSize: 13, color: PDF.slateDeep, fontFamily: PDF.fontBold, marginBottom: 10 },
  // Profil type
  profileRow: { flexDirection: "row", gap: 24 },
  scoreBox: { width: "32%", borderWidth: 1, borderColor: PDF.line, borderRadius: 8, padding: 16 },
  scoreValue: { fontSize: 34, color: PDF.coral, fontFamily: PDF.fontBold },
  scoreLabel: { fontSize: 8, color: PDF.muted, marginTop: 2 },
  profileTag: { fontSize: 11, color: PDF.slateDeep, fontFamily: PDF.fontBold, marginTop: 10 },
  barsCol: { flexGrow: 1, width: "64%" },
  barItem: { marginBottom: 7 },
  barTop: { flexDirection: "row", justifyContent: "space-between", marginBottom: 2 },
  barLabel: { fontSize: 8.5, color: PDF.slate },
  barVal: { fontSize: 8.5, color: PDF.slateDeep, fontFamily: PDF.fontBold },
  barTrack: { height: 4, backgroundColor: PDF.line, borderRadius: 2 },
  barFill: { height: 4, backgroundColor: PDF.coral, borderRadius: 2 },
  // Table allocation
  tHead: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: PDF.slate, paddingBottom: 5 },
  tRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: PDF.line, paddingVertical: 7 },
  cFund: { width: "46%" },
  cClass: { width: "20%" },
  cShare: { width: "16%", textAlign: "right" },
  cAmount: { width: "18%", textAlign: "right" },
  th: { fontSize: 7, letterSpacing: 1, color: PDF.muted, textTransform: "uppercase" },
  fundName: { fontSize: 10, color: PDF.slateDeep, fontFamily: PDF.fontBold },
  fundSub: { fontSize: 8, color: PDF.muted, marginTop: 2 },
  totalRow: { flexDirection: "row", marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: PDF.slate },
  // Scénarios
  scHead: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: PDF.slate, paddingBottom: 5 },
  scRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: PDF.line, paddingVertical: 7 },
  scName: { width: "28%" },
  scCell: { width: "18%", textAlign: "right" },
  // Exposition
  expoRow: { flexDirection: "row", gap: 24, marginTop: 6 },
  expoCol: { flexGrow: 1, width: "50%" },
  expoAxis: { fontSize: 8, letterSpacing: 1, color: PDF.muted, textTransform: "uppercase", marginBottom: 6 },
  expoItem: { marginBottom: 5 },
  expoLine: { flexDirection: "row", justifyContent: "space-between", marginBottom: 2 },
  expoLabel: { fontSize: 8.5, color: PDF.slate },
  expoPct: { fontSize: 8, color: PDF.muted },
  expoTrack: { height: 3, backgroundColor: PDF.line, borderRadius: 2 },
  expoFill: { height: 3, backgroundColor: PDF.coral, borderRadius: 2 },
  para: { fontSize: 9.5, lineHeight: 1.5, color: PDF.slate, marginBottom: 7 },
  bullet: { fontSize: 9, lineHeight: 1.45, color: PDF.slate, marginBottom: 4 },
  mentions: { marginTop: 18, paddingTop: 12, borderTopWidth: 1, borderTopColor: PDF.line, fontSize: 7.5, lineHeight: 1.4, color: PDF.muted },
  footer: { position: "absolute", bottom: 20, left: 40, right: 40, flexDirection: "row", justifyContent: "space-between", fontSize: 7, color: PDF.muted },
});

const SCENARIO_LABEL: Record<string, string> = {
  prudent: "Pessimiste",
  central: "Central (référence)",
  optimiste: "Optimiste",
};

function ExpoColumn({ title, slices }: { title: string; slices: ExposureSlice[] }) {
  const top = [...slices].sort((a, b) => b.weight - a.weight).slice(0, 6);
  return (
    <View style={s.expoCol}>
      <Text style={s.expoAxis}>{title}</Text>
      {top.map((sl) => (
        <View style={s.expoItem} key={sl.label}>
          <View style={s.expoLine}>
            <Text style={s.expoLabel}>{sl.label}</Text>
            <Text style={s.expoPct}>{pdfPercent(sl.weight, 0)}</Text>
          </View>
          <View style={s.expoTrack}>
            <View style={[s.expoFill, { width: `${Math.round(sl.weight * 100)}%` }]} />
          </View>
        </View>
      ))}
    </View>
  );
}

export function MifidReportPdf({ data }: { data: ProposalData }) {
  const { allocation, cabinet, conseiller, client, lines, metrics, narrative, qualification, scenarios } =
    data;
  const total = lines.reduce((sum, l) => sum + l.amount, 0);
  const exposure = consolidateFromPairs(lines);
  const mifidStatus = qualification?.mifidStatus as MifidStatus | undefined;

  return (
    <Document title={`Rapport MiFID / AMF — ${allocation.name}`}>
      <Page size="A4" style={s.page}>
        {/* Couverture */}
        <View style={s.cover}>
          <View style={s.brandRow}>
            <Text style={s.brand}>PRIVATE CORNER</Text>
            <Text style={s.metaLabel}>Rapport MiFID II / AMF</Text>
          </View>
          <View style={{ marginTop: 24 }}>
            <Text style={s.eyebrow}>Adéquation · marchés privés</Text>
            <Text style={s.title}>{allocation.name}</Text>
          </View>

          <View style={s.metaRow}>
            <View style={s.metaItem}>
              <Text style={s.metaLabel}>Cabinet</Text>
              <Text style={s.metaValue}>{cabinet?.name ?? "—"}</Text>
            </View>
            <View style={s.metaItem}>
              <Text style={s.metaLabel}>Conseiller</Text>
              <Text style={s.metaValue}>
                {conseiller?.full_name ?? conseiller?.email ?? "—"}
              </Text>
            </View>
            <View style={s.metaItem}>
              <Text style={s.metaLabel}>Référence client</Text>
              <Text style={s.metaValue}>{client?.reference ?? "—"}</Text>
            </View>
            <View style={s.metaItem}>
              <Text style={s.metaLabel}>Statut MiFID</Text>
              <Text style={s.metaValue}>
                {mifidStatus ? MIFID_STATUS_LABEL[mifidStatus] : "—"}
              </Text>
            </View>
            <View style={s.metaItem}>
              <Text style={s.metaLabel}>Enveloppes éligibles</Text>
              <Text style={s.metaValue}>
                {qualification?.acceptedVehicles?.length
                  ? qualification.acceptedVehicles
                      .map((v) => VEHICLE_LABEL[v as Vehicle])
                      .join(" · ")
                  : "—"}
              </Text>
            </View>
            <View style={s.metaItem}>
              <Text style={s.metaLabel}>Horizon</Text>
              <Text style={s.metaValue}>{allocation.horizonYears} ans</Text>
            </View>
          </View>

          <View style={s.kpiRow}>
            <Kpi label="Engagement" value={pdfEuro(metrics.committed)} />
            <Kpi label="TVPI cible" value={pdfMultiple(metrics.tvpi)} />
            <Kpi label="TRI net estimé" value={pdfPercent(metrics.netIrr)} />
            <Kpi label="Valeur projetée" value={pdfEuro(metrics.projectedValue)} />
          </View>
        </View>

        {/* Corps */}
        <View style={s.body}>
          {/* Profil type & score de dynamisme */}
          {qualification && (
            <View wrap={false}>
              <Text style={s.h2}>Profil investisseur & score de dynamisme</Text>
              <View style={s.profileRow}>
                <View style={s.scoreBox}>
                  <Text style={s.scoreValue}>{qualification.dynamismScore}</Text>
                  <Text style={s.scoreLabel}>Score de dynamisme / 100</Text>
                  <Text style={s.profileTag}>{qualification.profileLabel}</Text>
                </View>
                <View style={s.barsCol}>
                  {qualification.subScores.map((sub) => (
                    <View style={s.barItem} key={sub.key}>
                      <View style={s.barTop}>
                        <Text style={s.barLabel}>{sub.label}</Text>
                        <Text style={s.barVal}>{sub.value}/100</Text>
                      </View>
                      <View style={s.barTrack}>
                        <View style={[s.barFill, { width: `${sub.value}%` }]} />
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          )}

          {/* Répartition */}
          <Text style={[s.h2, { marginTop: 22 }]}>Répartition de l&apos;enveloppe</Text>
          <View style={s.tHead}>
            <Text style={[s.cFund, s.th]}>Compartiment</Text>
            <Text style={[s.cClass, s.th]}>Classe · positionnement</Text>
            <Text style={[s.cShare, s.th]}>Part</Text>
            <Text style={[s.cAmount, s.th]}>Montant</Text>
          </View>
          {lines.map(({ fund, amount }) => (
            <View style={s.tRow} key={fund.id} wrap={false}>
              <View style={s.cFund}>
                <Text style={s.fundName}>{fund.name}</Text>
                <Text style={s.fundSub}>
                  {fund.manager} · {VEHICLE_LABEL[fund.vehicle as Vehicle]} · ticket{" "}
                  {pdfEuro(fund.min_ticket)} · closing {fund.closing_label}
                </Text>
              </View>
              <Text style={s.cClass}>
                {assetClassFor(fund.pacing)} · {fundFacts(fund).positioning}
              </Text>
              <Text style={s.cShare}>
                {total > 0 ? pdfPercent(amount / total, 0) : "—"}
              </Text>
              <Text style={[s.cAmount, { fontFamily: PDF.fontBold }]}>
                {pdfEuro(amount)}
              </Text>
            </View>
          ))}
          <View style={s.totalRow}>
            <Text style={[s.cFund, { fontFamily: PDF.fontBold, color: PDF.slateDeep }]}>
              Total engagé
            </Text>
            <Text style={s.cClass}> </Text>
            <Text style={s.cShare}> </Text>
            <Text style={[s.cAmount, { fontFamily: PDF.fontBold, color: PDF.slateDeep }]}>
              {pdfEuro(total)}
            </Text>
          </View>

          {/* Exposition consolidée */}
          {exposure.covered > 0 && (
            <View wrap={false}>
              <Text style={[s.h2, { marginTop: 22 }]}>
                Exposition consolidée (transparisée)
              </Text>
              <View style={s.expoRow}>
                <ExpoColumn title="Géographie" slices={exposure.geography} />
                <ExpoColumn title="Secteur d'activité" slices={exposure.sector} />
              </View>
              <View style={[s.expoRow, { marginTop: 10 }]}>
                <ExpoColumn title="Stade" slices={exposure.stage} />
                <View style={s.expoCol} />
              </View>
            </View>
          )}

          {/* Comparatif de scénarios */}
          <View wrap={false}>
            <Text style={[s.h2, { marginTop: 22 }]}>Analyse de scénarios</Text>
            <View style={s.scHead}>
              <Text style={[s.scName, s.th]}>Scénario</Text>
              <Text style={[s.scCell, s.th]}>TVPI</Text>
              <Text style={[s.scCell, s.th]}>TRI net</Text>
              <Text style={[s.scCell, s.th]}>DPI</Text>
              <Text style={[s.scCell, s.th]}>Valeur projetée</Text>
            </View>
            {scenarios.map(({ scenario, metrics: m }) => (
              <View style={s.scRow} key={scenario} wrap={false}>
                <Text style={[s.scName, { fontFamily: PDF.fontBold, color: PDF.slateDeep }]}>
                  {SCENARIO_LABEL[scenario] ?? scenario}
                </Text>
                <Text style={s.scCell}>{pdfMultiple(m.tvpi)}</Text>
                <Text style={s.scCell}>{pdfPercent(m.netIrr)}</Text>
                <Text style={s.scCell}>{pdfMultiple(m.dpi)}</Text>
                <Text style={s.scCell}>{pdfEuro(m.projectedValue)}</Text>
              </View>
            ))}
            <Text style={[s.fundSub, { marginTop: 6 }]}>
              Hypothèses non garanties. Le scénario central sert de référence ; les
              scénarios pessimiste et optimiste ajustent les multiples cibles.
            </Text>
          </View>

          {/* Argumentaire */}
          <Text style={[s.h2, { marginTop: 22 }]}>Argumentaire & adéquation</Text>
          {narrative.map((para, i) => (
            <Text style={s.para} key={i}>
              {para}
            </Text>
          ))}

          {/* Facteurs de risque */}
          <Text style={[s.h2, { marginTop: 12 }]}>Facteurs de risque</Text>
          <Text style={s.bullet}>
            · Risque de perte en capital : les investissements en actifs non cotés ne
            sont pas garantis et peuvent entraîner une perte totale du capital investi.
          </Text>
          <Text style={s.bullet}>
            · Illiquidité : capital immobilisé sur la durée de vie des fonds, sans
            possibilité de rachat anticipé garanti.
          </Text>
          <Text style={s.bullet}>
            · Courbe en J : rendement initialement négatif du fait des appels de fonds
            et des frais avant les premières distributions.
          </Text>
          <Text style={s.bullet}>
            · Appels de fonds échelonnés : l&apos;investisseur doit disposer de la
            trésorerie nécessaire pour honorer les appels sur plusieurs années.
          </Text>

          <Text style={s.mentions}>
            Rapport établi au titre du devoir de conseil (directive MiFID II,
            règlement général AMF) à partir des réponses de qualification et de la
            simulation. Document non contractuel : les performances cibles (multiple,
            TRI, DPI) sont des hypothèses non garanties. L&apos;adéquation retenue
            repose sur les informations déclarées par le conseiller. Private Corner —
            société de gestion de portefeuille agréée par l&apos;AMF sous le numéro{" "}
            {AMF_AGREMENT}
            {cabinet?.orias ? ` · Cabinet ORIAS ${cabinet.orias}` : ""}.
          </Text>
        </View>

        <View style={s.footer} fixed>
          <Text>Private Corner · Rapport MiFID / AMF</Text>
          <Text
            render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
          />
        </View>
      </Page>
    </Document>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <View style={s.kpi}>
      <Text style={s.kpiValue}>{value}</Text>
      <Text style={s.kpiLabel}>{label}</Text>
    </View>
  );
}
