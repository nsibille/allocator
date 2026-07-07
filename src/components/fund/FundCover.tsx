import type { CoverTone } from "@/lib/catalog";

/**
 * fund-cover-illustration — visuel abstrait génératif d'un fonds (aucune image
 * externe). Rendu SVG déterministe à partir d'un `seed` : dégradés issus des
 * tokens (teal / ink / coral / muted), arcs concentriques évoquant l'architecture
 * du handoff. Zéro hex en dur — toutes les couleurs via variables CSS.
 */

const PALETTES: Record<CoverTone, { from: string; to: string; glow: string }> = {
  cool: { from: "var(--color-teal)", to: "var(--color-ink)", glow: "var(--color-teal)" },
  warm: { from: "var(--color-teal)", to: "var(--color-ink)", glow: "var(--color-coral)" },
  soon: { from: "var(--color-base)", to: "var(--color-ink)", glow: "var(--color-coral)" },
  closed: { from: "var(--color-muted)", to: "var(--color-base)", glow: "var(--color-muted)" },
};

/** Hash FNV-1a → générateur pseudo-aléatoire déterministe (mulberry32). */
function rng(seed: string): () => number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  let a = h >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function FundCover({
  seed,
  tone,
  className = "",
  rounded = true,
}: {
  seed: string;
  tone: CoverTone;
  className?: string;
  rounded?: boolean;
}) {
  const r = rng(seed);
  const pal = PALETTES[tone];
  const uid = `fc-${seed.replace(/[^a-z0-9]/gi, "")}`;
  const angle = 110 + Math.round(r() * 60);

  // Centre du halo lumineux + du faisceau d'arcs.
  const cx = 90 + Math.round(r() * 240);
  const cy = 40 + Math.round(r() * 120);
  const arcCount = 4 + Math.floor(r() * 3);
  const baseRadius = 60 + Math.round(r() * 40);
  const gap = 26 + Math.round(r() * 16);
  const accent = tone === "warm" || tone === "soon";
  const accentArc = 1 + Math.floor(r() * (arcCount - 1));

  return (
    <svg
      viewBox="0 0 400 260"
      role="img"
      aria-hidden="true"
      preserveAspectRatio="xMidYMid slice"
      className={[rounded ? "rounded-[14px]" : "", className].join(" ")}
      style={{ display: "block" }}
    >
      <defs>
        <linearGradient id={`${uid}-bg`} gradientTransform={`rotate(${angle} 0.5 0.5)`}>
          <stop offset="0%" stopColor={pal.from} />
          <stop offset="60%" stopColor={pal.to} />
          <stop offset="100%" stopColor="var(--color-ink)" />
        </linearGradient>
        <radialGradient id={`${uid}-glow`} cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor={pal.glow} stopOpacity="0.55" />
          <stop offset="100%" stopColor={pal.glow} stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="400" height="260" fill={`url(#${uid}-bg)`} />
      <ellipse cx={cx} cy={cy} rx="220" ry="180" fill={`url(#${uid}-glow)`} />

      {/* Arcs concentriques — traits fins évoquant les voûtes du handoff. */}
      {Array.from({ length: arcCount }).map((_, i) => {
        const rad = baseRadius + i * gap;
        const isAccent = accent && i === accentArc;
        return (
          <circle
            key={i}
            cx={cx}
            cy={cy + 170}
            r={rad}
            fill="none"
            stroke={isAccent ? "var(--color-coral)" : "var(--color-white)"}
            strokeWidth={isAccent ? 1.6 : 1}
            strokeOpacity={isAccent ? 0.7 : 0.12 - i * 0.012}
          />
        );
      })}

      {/* Voile inférieur pour asseoir le titre par-dessus si besoin. */}
      <rect
        y="150"
        width="400"
        height="110"
        fill="var(--color-ink)"
        fillOpacity="0.28"
      />
    </svg>
  );
}
