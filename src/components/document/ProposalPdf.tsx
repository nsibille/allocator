import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import { PDF, AMF_AGREMENT } from "@/lib/pdf/theme";
import { assetClassFor, fundFacts } from "@/lib/catalog";
import { getTransparence } from "@/lib/fonds/transparence";
import { pdfEuro, pdfMultiple, pdfPercent } from "@/lib/pdf/format";
import type { ProposalData } from "@/lib/pdf/data";

/* doc-proposal-pdf — note d'allocation (couverture sombre + corps clair + mentions AMF). */

const s = StyleSheet.create({
  page: { fontFamily: PDF.font, fontSize: 10, color: PDF.slate, backgroundColor: PDF.white },
  cover: { backgroundColor: PDF.base, color: PDF.white, padding: 40 },
  brandRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  brand: { fontSize: 11, letterSpacing: 3, color: PDF.white, fontFamily: PDF.fontBold },
  eyebrow: { fontSize: 8, letterSpacing: 2, color: PDF.coral, textTransform: "uppercase" },
  title: { fontSize: 24, marginTop: 8, color: PDF.white, fontFamily: PDF.fontBold },
  metaRow: { flexDirection: "row", marginTop: 24, gap: 28 },
  metaItem: { flexDirection: "column" },
  metaLabel: { fontSize: 7, letterSpacing: 1.5, color: PDF.mist, textTransform: "uppercase" },
  metaValue: { fontSize: 11, marginTop: 3, color: PDF.white },
  kpiRow: { flexDirection: "row", marginTop: 28, gap: 20 },
  kpi: { flexGrow: 1 },
  kpiValue: { fontSize: 15, color: PDF.white, fontFamily: PDF.fontBold },
  kpiUnit: { color: PDF.coral },
  kpiLabel: { fontSize: 7, letterSpacing: 1, color: PDF.mist, textTransform: "uppercase", marginTop: 3 },
  body: { padding: 40 },
  h2: { fontSize: 13, color: PDF.slateDeep, fontFamily: PDF.fontBold, marginBottom: 10 },
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
  para: { fontSize: 9.5, lineHeight: 1.5, color: PDF.slate, marginBottom: 7 },
  mentions: { marginTop: 20, paddingTop: 12, borderTopWidth: 1, borderTopColor: PDF.line, fontSize: 7.5, lineHeight: 1.4, color: PDF.muted },
  footer: { position: "absolute", bottom: 20, left: 40, right: 40, flexDirection: "row", justifyContent: "space-between", fontSize: 7, color: PDF.muted },
});

const SCENARIO_LABEL: Record<string, string> = {
  prudent: "Prudent",
  central: "Central",
  optimiste: "Optimiste",
};

export function ProposalPdf({ data }: { data: ProposalData }) {
  const { allocation, cabinet, conseiller, client, lines, metrics, narrative } = data;
  const total = lines.reduce((sum, l) => sum + l.amount, 0);

  return (
    <Document title={`Note d'allocation — ${allocation.name}`}>
      <Page size="A4" style={s.page}>
        {/* Couverture */}
        <View style={s.cover}>
          <View style={s.brandRow}>
            <Text style={s.brand}>PRIVATE CORNER</Text>
            <Text style={s.metaLabel}>Note d&apos;allocation</Text>
          </View>
          <View style={{ marginTop: 26 }}>
            <Text style={s.eyebrow}>Gestion déléguée · marchés privés</Text>
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
              <Text style={s.metaLabel}>Scénario</Text>
              <Text style={s.metaValue}>
                {SCENARIO_LABEL[allocation.scenario] ?? allocation.scenario}
              </Text>
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
          <Text style={s.h2}>Répartition de l&apos;enveloppe</Text>
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
                  {fund.manager} ·{" "}
                  {getTransparence(fund.slug)?.structureType ?? "Feeder"} · ticket{" "}
                  {pdfEuro(fund.min_ticket)} · closing {fund.closing_label}
                </Text>
              </View>
              <Text style={[s.cClass]}>
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

          <Text style={[s.h2, { marginTop: 24 }]}>Argumentaire</Text>
          {narrative.map((para, i) => (
            <Text style={s.para} key={i}>
              {para}
            </Text>
          ))}

          <Text style={s.mentions}>
            Document non contractuel établi à titre indicatif. Les performances
            cibles (multiple, TRI) sont des hypothèses non garanties ; les
            investissements en actifs non cotés présentent un risque de perte en
            capital et une illiquidité structurelle. Private Corner — société de
            gestion de portefeuille agréée par l&apos;AMF sous le numéro{" "}
            {AMF_AGREMENT}
            {cabinet?.orias ? ` · Cabinet ORIAS ${cabinet.orias}` : ""}.
          </Text>
        </View>

        <View style={s.footer} fixed>
          <Text>Private Corner · Note d&apos;allocation</Text>
          <Text
            render={({ pageNumber, totalPages }) =>
              `${pageNumber} / ${totalPages}`
            }
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
