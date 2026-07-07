import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { PageShell } from "@/components/layout/PageShell";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { DOCUMENT_FOLDERS } from "@/lib/portal/demo";

/**
 * portal-documents-browser — bibliothèque documentaire du cabinet : index des
 * dossiers à gauche, liste des pièces à droite. Métadonnées seules (démo, non
 * téléchargeables — voir `lib/portal/demo.ts`).
 */
export default function DocumentsPage() {
  const files = DOCUMENT_FOLDERS.flatMap((folder) =>
    folder.documents.map((doc) => ({ ...doc, folder: folder.name })),
  );
  const total = files.length;

  return (
    <PageShell className="py-14">
      <Eyebrow>Cabinet</Eyebrow>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-6">
        <h1 className="text-[42px] font-medium leading-[46px] tracking-[-0.01em]">
          Mes <em className="pc">documents</em>
        </h1>
        <p className="text-[13px] text-muted">
          {DOCUMENT_FOLDERS.length} dossiers · {total} documents
        </p>
      </div>

      {/* Recherche (démonstration visuelle) */}
      <div className="mt-8">
        <input
          type="search"
          placeholder="Rechercher un document"
          className="w-full max-w-md rounded-field border border-black/15 bg-white px-4 py-3 text-[15px] text-slate placeholder:text-muted"
        />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
        {/* Index des dossiers */}
        <aside className="rounded-card border border-black/10 bg-cream-2 p-5">
          <p className="text-[11px] uppercase tracking-[0.06em] text-muted">
            Dossiers ({DOCUMENT_FOLDERS.length})
          </p>
          <ul className="mt-4 flex flex-col gap-1">
            {DOCUMENT_FOLDERS.map((folder) => (
              <li
                key={folder.id}
                className="flex items-center justify-between rounded-field px-3 py-2.5 text-[14px] text-slate transition-colors hover:bg-white"
              >
                <span className="font-medium">{folder.name}</span>
                <span className="text-[12px] text-muted">
                  {folder.documents.length}
                </span>
              </li>
            ))}
          </ul>
        </aside>

        {/* Liste des documents */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse">
            <thead>
              <tr className="border-b border-black/15 text-left">
                {["Nom", "Dossier", "Ajouté le", "Taille"].map((h) => (
                  <th
                    key={h}
                    className="pb-3 text-[11px] uppercase tracking-[0.06em] text-muted"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {files.map((doc) => (
                <tr
                  key={doc.id}
                  className="border-b border-black/10 transition-colors hover:bg-white"
                >
                  <td className="py-4">
                    <span className="font-medium">{doc.name}</span>
                    <span className="mt-0.5 block text-[12px] text-muted">
                      {doc.kind}
                    </span>
                  </td>
                  <td className="py-4 text-slate">{doc.folder}</td>
                  <td className="py-4 text-slate">
                    {format(new Date(doc.addedAt), "d MMM yyyy", { locale: fr })}
                  </td>
                  <td className="py-4 text-slate">{doc.size}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PageShell>
  );
}
