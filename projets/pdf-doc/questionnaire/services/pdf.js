const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/* =========================================
   FONCTION POUR NETTOYER LE TEXTE
========================================= */
function cleanText(str) {
    if (!str) return '';
    return str
        .replace(/\u00D0/g, 'D')    // remplacer Ð par D
        .replace(/\uFFFD/g, '')     // supprimer les caractères inconnus
        .replace(/\r/g, '');        // supprimer retour chariot
}

/* =========================================
   HEADER DU PDF
========================================= */
function createHeader(doc, data, logoPath) {
    // Titre principal centré
    doc.font('Roboto-Bold')
       .fontSize(20)
       .fillColor('#1a237e')
       .text("Compte rendu d’entretien métier – Technicien d'Exploitation", { align: 'center' })
       .moveDown(1);

    // Logo en haut à droite si fourni
    if (logoPath && fs.existsSync(logoPath)) {
        doc.image(logoPath, 450, 30, { width: 100 });
    }

    const today = new Date();
     //                                                      y
    // Informations personnelles et date                     |
    const startX = 100; // position horizental           x----|----->
    let currentY = 160; // position verticale initiale       | 
    //const lineGap = 4;  // espace entre lignes             v
    // Ligne de séparation
     
    doc.moveTo(100, currentY+1).lineTo(500, currentY+1).stroke();
    doc.moveTo(100, currentY+2).lineTo(500, currentY+2).stroke();
    doc.moveTo(100, currentY+3).lineTo(500, currentY+3).stroke();
    // Date
    currentY += 30; // avancer pour la ligne suivante
    doc.font('Roboto-Bold').fontSize(15).fillColor('#424242')
    .text('Date de l’entretien :', startX, currentY, { continued: true })
    .font('Roboto')
    .text(` ${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`);

    currentY += 20; // avancer pour la ligne suivante

    // Nom
    doc.font('Roboto-Bold').text('Nom de la personne interrogée :', startX, currentY, { continued: true })
    .font('Roboto')
    .text(` ${cleanText(data.nom)}`);

    currentY += 20;

    // Poste / Fonction
    doc.font('Roboto-Bold').text('Poste / Fonction :', startX, currentY, { continued: true })
    .font('Roboto')
    .text(` ${cleanText(data.poste)}`);

    currentY += 20;

    // Entreprise
    doc.font('Roboto-Bold').text('Entreprise :', startX, currentY, { continued: true })
    .font('Roboto')
    .text(` ${cleanText(data.entreprise)}`);
    
    // Ligne de séparation
    currentY += 40; 
    doc.moveTo(100, currentY+1).lineTo(500, currentY+1).stroke();
    doc.moveTo(100, currentY+2).lineTo(500, currentY+2).stroke();
    doc.moveTo(100, currentY+3).lineTo(500, currentY+3).stroke();

}

/* =========================================
   FOOTER DU PDF
========================================= */
function addFooter(doc, pageNumber) {
    const today = new Date();
    doc.font('Roboto')
       .fontSize(10)
       .fillColor('#616161')
       .text(`Page ${pageNumber}`, 250, 780, { align: 'center' })
       .text("Hamzaoui Hamid", 450, 780)
       .text(`${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`, 50, 780);
}

/* =========================================
   HEADER DU TABLEAU
========================================= */
function drawTableHeader(doc, table) {

    const { startX, colQuestionWidth, colAnswerWidth, rowHeightMin } = table;

    // Style header
    doc.font('Roboto-Bold').fontSize(11).fillColor('#1a237e');

    // Cellules
    doc.rect(startX, table.y, colQuestionWidth, rowHeightMin).stroke();
    doc.rect(startX + colQuestionWidth, table.y, colAnswerWidth, rowHeightMin).stroke();

    // Texte centré
    doc.text("Question", startX, table.y + 8, { width: colQuestionWidth, align: 'center' });
    doc.text("Réponse", startX + colQuestionWidth, table.y + 8, { width: colAnswerWidth, align: 'center' });

    table.y += rowHeightMin;
}

/* =========================================
   SPLIT TEXTE POUR CELLULE
   Gère retours à la ligne et puces
========================================= */
function splitTextToWidth(doc, text, maxWidth, fontSize = 11) {
    const lines = [];
    if (!text) return lines;

    cleanText(text).split('\n').forEach(paragraph => {
        const words = paragraph.split(' ');
        let line = '';

        words.forEach(word => {
            const testLine = line ? line + ' ' + word : word;
            const width = doc.widthOfString(testLine, { fontSize });
            if (width <= maxWidth) {
                line = testLine;
            } else {
                if (line) lines.push(line);
                line = word.startsWith('-') ? '  ' + word : word; // indentation puces
            }
        });

        if (line) lines.push(line);
    });

    return lines;
}

/* =========================================
   DESSIN D’UNE LIGNE DU TABLEAU
========================================= */
function drawTableRow(doc, table, question, answer, index) {
    const { startX, colQuestionWidth, colAnswerWidth, rowHeightMin, cellPadding, pageBottomLimit } = table;

    // Découpage texte
    const questionLines = splitTextToWidth(doc, question, colQuestionWidth - cellPadding * 2);
    const answerLines = splitTextToWidth(doc, answer, colAnswerWidth - cellPadding * 2);

    const rowHeight = Math.max(
                                questionLines.length * 14,
                                answerLines.length * 14,
                                rowHeightMin
                            ) + cellPadding * 2;

    // Saut de page si nécessaire
    if (table.y + rowHeight > pageBottomLimit) {
        doc.addPage();
        table.currentPageNumber++;
        addFooter(doc, table.currentPageNumber);
        table.y = 50;
        drawTableHeader(doc, table);
    }

    // Fond alterné
    doc.rect(startX, table.y, colQuestionWidth + colAnswerWidth, rowHeight)
       .fill(index % 2 === 0 ? '#e3f2fd' : '#ffffff');

    // Bordures
    doc.strokeColor('#0d47a1')
       .lineWidth(1)
       .rect(startX, table.y, colQuestionWidth, rowHeight).stroke()
       .rect(startX + colQuestionWidth, table.y, colAnswerWidth, rowHeight).stroke();

    // Texte
    doc.fillColor('#212121').font('Roboto').fontSize(11);

    // Question
    let lineY = table.y + cellPadding;
    questionLines.forEach(line => {
        doc.text(line, startX + cellPadding, lineY, { width: colQuestionWidth - cellPadding * 2, align: 'justify', lineGap: 2 });
        lineY += 14;
    });

    // Réponse
    lineY = table.y + cellPadding;
    answerLines.forEach(line => {
        doc.text(line, startX + colQuestionWidth + cellPadding, lineY, { width: colAnswerWidth - cellPadding * 2, align: 'justify', lineGap: 2 });
        lineY += 14;
    });

    table.y += rowHeight;
}

/* =========================================
   FONCTION PRINCIPALE
========================================= */
function createPdf(data, logoPath = null) {
    return new Promise((resolve, reject) => {
        const filePath = path.join(__dirname, "../tmp", `questionnaire_${data.nom}.pdf`);
        const doc = new PDFDocument({ size: 'A4', margin: 50 });

        // Charger police Unicode
        doc.registerFont('Roboto', path.join(__dirname, 'fonts/Roboto-Regular.ttf'));
        doc.registerFont('Roboto-Bold', path.join(__dirname, 'fonts/Roboto-Bold.ttf'));

        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);

        // Header général
        createHeader(doc, data, logoPath);

        // Footer première page
        addFooter(doc, 1);

        // Dessiner Le Tableau
        const table = {
                            startX: 10, // DEBUT DU TABLEAU A GAUCHE A 10PX
                            y: 350,     // DEBUT DU TABLEAU EN BAS A 250PX
                            colQuestionWidth: 200,// COLONNE DES QUESTION
                            colAnswerWidth: 380,  // COLONNE DES REPONSES
                            rowHeightMin: 30, // LA TAILLE EN HAUTEUR MINIMUM DE LA COLONNE
                            cellPadding: 6, // ESPACE A L'INTERIEUR DES CELLULES
                            pageBottomLimit: 800,
                            currentPageNumber: 1
                        };

        drawTableHeader(doc, table);

        data.questionnaire.forEach((item, index) => {
            drawTableRow(doc, table, item.question || "", item.reponse || "", index);
        });

        addFooter(doc, table.currentPageNumber);

        doc.end();

        stream.on('finish', () => resolve(filePath));
        stream.on('error', reject);
    });
}

module.exports = { createPdf };
