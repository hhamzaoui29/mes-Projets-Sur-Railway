/******************************************************************
 * IMPORTS
 ******************************************************************/
const { PDFDocument, StandardFonts, rgb } = require("pdf-lib");
const fs = require("fs");
const path = require("path");

const {drawTable} = require("./table");
const {formatEuro} = require('./fonctionUtils');
const {createInvoiceInfoBlock} = require('./infoClient');




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
async function createHeader(pdfDoc, page, data, font, width, logoPath) {
    let xInitial = 50;      // marge gauche initiale
    let yInitial = 50;        // marge du haut initiale (on va descendre en ajoutant)

    // Hauteur de la page
    const pageHeight = page.getHeight();  

    // 1️⃣ Logo en haut à droite si fourni
    if (logoPath && fs.existsSync(logoPath)) {
                                                const logoBytes = fs.readFileSync(logoPath);
                                                const logoImage = await pdfDoc.embedPng(logoBytes); // utiliser embedJpg si JPG

                                                const maxWidth = 150; 
                                                const scale = maxWidth / logoImage.width;
                                                const scaledWidth = logoImage.width * scale;
                                                const scaledHeight = logoImage.height * scale;

                                                page.drawImage(logoImage, {
                                                                            x: width - scaledWidth - 400,                 // marge droite
                                                                            y: pageHeight - scaledHeight - 30,          // marge haut
                                                                            width: scaledWidth,
                                                                            height: scaledHeight
                                                                        });
                                            }
    
    // 2️⃣ Titre principal 

    // 4️⃣ Infos entreprise
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
     yInitial += 40;
    page.drawText(` ${data.entreprise.nom}`, {
        x: xInitial + 260,
        y: pageHeight - yInitial,
        size: 25,
        font: boldFont,
        color: rgb(0.26, 0.26, 0.26)
    });
    
    yInitial += 20;  


    page.drawText(`${data.entreprise.adresse}`, {
        x: xInitial + 340,
        y: pageHeight - yInitial,
        size: 15,
        font: font,
        color: rgb(0.26, 0.26, 0.26)
    });
     
    yInitial +=20;
    page.drawText(`${data.entreprise.cp} ${data.entreprise.ville}`,{
        x: xInitial + 340,
        y: pageHeight - yInitial,
        size: 15,
        font: font,
        color: rgb(0.26, 0.26, 0.26)
    });

    yInitial += 100;
    page.drawText(`Tél : ${data.entreprise.tel}`,{
        x: xInitial + 80,
        y: pageHeight - yInitial,
        size: 15,
        font: font,
        color: rgb(0.26, 0.26, 0.26)
    });

    page.drawText(`E-mail : ${data.entreprise.mail}`,{
        x: xInitial + 240,
        y: pageHeight - yInitial,
        size: 15,
        font: font,
        color: rgb(0.26, 0.26, 0.26)
    });

    


    // 5️⃣ Ligne de séparation         
    yInitial += 20;

    page.drawLine({
        start: { x: xInitial, y: pageHeight - yInitial },
        end: { x: width - xInitial, y: pageHeight - yInitial },
        thickness: 1,
        color: rgb(0.7, 0.7, 0.7)
    });
    
    const yFinal = pageHeight - yInitial;
    return yFinal;
    // ✅ Avec ce système, tu modifies seulement xInitial ou yInitial au début
    // et tu gères facilement le positionnement vertical en ajoutant des valeurs.
}

/******** 
* - x = position horizontale (gauche)
* - y = position verticale (haut du bloc)
* - largeur = largeur disponible
* - infos = tableau d’infos
* - font = police
*/
function drawAdditionalInfo(page, x, y, largeur, infos, font) {
    const fontSize = 10;
    let currentY = y;

    infos.forEach(info => {
        page.drawText(info, {
                                    x,
                                    y: currentY,
                                    size: fontSize,
                                    font
                                });
                                currentY -= 14; // descente ligne
                            });

    return currentY;
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
                                                    // 👇 Police en gras
                                                    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

                                                    // 5️⃣ Ajouter du texte
                                                
                                                    //Header
                                                   const logoPath = path.join(__dirname, "..", "public", "images", "logo.png");
                                                   const yAfterHeader = await createHeader(pdfDoc, page,facture, font, width, logoPath);

                                                   //invoiceInfoBloc
                                                   const yAfterInvoiceBlock =  await createInvoiceInfoBlock(
                                                                                                                page,
                                                                                                                facture,
                                                                                                                yAfterHeader,
                                                                                                                font,
                                                                                                                boldFont
                                                                                                            );

                                                   
                                                   // 6️⃣ Dessiner un tableau vide pour les lignes de la facture
                                                   // utiliser yAfterHeader pour le tableau
                                                   const yTable = yAfterInvoiceBlock - 20; // marge de sécurité
                                                    const yAfterTable  = drawTable(page, width, yTable, facture, font);

                                                    //LES INFOS
                                                    const xTable = 50;
                                                    const largeurTable = width - 100;
                                                    const additionalInfos = [ facture.infos.conditions];

                                                    const yAfterFooter = drawAdditionalInfo(page, xTable, yAfterTable - 20, largeurTable, additionalInfos, font);


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