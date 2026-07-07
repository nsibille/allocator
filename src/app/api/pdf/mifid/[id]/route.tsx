import { renderToBuffer } from "@react-pdf/renderer";
import { loadProposalData } from "@/lib/pdf/data";
import { MifidReportPdf } from "@/components/document/MifidReportPdf";

/** GET /api/pdf/mifid/[id] — rapport MiFID / AMF détaillé de la simulation (RLS-scopé). */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const data = await loadProposalData(id);
  if (!data) return new Response("Allocation introuvable.", { status: 404 });

  const buffer = await renderToBuffer(<MifidReportPdf data={data} />);
  const bytes = new Uint8Array(buffer);

  return new Response(bytes, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="rapport-mifid-${id}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
