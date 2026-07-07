"use client";

/**
 * proj-controls-pace — rythme des distributions (curseur −2…+2), poignée corail.
 */
export function PaceControl({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const label =
    value <= -2
      ? "Très étalé"
      : value === -1
        ? "Étalé"
        : value === 0
          ? "Standard"
          : value === 1
            ? "Accéléré"
            : "Très accéléré";
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[13px] text-slate">Rythme des distributions</span>
        <span className="text-[13px] text-coral">{label}</span>
      </div>
      <input
        type="range"
        min={-2}
        max={2}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-coral"
      />
      <div className="mt-1 flex justify-between text-[11px] text-muted">
        <span>Étalé</span>
        <span>Accéléré</span>
      </div>
    </div>
  );
}
