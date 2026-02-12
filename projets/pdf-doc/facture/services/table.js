const { PDFDocument, StandardFonts, rgb } = require("pdf-lib");
const fs = require("fs");
const path = require("path");

const {drawCenteredText, rgb255, wrapText, drawTextInCell } = require('./texte');
const {formatEuro, calculerTotaux, calculerTotalGeneral } = require('./fonctionUtils');

/******************************************************************
 * Le Fonctionnnement de x et y
 * 
 * x = de gauche a droite
 * y = de haut en bas 
 * 
 ******************************************************************/

/******************************************************************
 * FONCTION : dessiner l'en-tête du tableau
 * @param {PDFPage} page - page PDF
 * @param {number} x - coin supérieur gauche
 * @param {number} y - position Y de départ
 * @param {number} largeur - largeur totale du tableau
 * @param {number} hauteur - hauteur de la ligne
 * @param {string[]} titres - tableau de titres
 * @param {PDFFont} font - police
 ******************************************************************/
function drawTableHeader(page, x, y, largeur, hauteur, titres, font) {

    // ===============================
    // 1️⃣ Définition des colonnes
    // ===============================

    const colA = largeur * 0.50; // Désignation
    const colB = largeur * 0.10; // Quantité
    const colC = largeur * 0.15; // Prix
    const colD = largeur * 0.25; // Total

    // Positions X des colonnes
    const xColA = x; 
    const xColB = x + colA; 
    const xColC = x + colA + colB;
    const xColD = x + colA + colB + colC;
    const xFin  = x + largeur;

    // ===============================
    // 2️⃣ Fond coloré de l’entête
    // ===============================

    page.drawRectangle({
                            x: x,
                            y: y - hauteur,
                            width: largeur,
                            height: hauteur,
                            color: rgb(0.85, 0.92, 0.97), // bleu/gris clair
                            borderWidth: 0
                        });

    // ===============================
    // 3️⃣ Lignes horizontales
    // ===============================

    // Ligne du haut
    page.drawLine({
                        start: { x: x, y: y },
                        end: { x: x + largeur, y: y },
                        thickness: 2
                    });

    // Ligne du bas
    page.drawLine({
        start: { x: x, y: y - hauteur },
        end: { x: x + largeur, y: y - hauteur },
        thickness: 2
    });

    // ===============================
    // 4️⃣ Lignes verticales (colonnes)
    // ===============================

    [xColA, xColB, xColC, xColD, xFin].forEach(xPos => {
        page.drawLine({
            start: { x: xPos, y: y },
            end: { x: xPos, y: y - hauteur },
            thickness: 2
        });
    });

    // ===============================
    // 5️⃣ Titres centrés dans chaque cellule
    // ===============================

    const fontSize = 12;
    const textY = y - (hauteur / 2) - (font.heightAtSize(fontSize) / 2);

    // Désignation
    drawCenteredText(
        page, 
        titres[0],
        xColA,
        colA,
        textY,
        font,
        fontSize
    );

    // Quantité
    drawCenteredText(
        page,
        titres[1],
        xColB,
        colB,
        textY,
        font,
        fontSize
    );

    // Prix
    drawCenteredText(
        page,
        titres[2],
        xColC,
        colC,
        textY,
        font,
        fontSize
    );

    // Total
    drawCenteredText(
        page,
        titres[3],
        xColD,
        colD,
        textY,
        font,
        fontSize
    );
    //ON RETOURNE LA POSITION DU hEADER
    return y - hauteur;
}

/******************************************************************
 * FONCTION : dessiner le corps du tableau
 * @param {PDFPage} page - page PDF
 * @param {number} x
 * @param {number} y - position de départ (juste en dessous du header)
 * @param {number} largeur
 * @param {number} hauteurLigne
 * @param {object[]} lignes - tableau d’objets facture
 * @param {PDFFont} font
 ******************************************************************/
function drawTableBody1(page, x, y, largeur, hauteurLigne, lignes, font) {

    // ===============================
    // 1️⃣ Définition des colonnes
    // ===============================

    const colA = largeur * 0.50; // Désignation
    const colB = largeur * 0.10; // Quantité
    const colC = largeur * 0.15; // Prix
    const colD = largeur * 0.25; // Total

    // Positions X des colonnes (cumulées)
    const xColA = x;
    const xColB = x + colA;
    const xColC = x + colA + colB;
    const xColD = x + colA + colB + colC;
    const xFin  = x + largeur;

    // ===============================
    // 2️⃣ Parcours des lignes
    // ===============================

    lignes.forEach((ligne, index) => {

        // Position Y de la ligne actuelle
        const yLigne = y - index * hauteurLigne;

        // ===============================
        // 3️⃣ Lignes horizontales
        // ===============================

        // Ligne du haut
        page.drawLine({
                            start: { x: x, y: yLigne },
                            end: { x: x + largeur, y: yLigne },
                            thickness: 1
                        });

        // Ligne du bas
        page.drawLine({
                            start: { x: x, y: yLigne - hauteurLigne },
                            end: { x: x + largeur, y: yLigne - hauteurLigne },
                            thickness: 1
                        });

        // ===============================
        // 4️⃣ Lignes verticales (colonnes)
        // ===============================

        [xColA, xColB, xColC, xColD, xFin].forEach(xPos => {
                                                                page.drawLine({
                                                                    start: { x: xPos, y: yLigne },
                                                                    end: { x: xPos, y: yLigne - hauteurLigne },
                                                                    thickness: 1
                                                                });
                                                            });

        // ===============================
        // 5️⃣ Texte dans les cellules
        // ===============================

        const textY = yLigne - hauteurLigne + 6;
        const fontSize = 12;
        const padding = 5;   

        // Désignation
        page.drawText(ligne.designation.toString(), {
                                                        x: xColA + 5,
                                                        y: textY,
                                                        size: 12,
                                                        font,
                                                    });

        // Quantité CENTRÉ DANS LA CÉLLULE AVEC LA FONCTION drawCenterText()
      drawCenteredText (   
                            page,  //La page PDF sur laquelle tu vas écrire le texte (objet pdf-lib) 
                            ligne.quantite.toString(),//Le texte à écrire
                            xColB,   //La position X de **la colonne**, c’est-à-dire le coin gauche de la cellule
                            colB,    //La largeur de la cellule dans laquelle on veut centrer le texte
                            textY,   // La position Y pour le texte (attention : pdf-lib commence à 0 en bas de page)
                            font,    //L’objet police (ex: `standardFont`)
                            fontSize //La taille de la police pour ce texte
                        );


        // Prix
        const prixText = formatEuro(ligne.prix);
        const largeurTextePrix = font.widthOfTextAtSize(prixText,fontSize);

        page.drawText(prixText, {
                                    x: xColC + colC - largeurTextePrix - padding,
                                    y: textY,
                                    size: fontSize,
                                    font
                                });

        // Total
        const totalLigneTexte = formatEuro(ligne.quantite * ligne.prix);
        const largeurTexteTotal = font.widthOfTextAtSize(totalLigneTexte, fontSize);
        page.drawText(totalLigneTexte, {
                                            x: xColD + colD - largeurTexteTotal - padding,
                                            y: textY,
                                            size: 12,
                                            font
                                        });
    });

      
}
function drawTableBody(page, x, y, largeur, hauteurLigneMin, lignes, font) {

    const fontSize = 12;
    const lineHeight = 14;
    const padding = 5;

    // ===============================
    // 1️⃣ Colonnes
    // ===============================

    const colA = largeur * 0.50;
    const colB = largeur * 0.10;
    const colC = largeur * 0.15;
    const colD = largeur * 0.25;

    const xColA = x;
    const xColB = x + colA;
    const xColC = x + colA + colB;
    const xColD = x + colA + colB + colC;
    const xFin  = x + largeur;
    
    //
    let currentY = y;    

    // ===============================
    // 2️⃣ Parcours lignes
    // ===============================

    lignes.forEach(ligne => {

        // 🔹 Wrap de la désignation
        const designationLines = wrapText(
            ligne.designation.toString(),
            font,
            fontSize,
            colA - padding * 2
        );

        // 🔹 Calcul hauteur réelle de la ligne
        const hauteurLigne = Math.max(
            hauteurLigneMin,
            designationLines.length * lineHeight + padding
        );

        // ===============================
        // 3️⃣ Bordures
        // ===============================

        // haut
        page.drawLine({
            start: { x: x, y: currentY },
            end: { x: xFin, y: currentY },
            thickness: 1
        });

        // bas
        page.drawLine({
            start: { x: x, y: currentY - hauteurLigne },
            end: { x: xFin, y: currentY - hauteurLigne },
            thickness: 1
        });

        // verticales
        [xColA, xColB, xColC, xColD, xFin].forEach(xPos => {
            page.drawLine({
                start: { x: xPos, y: currentY },
                end: { x: xPos, y: currentY - hauteurLigne },
                thickness: 1
            });
        });

        // ===============================
        // 4️⃣ Texte
        // ===============================
       //Y de référence UNIQUE pour la ligne
      
         const textBlockHeight = designationLines.length * lineHeight;
         const textStartY = currentY - (hauteurLigne - textBlockHeight) / 2 - fontSize;


        // Désignation (wrap)
        drawTextInCell(
            page,
            ligne.designation.toString(),
            xColA,
            textStartY,
            colA,
            font,
            fontSize,
            lineHeight
        );

         // Quantité CENTRÉ DANS LA CÉLLULE AVEC LA FONCTION drawCenterText()
      drawCenteredText (   
                            page,  //La page PDF sur laquelle tu vas écrire le texte (objet pdf-lib) 
                            ligne.quantite.toString(),//Le texte à écrire
                            xColB,   //La position X de **la colonne**, c’est-à-dire le coin gauche de la cellule
                            colB,    //La largeur de la cellule dans laquelle on veut centrer le texte
                            textStartY,   // La position Y pour le texte (attention : pdf-lib commence à 0 en bas de page)
                            font,    //L’objet police (ex: `standardFont`)
                            fontSize //La taille de la police pour ce texte
                        );

        // Prix
        const prixText = formatEuro(ligne.prix);
        const prixWidth = font.widthOfTextAtSize(prixText, fontSize);
        page.drawText(prixText, {
            x: xColC + colC - prixWidth - padding,
            y: textStartY,
            size: fontSize,
            font
        });

        // Total
        const totalText = formatEuro(ligne.quantite * ligne.prix);
        const totalWidth = font.widthOfTextAtSize(totalText, fontSize);
        page.drawText(totalText, {
            x: xColD + colD - totalWidth - padding,
            y: textStartY,
            size: fontSize,
            font
        });

        // ===============================
        // 5️⃣ Descente Y
        // ===============================

        currentY -= hauteurLigne;
    });
    return currentY;
}

/******************************************************************
 * FONCTION : dessiner le pied du tableau (tot    //const xColonneDroite = x + largeurColonneGauche; // position X de la colonne droiteal) AVEC 2 COLONNES (Total + valeur)
 * @param {PDFPage} page
 * @param {number} x
 * @param {number} y - position de départ (juste en dessous du body)
 * @param {number} largeur
 * @param {number} hauteur
 * @param {number} total - total général
 * @param {PDFFont} font
 ******************************************************************/
function drawTableFooter(page, x, y, largeur, hauteurLigne, totaux, font) {

    const fontSize = 12;
    const padding = 5;
    const hauteurTotale = hauteurLigne * 3; // = Y

    const largeurGauche = largeur * 0.75;
    const xSeparation = x + largeurGauche;

    // 🔲 Lignes horizontales
    for (let i = 0; i <= 3; i++) {
                                    page.drawLine({
                                                    start: { x, y: y - i * hauteurLigne },
                                                    end: { x: x + largeur, y: y - i * hauteurLigne },
                                                    thickness: 1
                                                });
                                 }

    // 🔲 Lignes verticales
    [x, xSeparation, x + largeur].forEach(xPos => {
                                                    page.drawLine({
                                                                    start: { x: xPos, y },
                                                                    end: { x: xPos, y: y - hauteurTotale },
                                                                    thickness: 1
                                                                });
                                                });

    const labels = ["Total HT", `TVA (${(totaux.tva / totaux.ht * 100).toFixed(0)} %)`, "Total TTC"];
    const valeurs = [totaux.ht, totaux.tva, totaux.ttc];
    console.log("TOTAUXXXX", totaux);


    labels.forEach((label, i) => {

                                    const yTexte = y - hauteurLigne * (i + 1) + 8;

                                    // Texte gauche
                                    page.drawText(label, {
                                                            x: x + 10,
                                                            y: yTexte,
                                                            size: fontSize,
                                                            font
                                                        });

                                    // Texte droite (aligné)
                                    const texteValeur = formatEuro(valeurs[i]);
                                    const largeurTexte = font.widthOfTextAtSize(texteValeur, fontSize);

                                    page.drawText(texteValeur, {
                                                                    x: x + largeur - largeurTexte - padding,
                                                                    y: yTexte,
                                                                    size: fontSize,
                                                                    font
                                                                });
                                });
     // ⬅️ POSITION À UTILISER POUR LA SUITE
    return y - hauteurTotale;

}


/**
 * Dessine le tableau complet de la facture (header + body + footer)
 */
function drawTable(page, width, height, facture, font) {

    // 1️⃣ Titres du tableau
    const titres = ["Désignation", "Quantité", "Prix", "Total"];

    // 2️⃣ Position et dimensions du tableau
    const xTable = 50;
    const yTable = height - 150;          // sous le titre "Facture" ou Début du tableau
    const largeurTable = width - 100;     // marges gauche / droite
    const hauteurLigne = 25;
   

    // 3️⃣ Dessiner l'entête
    const yAfterHeader = drawTableHeader(
                                            page,
                                            xTable,
                                            yTable,
                                            largeurTable,
                                            hauteurLigne,
                                            titres,
                                            font
                                        );

    // 4️⃣ Dessiner le corps du tableau (lignes de facture)
    const yAfterBody = drawTableBody(
                                        page,
                                        xTable,
                                        yAfterHeader,
                                        largeurTable,
                                        hauteurLigne,
                                        facture.lignes,
                                        font
                                    );

    const tauxTVA = typeof facture.tva === "number" ? facture.tva : 0;
    const totalGeneral = calculerTotalGeneral(facture.lignes);
    const totaux = calculerTotaux(totalGeneral,tauxTVA);

    // 5️⃣ Dessiner le pied du tableau (total)
    drawTableFooter(
                        page,
                        xTable,
                        yAfterBody,
                        largeurTable,
                        hauteurLigne,
                        totaux,
                        font
                    );
}

module.exports = {
                    drawTable,
                    drawTableHeader,
                    drawTableBody,
                    drawTableFooter,
                    drawTable
                };

