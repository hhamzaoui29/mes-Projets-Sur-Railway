/******************************************************************
 * IMPORTS
 ******************************************************************/
const { PDFDocument, StandardFonts, rgb } = require("pdf-lib");
const fs = require("fs");
const path = require("path");

const table = require("./table");
const texte = require('./texte');



/* =========================================
   HEADER DU PDF
========================================= */

/**
 * | Paramètre  | Rôle                                                |
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
*🔎 Comprendre les coordonnées PDF
* - Dans pdf-lib :
*                  - (0,0) est en bas à gauche
*                  - X augmente vers la droite
*                  - Y augmente vers le haut
* 
 */
async function createHeader(pdfDoc, page, data, font, height, width, logoPath) {

    // Logo en haut à droite si fourni
    if (logoPath && fs.existsSync(logoPath)) {

        const logoBytes = fs.readFileSync(logoPath);
        
        // ⚠️ utilise embedJpg si ton logo est en jpg
        const logoImage = await pdfDoc.embedPng(logoBytes); 

        //JOUER AVEC LA TAILLE DU LOGO
        const maxWidth = 50; // On veut que le logo fasse 50px maximum en largeur.
        const scale = maxWidth / logoImage.width;

        //n ne fixe pas largeur ET hauteur, sinon l’image serait déformée.
        const scaledWidth = logoImage.width * scale;
        const scaledHeight = logoImage.height * scale;

        page.drawImage(logoImage, {
                                        x: width - scaledWidth - 500,
                                        y: height - scaledHeight - 10,
                                        width: scaledWidth,
                                        height: scaledHeight
                                    });
    }

    // 1️⃣ Titre principal
    page.drawText(`Facture N°: ${data.numero}`, {
                                                    x: 50,
                                                    y: height - 90,
                                                    size: 18,
                                                    font: font,
                                                    color: rgb(0, 0, 0)
                                                });

    // 2️⃣ Date du jour
    const today = new Date();
    const dateStr = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`;

    page.drawText(`Date du jour : ${dateStr}`, {
                                                    x: 350,
                                                    y: height -50,
                                                    size: 20,
                                                    font: font,
                                                    color: rgb(0.26, 0.26, 0.26)
                                                });

    // 3️⃣ Infos entreprise
    page.drawText(`Entreprise : ${data.client.nom}`, {
                                                    x: 50,
                                                    y: height - 110,
                                                    size: 12,
                                                    font: font,
                                                    color: rgb(0.26, 0.26, 0.26)
                                                });

    page.drawText(`Adresse : ${data.client.adresse}`, {
                                                    x: 50,
                                                    y: height - 125,
                                                    size: 12,
                                                    font: font,
                                                    color: rgb(0.26, 0.26, 0.26)
                                                });

    // 4️⃣ Ligne de séparation
    page.drawLine({
                    start: { x: 50, y: height - 150 },
                    end: { x: width - 50, y: height - 150 },
                    thickness: 1,
                    color: rgb(0.7, 0.7, 0.7)
                });
    // Ligne de séparation
    //page.moveTo(150, 150).lineTo(345, 150).stroke();
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
                                            try {
                                                    // 1️⃣ Créer un nouveau document PDF
                                                    const pdfDoc = await PDFDocument.create();

                                                    // 2️⃣ Ajouter une page
                                                    const page = pdfDoc.addPage();

                                                    // 3️⃣ Définir la taille de la page (A4)
                                                    const { width, height } = page.getSize();

                                                    // 4️⃣ Charger une police standard
                                                    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

                                                    // 5️⃣ Ajouter du texte
                                                
                                                    //Header
                                                   const logoPath = path.join(__dirname, "..", "public", "images", "logo.png");
                                                   createHeader(pdfDoc, page,facture, font, height, width, logoPath);

                                                    // 6️⃣ Dessiner un tableau vide pour les lignes de la facture
                                                    
                                                    table.drawTable(page, width, height, facture, font);
                                                    // 6️⃣ Générer le PDF en bytes
                                                    const pdfBytes = await pdfDoc.save();

                                                    // 7️⃣ Définir le chemin de sauvegarde
                                                    const pdfPath = path.join(__dirname, "..", "data", `${facture.numero}.pdf`);

                                                    // 8️⃣ Écrire le PDF sur le disque
                                                    fs.writeFileSync(pdfPath, pdfBytes);

                                                    // 9️⃣ Retourner le chemin du PDF
                                                    //return pdfPath;

                                                    // 9️⃣ 🔥 RETOURNER LES BYTES (PAS LE CHEMIN) pour afficher le pdf dans le navigateur
                                                    return pdfBytes;


                                                    } catch (error) {
                                                        console.error("❌ Erreur création PDF :", error);
                                                        throw error;
                                                    }
                                        }

/******************************************************************
 * EXPORTS
 ******************************************************************/
module.exports = {
    creerPdfSimple
};