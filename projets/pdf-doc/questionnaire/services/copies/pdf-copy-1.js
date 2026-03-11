const fs = require("fs");
const path = require("path");
const { PDFDocument, StandardFonts, rgb } = require("pdf-lib");

/**
 * Découpe un texte pour rentrer dans une largeur max
 */
function wrapText(text, font, fontSize, maxWidth) {
                                                        const words = text.split(' ');
                                                        const lines = [];
                                                        let currentLine = '';

                                                        for (const word of words) {
                                                            const testLine = currentLine ? currentLine + ' ' + word : word;
                                                            const testWidth = font.widthOfTextAtSize(testLine, fontSize);

                                                            if (testWidth <= maxWidth) currentLine = testLine;
                                                            else {
                                                                lines.push(currentLine);
                                                                currentLine = word;
                                                            }
                                                        }

                                                        if (currentLine) lines.push(currentLine);
                                                        return lines;
                                                    }

/**
 * Dessine du texte avec retour à la ligne
 */
function drawWrappedText({ page, text, x, y, maxWidth, font, fontSize, lineHeight }) {
                                                                                        const lines = wrapText(text, font, fontSize, maxWidth);
                                                                                        let currentY = y;
                                                                                        for (const line of lines) {
                                                                                                                        page.drawText(line, { 
                                                                                                                                              x, y: 
                                                                                                                                              currentY, 
                                                                                                                                              size: fontSize, 
                                                                                                                                              font 
                                                                                                                                            });
                                                                                                                        currentY -= lineHeight;
                                                                                                                    }
                                                                                        return lines.length * lineHeight;
                                                                                    }

/**
 * Dessine l'en-tête PDF
 */
function drawPdfHeader(page, data, font, fontBold, pageHeight) {
                                                                    let y = pageHeight - 50;

                                                                    page.drawText("QUESTIONNAIRE D’ENQUÊTE MÉTIER", { x: 90, y, size: 18, font: fontBold });
                                                                    y -= 40;

                                                                    const today = new Date();
                                                                    const dateText = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`;
                                                                    page.drawText(` Date Du Jour:  ${dateText}`, { x: 50, y, size: 12, font });
                                                                    y -= 25;

                                                                    page.drawText(`Nom et prénom : ${data.nom}`, { x: 50, y, size: 12, font });
                                                                    y -= 20;
                                                                    page.drawText(`Poste / Fonction : ${data.poste}`, { x: 50, y, size: 12, font });
                                                                    y -= 20;
                                                                    page.drawText(`Entreprise : ${data.entreprise}`, { x: 50, y, size: 12, font });
                                                                    y -= 20;

                                                                    page.drawLine({ start: { x: 50, y }, end: { x: 545, y }, thickness: 1 });
                                                                    y -= 25;
                                                                    return y;
                                                                }

/**
 * Dessine le pied de page
 */
function drawPdfFooter(page, pageIndex, totalPages, font) {
    const { width } = page.getSize();
    const today = new Date();
    const dateText = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`;

    page.drawText(`Page ${pageIndex + 1} / ${totalPages}`, { x: width / 2 - 40, y: 15, size: 10, font, color: rgb(0.4, 0.4, 0.4) });
    page.drawText(`Hamzaoui Hamid`, { x: width / 2 + 150, y: 15, size: 10, font, color: rgb(0.4, 0.4, 0.4) });
    page.drawText(dateText, { x: 50, y: 15, size: 10, font, color: rgb(0.4, 0.4, 0.4) });
}

/**
 * Vérifie s'il faut un saut de page
 */
function checkPdfPageBreak(y, spaceNeeded, pdfDoc, page, data, font, fontBold, pageWidth, pageHeight) {
    const marginBottom = 80;
    if (y - spaceNeeded < marginBottom) {
        page = pdfDoc.addPage([pageWidth, pageHeight]);
        y = drawPdfHeader(page, data, font, fontBold, pageHeight);
    }
    return { page, y };
}

/**
 * Dessine les bordures verticales
 */
function drawPdfVerticalBorders(page, yTop, yBottom) {
    const tableLeft = 50;
    const tableRight = 545;
    const xAnswer = 300;

    page.drawLine({ start: { x: tableLeft, y: yTop }, end: { x: tableLeft, y: yBottom }, thickness: 1 });
    page.drawLine({ start: { x: xAnswer, y: yTop }, end: { x: xAnswer, y: yBottom }, thickness: 1 });
    page.drawLine({ start: { x: tableRight, y: yTop }, end: { x: tableRight, y: yBottom }, thickness: 1 });
}

/**
 * Crée le PDF
 */
async function createPdf(data) {

                                // Créer un nouveau document PDF  
                                const pdfDoc = await PDFDocument.create();

                                // Définir les dimensions de la page A4
                                const pageWidth = 595;  // A4 width
                                const pageHeight = 842; // A4 height
                                let page = pdfDoc.addPage([pageWidth, pageHeight]);

                                // Récupérer la hauteur de la page pour positionner les éléments
                                const { height } = page.getSize();

                                // Embedding des polices
                                const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
                                const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

                                let y = drawPdfHeader(page, data, font, fontBold, height);

                                // Dessiner les questions et réponses
                                const tableLeft = 50;
                                const tableRight = 545;
                                const xAnswer = 300;
                                const questionWidth = xAnswer - tableLeft;
                                const fontSize = 11;
                                const lineHeight = fontSize + 4;
                                
                                for (const item of data.questionnaire) {
                                                                            const questionText = item.question;
                                                                            const answerText = item.reponse || "";

                                                                            const questionHeight = drawWrappedText({ page, text: questionText, x: tableLeft + 8, y, maxWidth: questionWidth - 16, font, fontSize, lineHeight });
                                                                            const answerHeight   = drawWrappedText({ page, text: answerText, x: xAnswer + 8, y, maxWidth: tableRight - xAnswer - 16, font, fontSize, lineHeight });

                                                                            const rowHeight = Math.max(questionHeight, answerHeight, 30);

                                                                            const result = checkPdfPageBreak(y, rowHeight + 10, pdfDoc, page, data, font, fontBold, pageWidth, pageHeight);
                                                                            page = result.page;
                                                                            y = result.y;

                                                                            const topY = y;
                                                                            const bottomY = y - rowHeight;
                                                                            page.drawLine({ start: { x: tableLeft, y: bottomY }, end: { x: tableRight, y: bottomY }, thickness: 1 });
                                                                            drawPdfVerticalBorders(page, topY, bottomY);

                                                                            y -= rowHeight + 10;
                                                                        }

                                page.drawText("Merci d’avoir rempli ce document !", { x: 180, y: 30, size: 11, font, color: rgb(0.3, 0.3, 0.3) });

                                const pages = pdfDoc.getPages();
                                const totalPages = pages.length;
                                pages.forEach((pg, index) => drawPdfFooter(pg, index, totalPages, font));

                                const pdfBytes = await pdfDoc.save();
                                const filePath = path.join(__dirname, "../tmp", `questionnaire_${data.nom}.pdf`);
                                fs.writeFileSync(filePath, pdfBytes);

                                console.log("PDF créé avec succès !");
                                return filePath;

                               }

module.exports = { createPdf };
