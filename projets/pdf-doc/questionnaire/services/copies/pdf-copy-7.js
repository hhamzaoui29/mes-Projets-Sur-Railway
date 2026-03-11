/**
 * pdf.js
 * Module pour générer un PDF de questionnaire métier avec un vrai tableau
 * utilisant PDFKit. Gestion du texte justifié, des lignes longues et de la pagination.
 */

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/* =============================
   CONSTANTES DU TABLEAU
============================== */
const TABLE = {
    startX: 50,            // marge gauche du tableau
    tableTop: 200,         // position verticale de départ du tableau
    colQuestionWidth: 250, // largeur colonne "Question"
    colAnswerWidth: 245,   // largeur colonne "Réponse"
    rowHeightMin: 30,      // hauteur minimale d'une ligne
    cellPadding: 6,        // padding interne dans les cellules
    pageBottomLimit: 750   // limite avant le bas de page pour saut
};

/* =============================
   INITIALISATION DU PDF
============================== */
function initPdf(data) {
    // Chemin final du PDF
    const filePath = path.join(__dirname, "../tmp", `questionnaire_${data.nom}.pdf`);

    // Création du document PDF A4
    const doc = new PDFDocument({ size: 'A4', margin: 50 });

    // Création du flux d'écriture vers le fichier
    const stream = fs.createWriteStream(filePath);

    // Connexion PDF → flux
    doc.pipe(stream);

    return { doc, stream, filePath };
}

/* =============================
   FONCTION POUR COUPER LE TEXTE EN LIGNES
   Compatible PDFKit, pour éviter débordement
============================== */
function splitTextToWidth(doc, text, maxWidth, fontSize = 11) {
    // Séparer le texte par mots
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';

    for (const word of words) {
        // Tester si le mot peut rentrer dans la ligne actuelle
        const testLine = currentLine ? currentLine + ' ' + word : word;
        const testWidth = doc.widthOfString(testLine, { fontSize });

        if (testWidth <= maxWidth) {
            // Ajout du mot à la ligne
            currentLine = testLine;
        } else {
            // Ligne pleine → on la sauvegarde et on commence une nouvelle
            if (currentLine) lines.push(currentLine);
            currentLine = word;
        }
    }

    // Ajouter la dernière ligne
    if (currentLine) lines.push(currentLine);

    return lines;
}

/* =============================
   HEADER DU PDF
   - Titre centré
   - Logo optionnel
   - Coordonnées et date
============================== */
function createHeader(doc, data, logoPath) {
    // Titre principal centré
    doc.font('Helvetica-Bold')
       .fontSize(18)
       .text("QUESTIONNAIRE D’ENQUÊTE MÉTIER", { align: 'center' })
       .moveDown();

    // Logo si fourni
    if (logoPath && fs.existsSync(logoPath)) {
        doc.image(logoPath, 450, 30, { width: 100 });
    }

    const today = new Date();

    // Date
    doc.font('Helvetica')
       .fontSize(12)
       .text(
           `Date du jour : ${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`,
           150, 80
       );

    // Coordonnées
    doc.text(`Nom et prénom : ${data.nom}`, 150, 100);
    doc.text(`Poste / Fonction : ${data.poste}`, 150, 115);
    doc.text(`Entreprise : ${data.entreprise}`, 150, 130);

    // Ligne séparatrice horizontale
    doc.moveTo(150, 150).lineTo(345, 150).stroke();
}

/* =============================
   FOOTER DU PDF
   - Numéro de page
   - Auteur
   - Date
============================== */
function createFooter(doc) {
    const today = new Date();
    const range = doc.bufferedPageRange();

    // Boucle sur toutes les pages
    for (let i = 0; i < range.count; i++) {
        doc.switchToPage(i);
        doc.fontSize(10).fillColor('gray');

        // Texte centré pour numéro de page
        doc.text(`Page ${i + 1} / ${range.count}`, 250, 780, { align: 'center' });

        // Auteur
        doc.text("Hamzaoui Hamid", 450, 780);

        // Date
        doc.text(
            `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`,
            50, 780
        );
    }
}

/* =============================
   HEADER DU TABLEAU
   - Dessine la ligne d'entête du tableau
   - Retourne la position Y après l'entête
============================== */
function drawTableHeader(doc) {
    const { startX, tableTop, colQuestionWidth, colAnswerWidth, rowHeightMin } = TABLE;

    let y = tableTop;

    // Police bold pour l'entête
    doc.font('Helvetica-Bold').fontSize(11);

    // Bordures des cellules
    doc.rect(startX, y, colQuestionWidth, rowHeightMin).stroke();
    doc.rect(startX + colQuestionWidth, y, colAnswerWidth, rowHeightMin).stroke();

    // Texte centré
    doc.text("Question", startX, y + 8, { width: colQuestionWidth, align: 'center' });
    doc.text("Réponse", startX + colQuestionWidth, y + 8, { width: colAnswerWidth, align: 'center' });

    // Retour à la police normale pour le contenu
    doc.font('Helvetica').fontSize(11);

    return y + rowHeightMin;
}

/* =============================
   CALCUL DE LA HAUTEUR D'UNE LIGNE
   - Prend en compte le texte découpé
   - Ajoute le padding
============================== */
function calculateRowHeight(doc, question, answer) {
    const { colQuestionWidth, colAnswerWidth, rowHeightMin, cellPadding } = TABLE;

    // Découper le texte en lignes
    const questionLines = splitTextToWidth(doc, question, colQuestionWidth - cellPadding * 2);
    const answerLines = splitTextToWidth(doc, answer, colAnswerWidth - cellPadding * 2);

    // Hauteur approximative = nombre de lignes * taille d'une ligne (14)
    const questionHeight = questionLines.length * 14;
    const answerHeight = answerLines.length * 14;

    // Retourner la hauteur finale
    return Math.max(questionHeight, answerHeight, rowHeightMin) + cellPadding * 2;
}

/* =============================
   VERIFICATION DU SAUT DE PAGE
   - Ajoute une nouvelle page si nécessaire
============================== */
function checkPageBreak(doc, table, rowHeight) {
    const { pageBottomLimit } = TABLE;

    if (table.y + rowHeight > pageBottomLimit) {
        doc.addPage();
        table.y = drawTableHeader(doc);
    }
}

/* =============================
   DESSIN D'UNE LIGNE DU TABLEAU
   - Texte justifié
   - Découpage ligne par ligne
   - Fond alterné
============================== */
function drawTableRow(doc, table, question, answer, index) {
    const { startX, colQuestionWidth, colAnswerWidth, cellPadding, pageBottomLimit } = TABLE;

    // Découpe le texte pour tenir dans les colonnes
    const questionLines = splitTextToWidth(doc, question, colQuestionWidth - cellPadding * 2);
    const answerLines = splitTextToWidth(doc, answer, colAnswerWidth - cellPadding * 2);

    // Calcul hauteur
    const rowHeight = Math.max(questionLines.length, answerLines.length) * 14 + cellPadding * 2;

    // Saut de page si nécessaire
    if (table.y + rowHeight > pageBottomLimit) {
        doc.addPage();
        table.y = drawTableHeader(doc);
    }

    // Fond alterné
    if (index % 2 === 0) {
        doc.rect(startX, table.y, colQuestionWidth + colAnswerWidth, rowHeight).fill('#f2f2f2');
    }

    // Bordures
    doc.strokeColor('black')
       .rect(startX, table.y, colQuestionWidth, rowHeight).stroke()
       .rect(startX + colQuestionWidth, table.y, colAnswerWidth, rowHeight).stroke();

    // Dessin ligne par ligne question
    let currentY = table.y + cellPadding;
    for (const line of questionLines) {
        doc.fillColor('black').text(line, startX + cellPadding, currentY, {
            width: colQuestionWidth - cellPadding * 2,
            align: 'justify',
            lineGap: 2
        });
        currentY += 14;
    }

    // Dessin ligne par ligne réponse
    currentY = table.y + cellPadding;
    for (const line of answerLines) {
        doc.fillColor('black').text(line, startX + colQuestionWidth + cellPadding, currentY, {
            width: colAnswerWidth - cellPadding * 2,
            align: 'justify',
            lineGap: 2
        });
        currentY += 14;
    }

    // Avancer Y pour la prochaine ligne
    table.y += rowHeight;
}

/* =============================
   FONCTION PRINCIPALE
============================== */
function createPdf(data, logoPath = null) {
    return new Promise((resolve, reject) => {

        // Initialisation PDF
        const { doc, stream, filePath } = initPdf(data);

        // HEADER
        createHeader(doc, data, logoPath);

        // TABLEAU
        const table = { y: drawTableHeader(doc) }; // position Y après header tableau

        // CONTENU DU TABLEAU
        data.questionnaire.forEach((item, index) => {
            drawTableRow(doc, table, item.question || "", item.reponse || "", index);
        });

        // FOOTER
        createFooter(doc);

        // Finalisation PDF
        doc.end();

        // Événements flux
        stream.on('finish', () => resolve(filePath));
        stream.on('error', reject);
    });
}

/* =============================
   EXPORT DU MODULE
============================== */
module.exports = { createPdf };
