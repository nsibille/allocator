import { Hanken_Grotesk, Newsreader } from "next/font/google";

/**
 * Fallbacks web (Google Fonts) des polices sous licence.
 * Neue Montreal → Hanken Grotesk · Saol Display → Newsreader (italique).
 * Si les licences sont fournies, ajouter les @font-face en tête de stack dans globals.css
 * (les variables ci-dessous restent en second dans --font-sans / --font-accent).
 */
export const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-hanken",
  display: "swap",
});

export const newsreader = Newsreader({
  subsets: ["latin"],
  style: ["italic", "normal"],
  weight: ["400", "500"],
  variable: "--font-newsreader",
  display: "swap",
});
