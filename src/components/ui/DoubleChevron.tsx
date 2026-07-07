/**
 * ui — chevron double : icône signature des CTA (handoff §Iconographie).
 * `currentColor` uniquement, jamais de hex.
 */
export function DoubleChevron({ className }: { className?: string }) {
  return (
    <svg
      width="22"
      height="12"
      viewBox="0 0 22 12"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M2 1l5 5-5 5M10 1l5 5-5 5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
