import { type ReactNode } from "react";

/**
 * ui-title-accent — titre Neue Montreal avec un mot-clé en Saol italic (em.pc).
 * `accentWord` est mis en emphase (1er occurrence) ; sinon rendu simple.
 */
export function TitleAccent({
  title,
  accentWord,
  as: Tag = "h1",
  className = "",
}: {
  title: string;
  accentWord?: string;
  as?: "h1" | "h2" | "h3";
  className?: string;
}) {
  let content: ReactNode = title;
  if (accentWord && title.includes(accentWord)) {
    const [before, ...rest] = title.split(accentWord);
    content = (
      <>
        {before}
        <em className="pc">{accentWord}</em>
        {rest.join(accentWord)}
      </>
    );
  }
  return <Tag className={className}>{content}</Tag>;
}
