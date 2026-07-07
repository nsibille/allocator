/**
 * layout — monogramme + wordmark Private Corner.
 * ⚠️ Le monogramme est un PLACEHOLDER (handoff §Iconographie / §Assets) :
 * remplacer par le logo officiel en production.
 */
export function Brand({ className = "" }: { className?: string }) {
  return (
    <span className={["inline-flex items-center gap-3", className].join(" ")}>
      <svg
        viewBox="0 0 40 28"
        width="34"
        height="24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        aria-hidden="true"
      >
        <path d="M4 7 C4 3 22 3 22 14 C22 25 4 25 4 21" />
        <path d="M16 7 C16 3 34 3 34 14 C34 25 16 25 16 21" />
      </svg>
      <span className="flex flex-col leading-[1.05]">
        <span className="text-[11px] font-medium uppercase tracking-[0.32em]">
          Private
        </span>
        <span className="text-[11px] font-medium uppercase tracking-[0.32em]">
          Corner
        </span>
      </span>
    </span>
  );
}
