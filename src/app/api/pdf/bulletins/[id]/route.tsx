import { renderToBuffer } from "@react-pdf/renderer";
import { loadProposalData } from "@/lib/pdf/data";
import { createClient } from "@/lib/supabase/server";
import {
  BulletinsPdf,
  type BulletinLine,
} from "@/components/document/BulletinsPdf";

/**
 * GET /api/pdf/bulletins/[id] — génère les bulletins de souscription.
 * Crée les lignes `subscriptions` (status generated) si absentes, puis rend le PDF.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const data = await loadProposalData(id);
  if (!data || data.lines.length === 0) {
    return new Response("Allocation introuvable ou vide.", { status: 404 });
  }

  const supabase = await createClient();
  const { data: allocation } = await supabase
    .from("allocations")
    .select("cabinet_id")
    .eq("id", id)
    .single();
  if (!allocation) return new Response("Allocation introuvable.", { status: 404 });

  // Subscriptions déjà générées ? (idempotent : on ne recrée pas à chaque téléchargement.)
  const { data: existing } = await supabase
    .from("subscriptions")
    .select("fund_id, reference")
    .eq("allocation_id", id);

  let bulletins: BulletinLine[];
  if (existing && existing.length > 0) {
    bulletins = existing.map((e) => ({
      fundId: e.fund_id,
      reference: e.reference,
    }));
  } else {
    const rows = data.lines.map((l, i) => ({
      allocation_id: id,
      fund_id: l.fund.id,
      cabinet_id: allocation.cabinet_id,
      reference: `PC-${id.slice(0, 8).toUpperCase()}-${String(i + 1).padStart(2, "0")}`,
      amount: l.amount,
      status: "generated" as const,
    }));
    const { error } = await supabase.from("subscriptions").insert(rows);
    if (error) {
      return new Response("Échec de la création des bulletins.", { status: 500 });
    }
    bulletins = rows.map((r) => ({ fundId: r.fund_id, reference: r.reference }));
  }

  // Ordonne les bulletins selon l'ordre d'affichage des lignes.
  const order = new Map(data.lines.map((l, i) => [l.fund.id, i]));
  bulletins.sort((a, b) => (order.get(a.fundId) ?? 0) - (order.get(b.fundId) ?? 0));

  const buffer = await renderToBuffer(
    <BulletinsPdf data={data} bulletins={bulletins} />,
  );
  const bytes = new Uint8Array(buffer);

  return new Response(bytes, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="bulletins-${id}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
