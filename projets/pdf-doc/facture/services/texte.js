const { PDFDocument, StandardFonts, rgb } = require("pdf-lib");
const fs = require("fs");
const path = require("path");





/**
 * Convertit des valeurs RGB classiques (0-255) en format pdf-lib (0-1)
 * @param {number} r - Rouge 0-255
 * @param {number} g - Vert 0-255
 * @param {number} b - Bleu 0-255
 * @returns Couleur au format pdf-lib
 */
function rgb255(r, g, b) {
                           return rgb(r / 255, g / 255, b / 255);
                         }


/**
 * Découpe un texte pour qu'il tienne dans une largeur maximale
 * @param {string} text - texte à afficher
 * @param {object} font - police PDF-lib
 * @param {number} fontSize - taille du texte
 * @param {number} maxWidth - largeur max de la cellule
 * @returns {Array} lignes de texte
 *  __________________________________________________________________
 * | Étape             | Explication                                  |
 * | ----------------- | -------------------------------------------- |
 * | split(" ")        | on coupe le texte en mots                    |
 * | widthOfTextAtSize | on mesure la largeur réelle du texte         |
 * | dépassement       | on force un retour à la ligne                |
 * | résultat          | un tableau de lignes prêtes à être dessinées |
 * |___________________|______________________________________________|

 */

function wrapText(text, font, fontSize, maxWidth) {

                    const words = text.split(" "); // découpe mot par mot
                    const lines = [];
                    let currentLine = "";

                    for (let word of words) {
                                                const testLine = currentLine + word + " ";
                                                const textWidth = font.widthOfTextAtSize(testLine, fontSize);

                                                // si la ligne dépasse la largeur max
                                                if (textWidth > maxWidth) {
                                                                                lines.push(currentLine); // on valide la ligne
                                                                                currentLine = word + " "; // nouvelle ligne
                                                                            } else {
                                                                                    currentLine = testLine;
                                                                                }
                                            }

                    // Dernière ligne
                    if (currentLine) {
                                      lines.push(currentLine.trim());
                                    }
                    return lines;
                }

/**
 * - Dessine un texte dans une cellule sans débordement
 * - wrapText empêche le dépassement horizontal
 * - currentY -= lineHeight empêche le chevauchement vertical
 * - with -10 = marge interne
 */
function drawTextInCell(page, text, x, y, width, font, fontSize, lineHeight) {

                        const lines = wrapText(text, font, fontSize, width - 10);  

                        let currentY = y;

                        for (let line of lines) {
                                                    page.drawText(line, {
                                                                            x: x + 5,       // marge gauche
                                                                            y: currentY,
                                                                            size: fontSize,
                                                                            font: font,
                                                                            color: rgb(0, 0, 0)
                                                                        });

                                                    currentY -= lineHeight; // descendre pour la ligne suivante
                                                }
                    }

/***************************************************************************************************
 * ______________________________________________________________________________________________
* | Paramètre    | Description                                                                   |
* | ------------ | ----------------------------------------------------------------------------- |
* | `page`       | La page PDF sur laquelle tu vas écrire le texte (objet pdf-lib)               |
* | `text`       | Le texte à écrire (ex: "Désignation")                                         |
* | `xCol`       | La position X de **la colonne**, c’est-à-dire le coin gauche de la cellule    |
* | `largeurCol` | La largeur de la cellule dans laquelle on veut centrer le texte               |
* | `y`          | La position Y pour le texte (attention : pdf-lib commence à 0 en bas de page) |
* | `font`       | L’objet police (ex: `standardFont`)                                           |
* | `size`       | La taille de la police pour ce texte                                          |
* |______________|_______________________________________________________________________________|

 ***************************************************************************************************/
function drawCenteredText(page, text, xCol, largeurCol, y, font, size) {

    const textWidth = font.widthOfTextAtSize(text, size);
    const textX = xCol + (largeurCol - textWidth) / 2;

    page.drawText(text, {
                            x: textX,
                            y: y,
                            size: size,
                            font: font
                        });
}


async function drawTextWithPagination(pdfDoc, page, lines, font, fontSize, margin) {
  let y = page.getHeight() - margin;
  const lineHeight = fontSize + 2; // espace entre les lignes

  for (let i = 0; i < lines.length; i++) {
    // si on arrive trop bas → nouvelle page
    if (y < margin + lineHeight) {
      page = pdfDoc.addPage();       // nouvelle page
      y = page.getHeight() - margin; // reset y
    }

    page.drawText(lines[i], {
      x: margin,
      y: y,
      size: fontSize,
      font,
    });

    y -= lineHeight;
  }

  return { page, y };
}





module.exports = {
                    rgb255,
                    wrapText,
                    drawTextInCell,
                    drawCenteredText,
                    drawTextWithPagination
                 };
