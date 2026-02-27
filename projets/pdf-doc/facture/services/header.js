
// header.js

/**
 * ======================================================
 * Gère tout ce qui concerne l'entête du document
 * ======================================================
 */

const { StandardFonts, rgb } = require("pdf-lib");
const fs = require("fs");


/*------------------------------------------------------------------
*🔎 Comprendre les coordonnées PDF
* - Dans pdf-lib :
*                  - (0,0) est en bas à gauche
*                  - X augmente vers la droite
*                  - Y augmente vers le haut
*------------------------------------------------------------------*/
/**===================================================================
 * | Paramètre  | Rôle                                               |
* | ---------- | --------------------------------------------------- |
* | `pdfDoc`   | Le document PDF principal (instance de PDFDocument) |
* | `page`     | La page sur laquelle on dessine                     |
* | `data`     | Les données de la facture (numero, client, etc.)    |
* | `font`     | La police déjà chargée                              |
* | `height`   | Hauteur totale de la page                           |
* | `width`    | Largeur totale de la page                           |
* | `logoPath` | Chemin vers le fichier image du logo                |
* |____________|_____________________________________________________|
* 
*====================================================================*/
async function createHeader( 
                             pdfDoc, 
                             page, 
                             data, 
                             font, 
                             width, 
                             logoPath
                             
                           ) {
                                    let xInitial = 50;      // marge gauche initiale
                                    let yInitial = 50;        // marge du haut initiale (on va descendre en ajoutant)

                                    // Hauteur de la page
                                    const pageHeight = page.getHeight();  

                                    // 1️⃣ Logo en haut à droite si fourni
                                    if (logoPath && fs.existsSync(logoPath)) {
                                                                                const logoBytes = fs.readFileSync(logoPath);
                                                                                const logoImage = await pdfDoc.embedPng(logoBytes); // utiliser embedJpg si JPG

                                                                                const maxWidth = 150; 
                                                                                const scale = maxWidth / logoImage.width;
                                                                                const scaledWidth = logoImage.width * scale;
                                                                                const scaledHeight = logoImage.height * scale;

                                                                                page.drawImage(logoImage, {
                                                                                                            x: width - scaledWidth - 400,        // marge droite
                                                                                                            y: pageHeight - scaledHeight - 30,   // marge haut
                                                                                                            width: scaledWidth,
                                                                                                            height: scaledHeight
                                                                                                          });
                                                                            }
                                    

                                    // 4️⃣ Infos entreprise
                                    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
                                    yInitial += 40;
                                    page.drawText(` ${data.entreprise.nom}`, {
                                                                                x: xInitial + 260,
                                                                                y: pageHeight - yInitial,
                                                                                size: 25,
                                                                                font: boldFont,
                                                                                color: rgb(0.26, 0.26, 0.26)
                                                                             });
                                    
                                    yInitial += 20;  
                                    page.drawText(`${data.entreprise.adresse}`, {
                                                                                    x: xInitial + 340,
                                                                                    y: pageHeight - yInitial,
                                                                                    size: 15,
                                                                                    font: font,
                                                                                    color: rgb(0.26, 0.26, 0.26)
                                                                                });
                                    
                                    yInitial +=20;
                                    page.drawText(` ${data.entreprise.cp} ${data.entreprise.ville}`,{
                                                                                                        x: xInitial + 340,
                                                                                                        y: pageHeight - yInitial,
                                                                                                        size: 15,
                                                                                                        font: font,
                                                                                                        color: rgb(0.26, 0.26, 0.26)
                                                                                                    });

                                    yInitial += 100;
                                    page.drawText(`Tél : ${data.entreprise.tel}`,{
                                                                                    x: xInitial + 80,
                                                                                    y: pageHeight - yInitial,
                                                                                    size: 15,
                                                                                    font: font,
                                                                                    color: rgb(0.26, 0.26, 0.26)
                                                                                });

                                    page.drawText(`E-mail : ${data.entreprise.mail}`,{
                                                                                        x: xInitial + 240,
                                                                                        y: pageHeight - yInitial,
                                                                                        size: 15,
                                                                                        font: font,
                                                                                        color: rgb(0.26, 0.26, 0.26)
                                                                                    });

                                    


                                    // 5️⃣ Ligne de séparation         
                                    yInitial += 20;

                                    page.drawLine({
                                                        start: { x: xInitial, y: pageHeight - yInitial },
                                                        end: { x: width - xInitial, y: pageHeight - yInitial },
                                                        thickness: 1,
                                                        color: rgb(0.7, 0.7, 0.7)
                                                    });
                                    
                                    const yFinal = pageHeight - yInitial;
                                    return yFinal;
                                    // ✅ Avec ce système, tu modifies seulement xInitial ou yInitial au début
                                    // et tu gères facilement le positionnement vertical en ajoutant des valeurs.
                                }
module.exports = {
                    createHeader
                 }