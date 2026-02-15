const { PDFDocument, StandardFonts, rgb } = require("pdf-lib");
const fs = require("fs");
const path = require("path");

const {drawCenteredText, rgb255, wrapText, drawTextInCell } = require('./texte');
const {formatEuro, calculerTotaux, calculerTotalGeneral } = require('./fonctionUtils');

/*------------------------------------------------------------------*/
// Dessine l'entête du tableau
function drawTableHeader( 
                           page, 
                           x, 
                           y, 
                           largeur, 
                           hauteur, 
                           titres, 
                           font
                           
                        ) {
                            // Colonnes : Désignation, Quantité, Prix, Total
                            const colA = largeur * 0.50;
                            const colB = largeur * 0.10;
                            const colC = largeur * 0.15;
                            const colD = largeur * 0.25;

                            const xColA = x;
                            const xColB = x + colA;
                            const xColC = x + colA + colB;
                            const xColD = x + colA + colB + colC;
                            const xFin  = x + largeur;

                            // Fond coloré de l'entête
                            page.drawRectangle({
                                x, y: y - hauteur,
                                width: largeur, height: hauteur,
                                color: rgb(0.85, 0.92, 0.97)
                            });

                            // Lignes horizontales
                            page.drawLine({ start: { x, y }, end: { x: x + largeur, y }, thickness: 2 });
                            page.drawLine({ start: { x, y: y - hauteur }, end: { x: x + largeur, y: y - hauteur }, thickness: 2 });

                            // Lignes verticales
                            [xColA, xColB, xColC, xColD, xFin].forEach(xPos => {
                                page.drawLine({ start: { x: xPos, y }, end: { x: xPos, y: y - hauteur }, thickness: 2 });
                            });

                            // Texte centré dans chaque colonne
                            const fontSize = 12;
                            const textY = y - (hauteur / 2) - (font.heightAtSize(fontSize) / 2);

                            drawCenteredText(page, titres[0], xColA, colA, textY, font, fontSize);
                            drawCenteredText(page, titres[1], xColB, colB, textY, font, fontSize);
                            drawCenteredText(page, titres[2], xColC, colC, textY, font, fontSize);
                            drawCenteredText(page, titres[3], xColD, colD, textY, font, fontSize);

                            return y - hauteur; // position Y à utiliser pour le corps du tableau
                          }

/*------------------------------------------------------------------*/
// Dessine le corps du tableau avec gestion du wrap et pagination
async function drawTableBody( 
                              pdfDoc, 
                              page, 
                              x, 
                              y, 
                              largeur, 
                              hauteurLigneMin, 
                              lignes, 
                              font, 
                              width, 
                              height, 
                              createFooter, 
                              facture
                              
                            ) {
                                let currentPage = page;
                                let currentY = y;
                                const fontSize = 12;
                                const lineHeight = 14;
                                const padding = 5;
                                const bottomMargin = 80;

                                // Colonnes
                                const colA = largeur * 0.50;
                                const colB = largeur * 0.10;
                                const colC = largeur * 0.15;
                                const colD = largeur * 0.25;

                                const xColA = x;
                                const xColB = x + colA;
                                const xColC = x + colA + colB;
                                const xColD = x + colA + colB + colC;
                                const xFin  = x + largeur;

                                // Parcours des lignes
                                for (const ligne of lignes) {
                                    const designationLines = wrapText(ligne.designation.toString(), font, fontSize, colA - padding * 2);
                                    const hauteurLigne = Math.max(hauteurLigneMin, designationLines.length * lineHeight + padding);

                                    // 🔹 Saut de page si on dépasse la marge
                                    if (currentY - hauteurLigne < bottomMargin) {
                                        await createFooter(currentPage, facture, width, height, font); // footer page avant nouvelle page
                                        currentPage = pdfDoc.addPage();
                                        const newSize = currentPage.getSize();
                                        width = newSize.width;
                                        height = newSize.height;
                                        currentY = height - 50;

                                        // Redessiner header du tableau sur la nouvelle page
                                        const titres = ["Désignation", "Quantité", "Prix", "Total"];
                                        currentY = drawTableHeader(currentPage, x, currentY, largeur, hauteurLigneMin, titres, font);
                                    }

                                    // Bordures ligne
                                    currentPage.drawLine({ start: { x, y: currentY }, end: { x: xFin, y: currentY }, thickness: 1 }); // haut
                                    currentPage.drawLine({ start: { x, y: currentY - hauteurLigne }, end: { x: xFin, y: currentY - hauteurLigne }, thickness: 1 }); // bas
                                    [xColA, xColB, xColC, xColD, xFin].forEach(xPos => {
                                        currentPage.drawLine({ start: { x: xPos, y: currentY }, end: { x: xPos, y: currentY - hauteurLigne }, thickness: 1 });
                                    });

                                    // Texte
                                    const textBlockHeight = designationLines.length * lineHeight;
                                    const textStartY = currentY - (hauteurLigne - textBlockHeight) / 2 - fontSize;

                                    drawTextInCell(currentPage, ligne.designation.toString(), xColA, textStartY, colA, font, fontSize, lineHeight);
                                    drawCenteredText(currentPage, ligne.quantite.toString(), xColB, colB, textStartY, font, fontSize);

                                    const prixText = formatEuro(ligne.prix);
                                    const totalText = formatEuro(ligne.prix * ligne.quantite);

                                    currentPage.drawText(prixText, { x: xColC + colC - font.widthOfTextAtSize(prixText, fontSize) - padding, y: textStartY, size: fontSize, font });
                                    currentPage.drawText(totalText, { x: xColD + colD - font.widthOfTextAtSize(totalText, fontSize) - padding, y: textStartY, size: fontSize, font });

                                    currentY -= hauteurLigne;
                                }

                                return { page: currentPage, y: currentY };
                              }

/*------------------------------------------------------------------*/
// Dessine le pied de tableau (totaux)
function drawTableFooter( 
                          page, 
                          x,
                           y, 
                          largeur, 
                          hauteurLigne, 
                          totaux, 
                          font
                          
                        ) {
                            const fontSize = 12;
                            const padding = 5;
                            const hauteurTotale = hauteurLigne * 3;

                            const largeurGauche = largeur * 0.75;
                            const xSeparation = x + largeurGauche;

                            // Lignes horizontales
                            for (let i = 0; i <= 3; i++) {
                                page.drawLine({ 
                                                  start: { x, y: y - i * hauteurLigne }, 
                                                  end: { x: x + largeur, y: y - i * hauteurLigne }, 
                                                  thickness: 1 
                                              });
                            }

                            // Lignes verticales
                            [x, xSeparation, x + largeur].forEach(xPos => {
                                page.drawLine({ 
                                                start: { x: xPos, y }, 
                                                end: { x: xPos, y: y - hauteurTotale }, 
                                                thickness: 1 
                                             });
                            });

                            const labels = ["Total HT", `TVA (${(totaux.tva / totaux.ht * 100).toFixed(0)} %)`, "Total TTC"];
                            const valeurs = [totaux.ht, totaux.tva, totaux.ttc];

                            labels.forEach((label, i) => {
                                                            const yTexte = y - hauteurLigne * (i + 1) + 8;

                                                            page.drawText(label, { x: x + 10, y: yTexte, size: fontSize, font });
                                                            const texteValeur = formatEuro(valeurs[i]);
                                                            const largeurTexte = font.widthOfTextAtSize(texteValeur, fontSize);
                                                            page.drawText(texteValeur, { x: x + largeur - largeurTexte - padding, y: yTexte, size: fontSize, font });
                                                         });

                            return y - hauteurTotale; // Y après pied de tableau
                          }

/*------------------------------------------------------------------*/
// Fonction principale pour dessiner le tableau (header + body + footer)
async function drawTable( 
                          pdfDoc, 
                          page, 
                          width, 
                          height, 
                          facture, 
                          font, 
                          createFooter
                        ) {
                                const titres = ["Désignation", "Quantité", "Prix", "Total"];
                                const xTable = 50;
                                const yTable = height - 150; // sous header + infos facture
                                const largeurTable = width - 100;
                                const hauteurLigne = 25;

                                // Header tableau
                                let yAfterHeader = drawTableHeader(page, xTable, yTable, largeurTable, hauteurLigne, titres, font);

                                // Corps tableau
                                const result = await drawTableBody(pdfDoc, page, xTable, yAfterHeader, largeurTable, hauteurLigne, facture.lignes, font, width, height, createFooter, facture);

                                // Footer du tableau (total)
                                const totalGeneral = calculerTotalGeneral(facture.lignes);
                                const totaux = calculerTotaux(totalGeneral, facture.tva || 0);

                                await drawTableFooter(result.page, xTable + 250, result.y - 15, largeurTable / 2, hauteurLigne, totaux, font);

                                return { 
                                            page: result.page,//
                                            y: result.y 
                                        };
                            }


module.exports = { drawTableHeader, drawTableBody, drawTableFooter, drawTable };
