const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');




/**
 * Crée un PDF avec un vrai tableau pour les questions/réponses
 */
/**
 * Génère un PDF de questionnaire avec un vrai tableau (PDFKit)
 * @param {Object} data - Données du questionnaire (nom, poste, entreprise, questions)
 * @param {String|null} logoPath - Chemin du logo (optionnel)
 * @returns {Promise<string>} - Chemin du fichier PDF généré
 */
function createPdf(data, logoPath = null) {

    // La fonction retourne une Promise car la génération du PDF est asynchrone
    return new Promise((resolve, reject) => {

        /* =============================
           INITIALISATION DU PDF
        ============================== */

        // Chemin du fichier PDF final
        const filePath = path.join(__dirname, "../tmp", `questionnaire_${data.nom}.pdf`);

        // Création du document PDF (format A4 avec marges)
        const doc = new PDFDocument({
            size: 'A4',
            margin: 50
        });

        // Création du flux d'écriture vers le fichier
        const stream = fs.createWriteStream(filePath);

        // Connexion du document PDF au flux
        doc.pipe(stream);

        /* =============================
           HEADER (EN-TÊTE DU PDF)
        ============================== */

        // Titre principal centré
        doc.font('Helvetica-Bold')
           .fontSize(18)
           .text("QUESTIONNAIRE D’ENQUÊTE MÉTIER", { align: 'center' });

        // Saut de ligne vertical
        doc.moveDown();

        // Affichage du logo s'il est fourni et existe
        if (logoPath && fs.existsSync(logoPath)) {
            doc.image(logoPath, 450, 30, { width: 100 });
        }

        // Récupération de la date du jour
        const today = new Date();

        // Affichage de la date
        doc.font('Helvetica')
           .fontSize(12)
           .text(
                `Date du jour : ${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`,
                150,   // marge gauche
                80     // marge haute
            );

        /* =============================
           COORDONNÉES DE LA PERSONNE
        ============================== */

        // Nom et prénom
        doc.text(`Nom et prénom : ${data.nom}`, 150, 100);

        // Poste / Fonction
        doc.text(`Poste / Fonction : ${data.poste}`, 150, 115);

        // Entreprise
        doc.text(`Entreprise : ${data.entreprise}`, 150, 130);

        // Ligne horizontale de séparation
        doc.moveTo(150, 150)
           .lineTo(345, 150)
           .stroke();

        doc.moveDown();

        /* =============================
           CONFIGURATION DU TABLEAU
        ============================== */

        const tableTop = 200;       // Position Y de départ du tableau
        const itemMargin = 5;       // Marge interne dans chaque cellule
        const colQuestionWidth = 250; // Largeur colonne "Question"
        const colAnswerWidth = 245;   // Largeur colonne "Réponse"
        const rowHeightMin = 30;    // Hauteur minimale d'une ligne
        let y = tableTop;           // Position verticale courante

        /* =============================
           HEADER DU TABLEAU
        ============================== */

        doc.font('Helvetica-Bold').fontSize(11);

        // Cellule "Question"
        doc.rect(50, y, colQuestionWidth, rowHeightMin).stroke();

        // Cellule "Réponse"
        doc.rect(50 + colQuestionWidth, y, colAnswerWidth, rowHeightMin).stroke();

        // Texte centré du header
        doc.text("Question",
            50 + itemMargin,
            y + itemMargin,
            { width: colQuestionWidth - itemMargin * 2, align: 'center' }
        );

        doc.text("Réponse",
            50 + colQuestionWidth + itemMargin,
            y + itemMargin,
            { width: colAnswerWidth - itemMargin * 2, align: 'center' }
        );

        // Passage à la ligne suivante
        y += rowHeightMin;

        // Police normale pour le contenu
        doc.font('Helvetica').fontSize(11);

        /* =============================
           CONTENU DU TABLEAU
        ============================== */

        data.questionnaire.forEach((item, index) => {

            // Texte de la question et de la réponse
            const questionText = item.question;
            const answerText = item.reponse || "";

            // Calcul de la hauteur réelle du texte question
            const questionHeight = doc.heightOfString(questionText, {
                width: colQuestionWidth - itemMargin * 2
            });

            // Calcul de la hauteur réelle du texte réponse
            const answerHeight = doc.heightOfString(answerText, {
                width: colAnswerWidth - itemMargin * 2
            });

            // Hauteur finale de la ligne (la plus grande des deux)
            const rowHeight =
                Math.max(questionHeight, answerHeight, rowHeightMin)
                + itemMargin * 2;

            /* =============================
               GESTION DU SAUT DE PAGE
            ============================== */

            // Si la ligne dépasse le bas de la page
            if (y + rowHeight > 750) {
                doc.addPage(); // Nouvelle page
                y = 50;        // Réinitialisation du Y
            }

            /* =============================
               FOND DE LIGNE (COULEUR ALTERNÉE)
            ============================== */

            if (index % 2 === 0) {
                doc.rect(
                    50,
                    y,
                    colQuestionWidth + colAnswerWidth,
                    rowHeight
                ).fill('#f2f2f2');
            }

            /* =============================
               BORDURES DES CELLULES
            ============================== */

            doc.strokeColor('black')
               .rect(50, y, colQuestionWidth, rowHeight).stroke()
               .rect(50 + colQuestionWidth, y, colAnswerWidth, rowHeight).stroke();

            /* =============================
               TEXTE DANS LES CELLULES
            ============================== */

            doc.fillColor('black')
               .text(
                    questionText,
                    50 + itemMargin,
                    y + itemMargin,
                    {   width: colQuestionWidth - itemMargin * 2,
                        align: 'justify',
                        lineGap: 2 
                     }
                )
               .text(
                    answerText,
                    50 + colQuestionWidth + itemMargin,
                    y + itemMargin,
                    {     width: colAnswerWidth - itemMargin * 2,
                         align: 'justify',
                         lineGap: 2 
                     }
                );

            // Déplacement vertical pour la ligne suivante
            y += rowHeight;
        });

        /* =============================
           FOOTER (PIED DE PAGE)
        ============================== */

        // Récupération de toutes les pages
        const range = doc.bufferedPageRange();

        // Ajout du footer sur chaque page
        for (let i = 0; i < range.count; i++) {
            doc.switchToPage(i);
            doc.fontSize(10).fillColor('gray');

            doc.text(`Page ${i + 1} / ${range.count}`, 250, 780, { align: 'center' });
            doc.text("Hamzaoui Hamid", 450, 780);
            doc.text(
                `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`,
                50,
                780
            );
        }

        /* =============================
           FINALISATION DU PDF
        ============================== */

        // Fermeture du document
        doc.end();

        // Succès
        stream.on('finish', () => {
            console.log("PDF créé avec succès !");
            resolve(filePath);
        });

        // Erreur
        stream.on('error', reject);
    });
}


module.exports = { createPdf };
