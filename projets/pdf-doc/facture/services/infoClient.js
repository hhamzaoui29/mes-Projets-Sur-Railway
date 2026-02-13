// invoiceBlock.js

const { rgb } = require("pdf-lib");
const { wrapText } = require("./texte"); // ta fonction existante

async function createInvoiceInfoBlock(page, data,y, font, boldFont) {

  /* ======================================================
     1️⃣ CONFIGURATION GÉNÉRALE
  ====================================================== */

  const margin = 50;                     // marge gauche/droite
  const pageWidth = page.getWidth();     // largeur totale page
  const contentWidth = pageWidth - margin * 2;

  const leftWidth = contentWidth * 0.6;  // 60% gauche
  const rightWidth = contentWidth * 0.4; // 40% droite

  const padding = 10;                    // espace intérieur cellule
  const lineHeight = 14;                 // hauteur d’une ligne
  const fontSize = 10;


  // Position de départ (à adapter selon ton header)
  let yStart = y;
   
    
    

  /* ======================================================
     2️⃣ PRÉPARATION DU TEXTE (WRAP DYNAMIQUE)
     On prépare le texte AVANT de dessiner
  ====================================================== */


  const wrappedLivraison = wrapText(
    `Adresse de facturation : ${data.client.adresse || "Non renseignée"} ${data.client.cp || ""} ${data.client.ville || ""}`,
    font,
    fontSize,
    leftWidth - padding * 2
  );

  const wrappedObjet = wrapText(
    `Objet : ${data.objet || ""}`,
    font,
    fontSize,
    leftWidth - padding * 2
  );

  const wrappedReglement = wrapText(
    data.infos.reglement,
    font,
    9,
    contentWidth - padding * 2
  );


  /* ======================================================
     3️⃣ CALCUL DYNAMIQUE DES HAUTEURS
  ====================================================== */

  const leftBlockLines =
    2 + // FACTURE + REF
    wrappedLivraison.length +
    wrappedObjet.length;

  const rightBlockLines = 3; // nom + adresse + cp ville

  const mainBlockLines = Math.max(leftBlockLines, rightBlockLines);

  const mainBlockHeight = mainBlockLines * lineHeight + padding * 2;
  const infosBlockHeight =
    wrappedReglement.length * lineHeight + padding * 2;


  /* ======================================================
     4️⃣ DESSIN DES CADRES
  ====================================================== */

  // Bloc gauche
page.drawRectangle({
                    x: margin,
                    y: yStart - mainBlockHeight,
                    width: leftWidth,
                    height: mainBlockHeight,
                    borderWidth: 1,
                    borderColor: rgb(0, 0, 0),
                    color: undefined,   // 👈 pas de remplissage
                    });

// Bloc droite
page.drawRectangle({
                    x: margin + leftWidth,
                    y: yStart - mainBlockHeight,
                    width: rightWidth,
                    height: mainBlockHeight,
                    borderWidth: 1,
                    borderColor: rgb(0, 0, 0),
                    color: undefined,
                    });

// Bloc infos pleine largeur
page.drawRectangle({
                    x: margin,
                    y: yStart - mainBlockHeight - infosBlockHeight,
                    width: contentWidth,
                    height: infosBlockHeight,
                    borderWidth: 1,
                    borderColor: rgb(0, 0, 0),
                    color: undefined,
                    });


  /* ======================================================
     5️⃣ ÉCRITURE COLONNE GAUCHE
  ====================================================== */

  let yLeft = yStart - padding - lineHeight;
   const today = new Date();
    const dateStr = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`;

  // Titre
  page.drawText(`FACTURE du  ${dateStr}`, {
    x: margin + padding,
    y: yLeft,
    size: 14,
    font: boldFont,
  });

  yLeft -= lineHeight;

  // Référence
  page.drawText(`REF : ${data.numero}`, {
    x: margin + padding,
    y: yLeft,
    size: fontSize,
    font,
  });

  yLeft -= lineHeight;

  // Adresse livraison
  wrappedLivraison.forEach(line => {
    page.drawText(line, {
                    x: margin + padding,
                    y: yLeft,
                    size: fontSize,
                    font,
                    });
    yLeft -= lineHeight;
  });

  // Objet
  wrappedObjet.forEach(line => {
    page.drawText(line, {
      x: margin + padding,
      y: yLeft,
      size: fontSize,
      font,
    });
    yLeft -= lineHeight;
  });


  /* ======================================================
     6️⃣ ÉCRITURE COLONNE DROITE
  ====================================================== */

  let yRight = yStart - padding - lineHeight;

  page.drawText(data.client.nom, {
    x: margin + leftWidth + padding,
    y: yRight,
    size: 12,
    font: boldFont,
  });

  yRight -= lineHeight;

  page.drawText(data.client.adresse, {
    x: margin + leftWidth + padding,
    y: yRight,
    size: fontSize,
    font,
  });

  yRight -= lineHeight;

  page.drawText(`${data.client.cp} ${data.client.ville}`, {
    x: margin + leftWidth + padding,
    y: yRight,
    size: fontSize,
    font,
  });


  /* ======================================================
     7️⃣ BLOC INFOS (DYNAMIQUE)
  ====================================================== */

  let yInfos =
    yStart - mainBlockHeight - padding - lineHeight;

  wrappedReglement.forEach(line => {
    page.drawText(line, {
      x: margin + padding,
      y: yInfos,
      size: 9,
      font,
    });
    yInfos -= lineHeight;
  });


  /* ======================================================
     8️⃣ RETOUR POSITION Y POUR drawTable
  ====================================================== */

  return yStart - mainBlockHeight - infosBlockHeight - 20;
}

module.exports = { createInvoiceInfoBlock };
