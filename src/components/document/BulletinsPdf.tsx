import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import { PDF, AMF_AGREMENT } from "@/lib/pdf/theme";
import { BUCKET_LABEL, PACING_LABEL } from "@/lib/funds";
import { pdfEuro } from "@/lib/pdf/format";
import type { ProposalData } from "@/lib/pdf/data";

/* doc-bulletin-card — un bulletin de souscription par compartiment. */

export interface BulletinLine {
  fundId: string;
  reference: string;
}

const s = StyleSheet.create({
  page: { fontFamily: PDF.font, fontSize: 10, color: PDF.slate, padding: 40, backgroundColor: PDF.white },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", borderBottomWidth: 1, borderBottomColor: PDF.slate, paddingBottom: 12 },
  brand: { fontSize: 11, letterSpacing: 3, color: PDF.slateDeep, fontFamily: PDF.fontBold },
  docType: { fontSize: 8, letterSpacing: 1.5, color: PDF.coral, textTransform: "uppercase", textAlign: "right" },
  ref: { fontSize: 9, color: PDF.muted, marginTop: 3, textAlign: "right" },
  title: { fontSize: 18, color: PDF.slateDeep, fontFamily: PDF.fontBold, marginTop: 18 },
  sub: { fontSize: 9, color: PDF.muted, marginTop: 3 },
  section: { marginTop: 20 },
  sectionLabel: { fontSize: 7.5, letterSpacing: 1.5, color: PDF.muted, textTransform: "uppercase", marginBottom: 8 },
  grid: { flexDirection: "row", flexWrap: "wrap" },
  cell: { width: "50%", marginBottom: 10 },
  cellLabel: { fontSize: 7.5, color: PDF.muted, textTransform: "uppercase", letterSpacing: 1 },
  cellValue: { fontSize: 11, color: PDF.slateDeep, marginTop: 2 },
  amountBox: { marginTop: 8, backgroundColor: PDF.cream, borderRadius: 8, padding: 16, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  amountLabel: { fontSize: 8, letterSpacing: 1, color: PDF.muted, textTransform: "uppercase" },
  amountValue: { fontSize: 22, color: PDF.slateDeep, fontFamily: PDF.fontBold },
  signRow: { flexDirection: "row", gap: 24, marginTop: 34 },
  signBox: { flexGrow: 1, borderTopWidth: 1, borderTopColor: PDF.slate, paddingTop: 6 },
  signLabel: { fontSize: 8, color: PDF.muted },
  mentions: { position: "absolute", bottom: 30, left: 40, right: 40, fontSize: 7.5, lineHeight: 1.4, color: PDF.muted, borderTopWidth: 1, borderTopColor: PDF.line, paddingTop: 10 },
});

export function BulletinsPdf({
  data,
  bulletins,
}: {
  data: ProposalData;
  bulletins: BulletinLine[];
}) {
  const { cabinet, conseiller, client } = data;
  const byFund = new Map(data.lines.map((l) => [l.fund.id, l]));

  return (
    <Document title={`Bulletins de souscription — ${data.allocation.name}`}>
      {bulletins.map((b) => {
        const line = byFund.get(b.fundId);
        if (!line) return null;
        const { fund, amount } = line;
        return (
          <Page size="A4" style={s.page} key={b.fundId}>
            <View style={s.header}>
              <Text style={s.brand}>PRIVATE CORNER</Text>
              <View>
                <Text style={s.docType}>Bulletin de souscription</Text>
                <Text style={s.ref}>Réf. {b.reference}</Text>
              </View>
            </View>

            <Text style={s.title}>{fund.name}</Text>
            <Text style={s.sub}>
              {fund.manager} · {BUCKET_LABEL[fund.bucket]} ·{" "}
              {PACING_LABEL[fund.pacing]} · {fund.strategy}
            </Text>

            <View style={s.section}>
              <Text style={s.sectionLabel}>Données de souscription (mutualisées)</Text>
              <View style={s.grid}>
                <View style={s.cell}>
                  <Text style={s.cellLabel}>Cabinet</Text>
                  <Text style={s.cellValue}>{cabinet?.name ?? "—"}</Text>
                </View>
                <View style={s.cell}>
                  <Text style={s.cellLabel}>Conseiller</Text>
                  <Text style={s.cellValue}>
                    {conseiller?.full_name ?? conseiller?.email ?? "—"}
                  </Text>
                </View>
                <View style={s.cell}>
                  <Text style={s.cellLabel}>Référence souscripteur</Text>
                  <Text style={s.cellValue}>{client?.reference ?? "—"}</Text>
                </View>
                <View style={s.cell}>
                  <Text style={s.cellLabel}>Closing visé</Text>
                  <Text style={s.cellValue}>{fund.closing_label}</Text>
                </View>
                <View style={s.cell}>
                  <Text style={s.cellLabel}>Ticket minimum</Text>
                  <Text style={s.cellValue}>{pdfEuro(fund.min_ticket)}</Text>
                </View>
                <View style={s.cell}>
                  <Text style={s.cellLabel}>Agrément gestionnaire</Text>
                  <Text style={s.cellValue}>AMF {AMF_AGREMENT}</Text>
                </View>
              </View>

              <View style={s.amountBox}>
                <Text style={s.amountLabel}>Montant souscrit</Text>
                <Text style={s.amountValue}>{pdfEuro(amount)}</Text>
              </View>
            </View>

            <View style={s.signRow}>
              <View style={s.signBox}>
                <Text style={s.signLabel}>Le souscripteur (via mandataire)</Text>
              </View>
              <View style={s.signBox}>
                <Text style={s.signLabel}>Le conseiller · date et signature</Text>
              </View>
            </View>

            <Text style={s.mentions}>
              Bulletin établi dans le cadre d&apos;une gestion déléguée. La
              souscription en actifs non cotés est irrévocable, illiquide et
              expose à un risque de perte en capital ; les appels de fonds sont
              échelonnés. Private Corner — société de gestion agréée AMF{" "}
              {AMF_AGREMENT}
              {cabinet?.orias ? ` · Cabinet ORIAS ${cabinet.orias}` : ""}.
            </Text>
          </Page>
        );
      })}
    </Document>
  );
}
