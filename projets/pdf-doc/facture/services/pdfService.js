const { PDFDocument, StandardFonts, rgb } = require("pdf-lib");
const fs = require("fs");
const path = require("path");

const {drawTable} = require("./table");
const {createInvoiceInfoBlock} = require('./infoClient');
const {drawMultilineText} = require('./texte');
const {addSectionOnNewPage} = require('./conditions');

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
                                                                                                            x: width - scaledWidth - 400,                 // marge droite
                                                                                                            y: pageHeight - scaledHeight - 30,          // marge haut
                                                                                                            width: scaledWidth,
                                                                                                            height: scaledHeight
                                                                                                        });
                                                                            }
                                    
                                    // 2️⃣ Titre principal 

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

/*------------------------------------------------------------------
// Footer
/*
* - (0,0) = bas gauche
 * - Y : augmente vers le haut
 * - Donc le bas de la page est proche de Y = 0
 *            - page   → pour dessiner
 *            - width  → pour centrer ou aligner
 *            - height → pour cohérence (même si on travaille en bas)
 *            - font   → pour le texte
 *------------------------------------------------------------------*/
async function createFooter(
                              page, 
                              data, 
                              width, 
                              height, 
                              font, 
                              pageNumber = null, 
                              totalPages = null
                              
                            ) {
                                const fontSize = 9;
                                const margin = 50;
                                const yPosition = 40;

                                // Ligne de séparation
                                page.drawLine({ 
                                                 start: { x: margin, y: yPosition + 10 }, 
                                                 end: { x: width - margin, y: yPosition + 10 }, 
                                                 thickness: 1 
                                             });

                                // Numéro de page si fourni
                                if (pageNumber !== null && totalPages !== null) {
                                    const pageText = `Page ${pageNumber} / ${totalPages}`;
                                
                                

                                // Texte centrée
                                const footerText = ` ${data.entreprise.adresse} - ${data.entreprise.cp} ${data.entreprise.ville} - ${data.entreprise.tel} - ${data.entreprise.mail} - ${data.siret} - ${pageText}`;

                                drawMultilineText({
                                                    page,
                                                    text: footerText,
                                                    x: margin,
                                                    y: yPosition - 5,
                                                    width: width - margin * 2,
                                                    font,
                                                    fontSize,
                                                    lineHeight: 11,
                                                    align: "center"
                                                });
                }

    
                            }


/******************************************************************
 * FONCTION : générer un PDF simple pour une facture
 * @param {object} facture    - objet facture
 * @returns {Promise<string>} - chemin du PDF généré
 * Explication des étapes :
 * - PDFDocument.create() → crée un PDF vide
 * - addPage()            → ajoute une page pour écrire dessus
 * - getSize()            → récupère largeur/hauteur pour positionner le texte
 * - embedFont()          → on utilise une police standard (Helvetica)
 * - drawText()           → écrit du texte sur la page
 * - pdfDoc.save()        → génère le PDF en mémoire
 * - fs.writeFileSync()   → sauvegarde sur disque
 * - return pdfPath       → permet ensuite de télécharger ou afficher le PDF
 ******************************************************************/
async function creerPdfSimple(facture) {
                                        try{
                                            // 1️⃣ Créer un nouveau document PDF
                                            const pdfDoc = await PDFDocument.create();

                                            // 2️⃣ Ajouter une page
                                            let page = pdfDoc.addPage();

                                            // 3️⃣ Définir la taille de la page (A4)
                                            let { width, height } = page.getSize();

                                            // 4️⃣ Charger une police standard
                                            const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
                                            // 👇 Police en gras
                                            const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

                                            
                                            // 5️⃣ Ajouter du texte
                                            
                                            // 5️⃣-1️⃣ HEADER + infos facture
                                            const logoPath = path.join(__dirname, "..", "public", "images", "logo.png");
                                            const yAfterHeader = await createHeader(pdfDoc, page, facture, font, width, logoPath);

                                             //5️⃣-2️⃣invoiceInfoBloc
                                            const yAfterInvoiceBlock = await createInvoiceInfoBlock(page, facture, yAfterHeader, font, boldFont);

                                            // 5️⃣-3️⃣ TABLEAU
                                           const { page: currentPage, y: yAfterTable } = await drawTable(pdfDoc, page, width, yAfterInvoiceBlock, facture, font, createFooter);

                                            //5️⃣-4️⃣ Sections dynamiques
                                            addSectionOnNewPage(
                                                                    pdfDoc,
                                                                    "Conditions générales",
                                                                    facture?.infos?.conditions,
                                                                    font,
                                                                    boldFont
                                                                );

                                            addSectionOnNewPage(
                                                                    pdfDoc,
                                                                    "Mentions légales",
                                                                    facture?.infos?.mentionsLegales,
                                                                    font,
                                                                    boldFont
                                                                );

                                            // FOOTER final + numérotation
                                            const pages = pdfDoc.getPages();
                                            for (let i = 0; i < pages.length; i++) {
                                                                                        await createFooter(pages[i], facture, width, height, font, i + 1, pages.length);
                                                                                    }
                                            // 6️⃣ Générer le PDF en bytes
                                            return await pdfDoc.save();
                                            // 7️⃣ Définir le chemin de sauvegarde
                                                    const pdfPath = path.join(__dirname, "..", "data", `${facture.numero}.pdf`);

                                            // 8️⃣ Écrire le PDF sur le disque
                                            fs.writeFileSync(pdfPath, pdfBytes);

                                            // 9️⃣ Retourner le chemin du PDF pour 
                                            //return pdfPath;

                                            // 9️⃣ 🔥 RETOURNER LES BYTES (PAS LE CHEMIN) pour afficher le pdf dans le navigateur
                                            return pdfBytes;

                                        } catch (error) {
                                                        console.error("❌ Erreur création PDF :", error);
                                                        throw error;
                                                    }

                                        }


module.exports = { createHeader, createFooter, creerPdfSimple };
