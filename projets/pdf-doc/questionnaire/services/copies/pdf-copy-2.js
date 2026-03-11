const fs = require("fs");
const path = require("path");
const { PDFDocument, StandardFonts, rgb } = require("pdf-lib");

/**
 * Découpe un texte pour qu'il tienne dans une largeur max
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
        page.drawText(line, { x, y: currentY, size: fontSize, font });
        currentY -= lineHeight;
    }
    return lines.length * lineHeight;
}

/**
 * Dessine l'en-tête PDF avec logo et coordonnées
 */
async function drawPdfHeader(page, data, font, fontBold, pageHeight, logoPath = null) {
    let y = pageHeight - 50;

    // Titre principal
    page.drawText("QUESTIONNAIRE D’ENQUÊTE MÉTIER", { x: 90, y, size: 18, font: fontBold });
    y -= 40;

    // Logo en haut à droite si fourni
    if (logoPath && fs.existsSync(logoPath)) {
        const logoBytes = fs.readFileSync(logoPath);
        const pngImage = await page.doc.embedPng(logoBytes);
        page.drawImage(pngImage, { x: 450, y: pageHeight - 90, width: 100, height: 50 });
    }

    // Date
    const today = new Date();
    const dateText = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`;
    page.drawText(`Date Du Jour: ${dateText}`, { x: 50, y, size: 12, font });
    y -= 25;

    // Coordonnées
    page.drawText(`Nom et prénom : ${data.nom}`, { x: 50, y, size: 12, font });
    y -= 20;
    page.drawText(`Poste / Fonction : ${data.poste}`, { x: 50, y, size: 12, font });
    y -= 20;
    page.drawText(`Entreprise : ${data.entreprise}`, { x: 50, y, size: 12, font });
    y -= 20;

    // Ligne séparatrice
    page.drawLine({ start: { x: 50, y }, end: { x: 545, y }, thickness: 1 });
    y -= 25;

    return y;
}

/**
 * Dessine le pied de page avec numéro de page et date
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
async function checkPdfPageBreak(y, spaceNeeded, pdfDoc, page, data, font, fontBold, pageWidth, pageHeight, logoPath) {
    const marginBottom = 80;
    if (y - spaceNeeded < marginBottom) {
        page = pdfDoc.addPage([pageWidth, pageHeight]);
        y = await drawPdfHeader(page, data, font, fontBold, pageHeight, logoPath);
    }
    return { page, y };
}

/**
 * Dessine les bordures verticales du tableau
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
 * Crée le PDF complet avec améliorations "pro"
 */
async function createPdf(data, logoPath = null) {
    const pdfDoc = await PDFDocument.create();

    const pageWidth = 595;  // A4
    const pageHeight = 842;
    let page = pdfDoc.addPage([pageWidth, pageHeight]);

    // Embedding des polices
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Position initiale après en-tête
    let y = await drawPdfHeader(page, data, font, fontBold, pageHeight, logoPath);

    const tableLeft = 50;
    const tableRight = 545;
    const xAnswer = 300;
    const questionWidth = xAnswer - tableLeft;
    const fontSize = 11;
    const lineHeight = fontSize + 4;

    // Dessiner les questions
   for (let i = 0; i < data.questionnaire.length; i++) {

    const item = data.questionnaire[i];
    const questionText = item.question;
    const answerText = item.reponse || "";

    // Estimer la hauteur du texte
    const questionHeight = wrapText(questionText, font, fontSize, questionWidth - 16).length * lineHeight;
    const answerHeight = wrapText(answerText, font, fontSize, tableRight - xAnswer - 16).length * lineHeight;
    const rowHeight = Math.max(questionHeight, answerHeight, 30);

    // Vérifier le saut de page
    const result = await checkPdfPageBreak(y, rowHeight + 10, pdfDoc, page, data, font, fontBold, pageWidth, pageHeight, logoPath);
    page = result.page;
    y = result.y;

    const topY = y;
    const bottomY = y - rowHeight;

    // Couleur alternée
    const fillColor = i % 2 === 0 ? rgb(0.95, 0.95, 0.95) : rgb(1, 1, 1);
    page.drawRectangle({ x: tableLeft, y: bottomY, width: tableRight - tableLeft, height: rowHeight, color: fillColor, opacity: 0.5 });

    // Dessiner les lignes du tableau
    page.drawLine({ start: { x: tableLeft, y: bottomY }, end: { x: tableRight, y: bottomY }, thickness: 1 });
    drawPdfVerticalBorders(page, topY, bottomY);

    // Dessiner le texte **par-dessus le rectangle**
    drawWrappedText({ page, text: questionText, x: tableLeft + 8, y: topY - 4, maxWidth: questionWidth - 16, font, fontSize, lineHeight });
    drawWrappedText({ page, text: answerText, x: xAnswer + 8, y: topY - 4, maxWidth: tableRight - xAnswer - 16, font, fontSize, lineHeight });

    y -= rowHeight + 10;
   }

    // Message de fin
    page.drawText("Merci d’avoir rempli ce document !", { x: 180, y: 30, size: 11, font, color: rgb(0.3, 0.3, 0.3) });

    // Ajouter les pieds de page sur toutes les pages
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
