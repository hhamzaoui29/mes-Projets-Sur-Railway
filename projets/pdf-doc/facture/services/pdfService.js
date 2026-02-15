const { PDFDocument, StandardFonts, rgb } = require("pdf-lib");
const fs = require("fs");
const path = require("path");

const {drawTable} = require("./table");
const {createInvoiceInfoBlock} = require('./infoClient');
const {addSectionOnNewPage} = require('./sections');
const {createHeader} = require('./header');
const {createFooter} = require('./footer');






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
                                             // ===============================
                                             // 1️⃣ Création d’un nouveau document PDF
                                             // ===============================
                                                const pdfDoc = await PDFDocument.create();

                                            // ===============================
                                            // 2️⃣ Ajouter première page
                                            // ===============================
                                               let page = pdfDoc.addPage();
                                               let { width, height } = page.getSize();

                                            // ===============================
                                            // 3️⃣ Polices
                                            // ===============================
                                                const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
                                                // 👇 Police en gras
                                                const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

                                            
                                            // ===============================
                                            // 4️⃣ Header et infos entreprise (uniquement page 1)
                                            // ===============================
                                                const logoPath = path.join(__dirname, "..", "public", "images", "logo.png");
                                                const yAfterHeader = await createHeader(pdfDoc, page, facture, font, width, logoPath);
                                            // ===============================
                                            // 5️⃣invoiceInfoBloc
                                            // ===============================
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
