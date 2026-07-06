import type { Metadata } from "next";
import { hanken, newsreader } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Private Corner — Portail d'allocation CGP",
  description:
    "Portail d'allocation multi-fonds pour Conseillers en Gestion de Patrimoine : qualification, moteur d'allocation, projections et bulletins de souscription.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={`${hanken.variable} ${newsreader.variable}`}>
      <body>{children}</body>
    </html>
  );
}
