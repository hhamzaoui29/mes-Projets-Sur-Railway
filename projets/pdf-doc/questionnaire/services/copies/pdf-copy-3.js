const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Crée un PDF avec un vrai tableau pour les questions/réponses
 */
function createPdf(data, logoPath = null) {
    return new Promise((resolve, reject) => {
        const filePath = path.join(__dirname, "../tmp", `questionnaire_${data.nom}.pdf`);
        const doc = new PDFDocument({ size: 'A4', margin: 50 });

        // Flux d'écriture
        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);

        // ======== HEADER ========
        doc.font('Helvetica-Bold').fontSize(18).text("QUESTIONNAIRE D’ENQUÊTE MÉTIER", { align: 'center' });
        doc.moveDown();

        // Logo si fourni
        if (logoPath && fs.existsSync(logoPath)) {
            doc.image(logoPath, 450, 30, { width: 100 });
        }

        // Date
        const today = new Date();
        doc.font('Helvetica').fontSize(12)
           .text(`Date du jour : ${today.getDate()}/${today.getMonth()+1}/${today.getFullYear()}`, 50, 80);

        // Coordonnées
        doc.text(`Nom et prénom : ${data.nom}`, 50, 100)
           .text(`Poste / Fonction : ${data.poste}`, 50, 115)
           .text(`Entreprise : ${data.entreprise}`, 50, 130);

        doc.moveTo(50, 150).lineTo(545, 150).stroke(); // ligne séparatrice
        doc.moveDown();

        // ======== TABLEAU ========
        const tableTop = 170;
        const itemMargin = 5;
        const colQuestionWidth = 250;
        const colAnswerWidth = 245;
        const rowHeightMin = 30;
        let y = tableTop;

        // Header du tableau
        doc.font('Helvetica-Bold').fontSize(11);
        doc.rect(50, y, colQuestionWidth, rowHeightMin).stroke();
        doc.rect(50 + colQuestionWidth, y, colAnswerWidth, rowHeightMin).stroke();
        doc.text("Question", 50 + itemMargin, y + itemMargin, { width: colQuestionWidth - itemMargin * 2 });
        doc.text("Réponse", 50 + colQuestionWidth + itemMargin, y + itemMargin, { width: colAnswerWidth - itemMargin * 2 });
        y += rowHeightMin;

        doc.font('Helvetica').fontSize(11);

        // Contenu du tableau
        data.questionnaire.forEach((item, index) => {
            const questionText = item.question;
            const answerText = item.reponse || "";

            // Couleur alternée
            if (index % 2 === 0) {
                doc.rect(50, y, colQuestionWidth + colAnswerWidth, rowHeightMin).fillAndStroke('#f2f2f2', 'black');
            } else {
                doc.rect(50, y, colQuestionWidth + colAnswerWidth, rowHeightMin).stroke();
            }

            // Dessiner le texte wrap
            doc.fillColor('black')
               .text(questionText, 50 + itemMargin, y + itemMargin, { width: colQuestionWidth - itemMargin * 2, height: rowHeightMin - itemMargin * 2 })
               .text(answerText, 50 + colQuestionWidth + itemMargin, y + itemMargin, { width: colAnswerWidth - itemMargin * 2, height: rowHeightMin - itemMargin * 2 });

            y += rowHeightMin;

            // Saut de page si nécessaire
            if (y > 750) {
                doc.addPage();
                y = 50;
            }
        });

        // Message de fin
        doc.moveDown(2);
        doc.text("Merci d’avoir rempli ce document !", { align: 'center', color: 'gray' });

        // ======== FOOTER ========
        const range = doc.bufferedPageRange(); // toutes les pages
        for (let i = 0; i < range.count; i++) {
            doc.switchToPage(i);
            doc.fontSize(10).fillColor('gray');
            doc.text(`Page ${i + 1} / ${range.count}`, 250, 780, { align: 'center' });
            doc.text("Hamzaoui Hamid", 450, 780);
            doc.text(`${today.getDate()}/${today.getMonth()+1}/${today.getFullYear()}`, 50, 780);
        }

        // Fin du PDF
        doc.end();

        stream.on('finish', () => {
            console.log("PDF créé avec succès !");
            resolve(filePath);
        });
        stream.on('error', reject);
    });
}

module.exports = { createPdf };
