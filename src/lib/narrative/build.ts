import type {
  AllocationInput,
  AllocationLine,
  Fund,
  ProjectionMetrics,
  StrategyBucket,
} from "@/types/domain";
import {
  BUCKET_LABEL,
  BUCKET_ORDER,
  formatEuro,
  formatMultiple,
  formatPercent,
} from "@/lib/funds";

/* =========================================================================
   Discours d'accompagnement (CLAUDE_CODE_PROMPT §8.5) — logique pure.
   Génère 5–7 paragraphes à partir du profil et de l'allocation réelle,
   avec chiffres injectés dynamiquement.
   ========================================================================= */

const RISK_LABEL: Record<AllocationInput["riskProfile"], string> = {
  prudent: "prudent",
  equilibre: "équilibré",
  dynamique: "dynamique",
  offensif: "offensif",
};

export interface NarrativeContext {
  input: AllocationInput;
  lines: AllocationLine[];
  fundsById: Map<string, Fund>;
  metrics: ProjectionMetrics;
  horizonYears: number;
}

/** Répartition en euros par poche, à partir des lignes réelles. */
function bucketBreakdown(
  lines: AllocationLine[],
  fundsById: Map<string, Fund>,
): { bucket: StrategyBucket; amount: number }[] {
  const acc: Record<StrategyBucket, number> = {
    defensif: 0,
    coeur: 0,
    croissance: 0,
    satellite: 0,
  };
  for (const l of lines) {
    const f = fundsById.get(l.fundId);
    if (f) acc[f.bucket] += l.amount;
  }
  return BUCKET_ORDER.map((bucket) => ({ bucket, amount: acc[bucket] })).filter(
    (b) => b.amount > 0,
  );
}

/**
 * Construit le discours (tableau de paragraphes). Chaque paragraphe est du texte
 * brut, prêt à rendre dans l'UI (registre sombre) comme dans le PDF.
 */
export function buildNarrative(ctx: NarrativeContext): string[] {
  const { input, lines, fundsById, metrics, horizonYears } = ctx;
  const committed = metrics.committed;
  const fundCount = lines.filter((l) => l.amount > 0).length;
  const buckets = bucketBreakdown(lines, fundsById);
  const paragraphs: string[] = [];

  // 1. Cadre.
  paragraphs.push(
    `Cette note d'allocation formalise une enveloppe de ${formatEuro(
      committed,
    )} dédiée aux marchés privés, construite pour un profil ${
      RISK_LABEL[input.riskProfile]
    } sur un horizon de ${horizonYears} ans. Elle mobilise ${fundCount} compartiment${
      fundCount > 1 ? "s" : ""
    } de la gamme Private Corner, sélectionnés pour répondre aux objectifs exprimés lors de la qualification.`,
  );

  // 2. Architecture de portefeuille (poches).
  const bucketPhrase = buckets
    .map(
      (b) =>
        `${BUCKET_LABEL[b.bucket].toLowerCase()} ${formatPercent(
          b.amount / committed,
          0,
        )}`,
    )
    .join(", ");
  paragraphs.push(
    `L'architecture répartit le capital entre les poches suivantes : ${bucketPhrase}. Cette structuration hiérarchise le portefeuille entre un socle de préservation, un cœur générateur de performance et des moteurs de croissance, en cohérence avec la tolérance au risque retenue.`,
  );

  // 3. Diversification & lissage des millésimes.
  const closings = lines
    .map((l) => fundsById.get(l.fundId)?.closing_label)
    .filter((c): c is string => Boolean(c));
  const uniqueClosings = Array.from(new Set(closings));
  paragraphs.push(
    `La diversification s'exerce sur trois axes : les gérants, les stratégies et les millésimes. L'échelonnement des closings (${uniqueClosings
      .slice(0, 4)
      .join(", ")}${
      uniqueClosings.length > 4 ? "…" : ""
    }) lisse le déploiement du capital dans le temps et atténue le risque de point d'entrée propre à un millésime unique.`,
  );

  // 4. Gestion de la liquidité / courbe en J.
  paragraphs.push(
    `Le capital est appelé progressivement : la trésorerie nette atteint un point bas de l'ordre de ${formatEuro(
      metrics.peakCapital,
    )} avant que les distributions ne prennent le relais — c'est la courbe en J caractéristique du non-coté. La capacité à honorer les appels de fonds échelonnés et à immobiliser les sommes sur la durée conditionne la réussite de la stratégie.`,
  );

  // 5. Dimension durable (si applicable).
  const esgFunds = lines.filter(
    (l) => (fundsById.get(l.fundId)?.esg_score ?? 0) > 0,
  ).length;
  if (input.esg || input.objectives.includes("impact")) {
    paragraphs.push(
      `La dimension durable est intégrée à la sélection : ${esgFunds} compartiment${
        esgFunds > 1 ? "s présentent" : " présente"
      } une orientation extra-financière identifiée (décarbonation, transition, infrastructures essentielles), sans dérogation à l'exigence de performance.`,
    );
  }

  // 6. Profil de performance visé.
  paragraphs.push(
    `Sur le scénario central, l'allocation vise un multiple de ${formatMultiple(
      metrics.tvpi,
    )} (TVPI) et un TRI net estimé de ${formatPercent(
      metrics.netIrr,
    )}, soit une valeur projetée de ${formatEuro(
      metrics.projectedValue,
    )} à terme et une plus-value de l'ordre de ${formatEuro(
      metrics.gain,
    )}. Ces hypothèses restent indicatives et non garanties.`,
  );

  // 7. Points d'attention.
  paragraphs.push(
    `Points d'attention : les investissements en non-coté sont par nature illiquides et exposés à un risque de perte en capital ; les appels de fonds interviennent de manière échelonnée et non planifiable au jour près ; la détention doit s'inscrire dans une enveloppe et une durée compatibles avec l'immobilisation. Cette note ne constitue ni un conseil en investissement personnalisé ni une garantie de résultat.`,
  );

  return paragraphs;
}
