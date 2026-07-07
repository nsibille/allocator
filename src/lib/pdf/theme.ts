/**
 * Palette PDF — miroir des tokens du handoff (design_handoff_private_corner).
 * @react-pdf/renderer ne lit pas les variables CSS : ces constantes sont l'unique
 * point où les valeurs sont reprises pour le rendu documentaire. Ne pas disperser ailleurs.
 * Polices : familles intégrées @react-pdf (Helvetica) — pas de fetch réseau ; Neue Montreal
 * en production via Font.register si les fichiers sous licence sont fournis dans public/fonts.
 */
export const PDF = {
  coral: "#FB4D58",
  coralDeep: "#E23C48",
  ink: "#131E23",
  base: "#16232A",
  teal: "#33454C",
  cream: "#ECEBE7",
  cream2: "#E3E2DD",
  slate: "#3A4D56",
  slateDeep: "#2A373D",
  white: "#F4F5F3",
  mist: "#A9B4B9",
  muted: "#6E7C82",
  line: "#D8D7D2",
  bucket: {
    defensif: "#6E7C82",
    coeur: "#33454C",
    croissance: "#FB4D58",
    satellite: "#E23C48",
  },
  font: "Helvetica",
  fontBold: "Helvetica-Bold",
} as const;

export const AMF_AGREMENT = "GP-20000038";
