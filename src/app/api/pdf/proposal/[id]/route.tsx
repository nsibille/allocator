import { renderToBuffer } from "@react-pdf/renderer";
import { loadProposalData } from "@/lib/pdf/data";
import { ProposalPdf } from "@/components/document/ProposalPdf";

/** GET /api/pdf/proposal/[id] — rend la note d'allocation en PDF (RLS-scopé). */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const data = await loadProposalData(id);
  if (!data) return new Response("Allocation introuvable.", { status: 404 });

  const buffer = await renderToBuffer(<ProposalPdf data={data} />);
  const bytes = new Uint8Array(buffer);

  return new Response(bytes, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="note-allocation-${id}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
