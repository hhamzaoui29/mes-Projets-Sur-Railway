const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

/**
 * Nettoie un texte pour éviter les erreurs d'encodage
 */
function cleanText(text) {
    if (!text) return '';
    return String(text)
        .replace(/[^\x00-\x7F]/g, '') // Enlève les caractères non-ASCII si problème
        .trim();
}

/**
 * Découpe un texte pour qu'il tienne dans une largeur donnée
 */
function splitTextToWidth(doc, text, maxWidth) {
    if (!text) return [''];
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';

    words.forEach(word => {
        const testLine = currentLine + (currentLine ? ' ' : '') + word;
        const width = doc.widthOfString(testLine);
        
        if (width < maxWidth) {
            currentLine = testLine;
        } else {
            if (currentLine) lines.push(currentLine);
            currentLine = word;
        }
    });
    
    if (currentLine) lines.push(currentLine);
    return lines.length ? lines : [text];
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
    const startX = 100;
    let currentY = 160;

    // Lignes de séparation
    doc.moveTo(100, currentY+1).lineTo(500, currentY+1).stroke();
    doc.moveTo(100, currentY+2).lineTo(500, currentY+2).stroke();
    doc.moveTo(100, currentY+3).lineTo(500, currentY+3).stroke();

    // Date
    currentY += 30;
    doc.font('Roboto-Bold').fontSize(15).fillColor('#424242')
       .text('Date de l’entretien :', startX, currentY, { continued: true })
       .font('Roboto')
       .text(` ${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`);

    currentY += 20;

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
        doc.text(line, startX + cellPadding, lineY, { 
            width: colQuestionWidth - cellPadding * 2, 
            align: 'justify', 
            lineGap: 2 
        });
        lineY += 14;
    });

    // Réponse
    lineY = table.y + cellPadding;
    answerLines.forEach(line => {
        doc.text(line, startX + colQuestionWidth + cellPadding, lineY, { 
            width: colAnswerWidth - cellPadding * 2, 
            align: 'justify', 
            lineGap: 2 
        });
        lineY += 14;
    });

    table.y += rowHeight;
}

/* =========================================
   FONCTION PRINCIPALE DE CRÉATION PDF
========================================= */
async function createPdf(data, logoPath = null) {
    return new Promise((resolve, reject) => {
        try {
            // Créer le dossier tmp s'il n'existe pas
            const tmpDir = path.join(__dirname, '..', '..', 'tmp');
            if (!fs.existsSync(tmpDir)) {
                fs.mkdirSync(tmpDir, { recursive: true });
                console.log('📁 Dossier tmp créé:', tmpDir);
            }

            // Générer un nom de fichier unique
            const timestamp = Date.now();
            const fileName = `compte_rendu_${timestamp}.pdf`;
            const filePath = path.join(tmpDir, fileName);

            console.log('📄 Création du PDF:', filePath);

            // Créer le document PDF
            const doc = new PDFDocument({ 
                size: 'A4', 
                margin: 50,
                bufferPages: true 
            });
            
            const stream = fs.createWriteStream(filePath);
            doc.pipe(stream);

            // Charger les polices
            try {
                const fontRegular = path.join(__dirname, 'fonts', 'Roboto-Regular.ttf');
                const fontBold = path.join(__dirname, 'fonts', 'Roboto-Bold.ttf');
                
                if (fs.existsSync(fontRegular) && fs.existsSync(fontBold)) {
                    doc.registerFont('Roboto', fontRegular);
                    doc.registerFont('Roboto-Bold', fontBold);
                    doc.font('Roboto');
                } else {
                    console.log('⚠️ Polices non trouvées, utilisation des polices par défaut');
                    doc.font('Helvetica');
                }
            } catch (e) {
                console.log('⚠️ Erreur chargement polices:', e.message);
                doc.font('Helvetica');
            }

            // ========== 1. HEADER ==========
            createHeader(doc, data, logoPath);
            
            // ========== 2. PRÉPARATION DU TABLEAU ==========
            const table = {
                startX: 50,                    // Position X du tableau
                y: doc.y + 70,                  // Position Y après le header
                colQuestionWidth: 200,           // Largeur colonne Question
                colAnswerWidth: 270,             // Largeur colonne Réponse
                rowHeightMin: 30,                 // Hauteur minimum des lignes
                cellPadding: 8,                   // Padding dans les cellules
                pageBottomLimit: 750,              // Limite basse de la page
                currentPageNumber: 1                // Numéro de page courant
            };

            // ========== 3. TITRE DU TABLEAU ==========
            doc.font('Roboto-Bold')
               .fontSize(14)
               .fillColor('#1a237e')
               .text('Détail des réponses', 80, table.y - 20);
            
            // ========== 4. EN-TÊTE DU TABLEAU ==========
            drawTableHeader(doc, table);

            // ========== 5. AFFICHAGE DES QUESTIONS/RÉPONSES ==========
            const questions = data.questionnaire || [];
            console.log(`📊 ${questions.length} questions à afficher dans le PDF`);

            if (questions && questions.length > 0) {
                questions.forEach((item, index) => {
                    // Log pour debug
                    console.log(`📝 Ligne ${index + 1}:`, {
                        question: item.question.substring(0, 30) + '...',
                        reponse: item.reponse.substring(0, 30) + '...'
                    });
                    
                    drawTableRow(
                        doc, 
                        table, 
                        item.question || 'Question non disponible', 
                        item.reponse || 'Réponse non disponible', 
                        index
                    );
                });
            } else {
                // Afficher un message si aucune question
                doc.font('Roboto')
                   .fontSize(12)
                   .fillColor('#666')
                   .text('Aucune réponse disponible', 80, table.y, {
                       align: 'center',
                       width: 470
                   });
            }

            // ========== 6. FOOTER ==========
            addFooter(doc, table.currentPageNumber);

            // Finaliser le document
            doc.end();

            // Gestion de la fin d'écriture
            stream.on('finish', () => {
                console.log('✅ PDF généré avec succès:', filePath);
                
                // Vérifier que le fichier existe
                if (fs.existsSync(filePath)) {
                    const stats = fs.statSync(filePath);
                    console.log(`📊 Taille du fichier: ${stats.size} octets`);
                    resolve(filePath);
                } else {
                    reject(new Error('Le fichier PDF n\'a pas été créé'));
                }
            });

            stream.on('error', (error) => {
                console.error('❌ Erreur stream:', error);
                reject(error);
            });

        } catch (error) {
            console.error('❌ Erreur dans createPdf:', error);
            reject(error);
        }
    });
}

module.exports = { createPdf };