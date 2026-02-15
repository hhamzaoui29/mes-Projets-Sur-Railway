const { PDFDocument, StandardFonts, rgb } = require("pdf-lib");
const fs = require("fs");
const path = require("path");


const {drawMultilineText} = require('./texte');


/*
 * ======================================================
 * 📌 Ajoute une section sur une nouvelle page
 * - Ne crée la page QUE si le contenu existe
 * - Gère automatiquement le titre
 * - Gère le wrap du texte

 * @param {PDFDocument} pdfDoc
 * @param {String} title
 * @param {String} content
 * @param {PDFFont} font
 * @param {PDFFont} boldFont
 */
function addSectionOnNewPage(pdfDoc, title, content, font, boldFont) {

    // ===============================
    // 1️⃣ Vérification contenu
    // ===============================
    if (!content || content.trim() === "") {
                                                return; // ❌ rien à afficher
                                            }

    // ===============================
    // 2️⃣ Création nouvelle page
    // ===============================
    const page = pdfDoc.addPage();
    const { width, height } = page.getSize();

    const marginLeft = 50;
    const marginTop = height - 80;
    const contentWidth = width - 100;

    // ===============================
    // 3️⃣ Affichage du titre
    // ===============================
    page.drawText(title, {
                            x: marginLeft,
                            y: marginTop,
                            size: 14,
                            font: boldFont
                         });

    page.drawLine({
                        start: { x: marginLeft, y: marginTop - 10 },
                        end: { x: width - marginLeft, y: marginTop - 10 },
                        thickness: 1
                  });

    // ===============================
    // 4️⃣ Affichage du contenu (wrap auto)
    // ===============================
    drawMultilineText({
                        page,
                        text: content,
                        x: marginLeft,
                        y: marginTop - 30,
                        width: contentWidth,
                        font,
                        fontSize: 10,
                        lineHeight: 14,
                        align: "left"
                      });
}

module.exports = {
                    addSectionOnNewPage
                }