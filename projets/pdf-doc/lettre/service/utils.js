
const { rgb } = require("pdf-lib");
const path = require("path");
const fs = require("fs");



function drawJustifiedLine(page, text, x, y, font, fontSize, maxWidth) {

    const words = text.trim().split(/\s+/);

    // Si un seul mot → alignement gauche
    if (words.length <= 1) {
        page.drawText(text, { x, y, size: fontSize, font });
        return;
    }

    // Largeur réelle d’un espace dans la police
    const spaceWidth = font.widthOfTextAtSize(" ", fontSize);

    // Largeur totale des mots
    const wordsWidth = words.reduce((total, word) => {
        return total + font.widthOfTextAtSize(word, fontSize);
    }, 0);

    // Largeur des espaces "normaux"
    const totalDefaultSpaceWidth = spaceWidth * (words.length - 1);

    // Espace supplémentaire à répartir
    const totalExtraSpace = maxWidth - (wordsWidth + totalDefaultSpaceWidth);

    const extraSpacePerGap = totalExtraSpace / (words.length - 1);

    let currentX = x;

    for (let i = 0; i < words.length; i++) {

        const word = words[i];

        page.drawText(word, {
            x: currentX,
            y,
            size: fontSize,
            font,
        });

        currentX += font.widthOfTextAtSize(word, fontSize);

        if (i < words.length - 1) {
            currentX += spaceWidth + extraSpacePerGap;
        }
    }
}


function drawJustifiedLine1(page, text, x, y, font, fontSize, maxWidth) {

    const words = text.trim().split(/\s+/);

    // Si un seul mot → alignement gauche
    if (words.length <= 1) {
        page.drawText(text, { x, y, size: fontSize, font });
        return;
    }

    // Largeur totale des mots sans espaces
    const wordsWidth = words.reduce((total, word) => {
        return total + font.widthOfTextAtSize(word, fontSize);
    }, 0);

    const totalSpaceWidth = maxWidth - wordsWidth;
    const spaceCount = words.length - 1;
    const spaceWidth = totalSpaceWidth / spaceCount;

    let currentX = x;

    for (let i = 0; i < words.length; i++) {

        const word = words[i];

        page.drawText(word, {
                                x: currentX,
                                y,
                                size: fontSize,
                                font,
                            });

        currentX += font.widthOfTextAtSize(word, fontSize);

        if (i < words.length - 1) {
            currentX += spaceWidth;
        }
    }
}
/*--------------------------------*/
function wrapText(text, font, fontSize, maxWidth) {

    const words = text.trim().split(/\s+/); // découpe propre (espaces multiples gérés)
    const lines = [];
    let currentLine = "";

    for (let word of words) {

        // on construit la ligne proprement (sans espace inutile à la fin)
        const testLine = currentLine 
            ? currentLine + " " + word 
            : word;

        const textWidth = font.widthOfTextAtSize(testLine, fontSize);

        if (textWidth > maxWidth - 0.5) {

            // si la ligne actuelle existe, on la valide
            if (currentLine) {
                lines.push(currentLine);
            }

            // le mot devient le début de la nouvelle ligne
            currentLine = word;

        } else {
            currentLine = testLine;
        }
    }

    // dernière ligne
    if (currentLine) {
        lines.push(currentLine);
    }

    return lines;
}
function wrapText1(text, font, fontSize, maxWidth) {

                    const words = text.split(" "); // découpe mot par mot
                    const lines = [];
                    let currentLine = "";

                    for (let word of words) {
                                                const testLine = currentLine + word + " ";
                                                const textWidth = font.widthOfTextAtSize(testLine, fontSize);

                                                // si la ligne dépasse la largeur max
                                                if (textWidth > maxWidth) {
                                                                                lines.push(currentLine); // on valide la ligne
                                                                                currentLine = word + " "; // nouvelle ligne
                                                                            } else {
                                                                                    currentLine = testLine;
                                                                                }
                                            }

                    // Dernière ligne
                    if (currentLine) {
                                      lines.push(currentLine.trim());
                                    }
                    return lines;
                }

 // Fonction pour charger les polices depuis le dossier public/fonts et les intégrer dans le PDF en utilisant fontkit        
// Définir toutes les variantes de Poppins
const fontFiles = {
                    regular:    "Poppins-Regular.ttf",
                    bold:       "Poppins-Bold.ttf",
                    xBold:      "Poppins-ExtraBold.ttf",
                    italic:     "Poppins-Italic.ttf",
                    boldItalic: "Poppins-BoldItalic.ttf",
                    light:      "Poppins-Light.ttf",
                    medium:     "Poppins-Medium.ttf"
                 };

// Fonction pour charger toutes les fonts dans un PDF
async function loadFonts(pdfDoc) {
                                    const fonts = {};

                                    for (const [key, fileName] of Object.entries(fontFiles)) {
                                        // 🔹 Chemin corrigé : remonter d'un dossier pour atteindre /public/fonts
                                        //".." pour remonter d'un niveau depuis "service" vers "pdf-doc", puis "public/fonts" pour atteindre les polices
                                        const fontPath = path.join(__dirname, "..", "public", "fonts", fileName);// 

                                        // 🔹 Lire le fichier TTF
                                        const fontBytes = fs.readFileSync(fontPath);

                                        // 🔹 Embed dans pdf-lib
                                        fonts[key] = await pdfDoc.embedFont(fontBytes);
                                    }

                                    return fonts;
                                }
/**
 * Dessine un rectangle arrondi avec ombre
 * @param {PDFPage} page - La page PDF où dessiner
 * @param {Object} options - Configuration du rectangle
 *  options = {
 *    x, y, width, height, radius, 
 *    color: {r, g, b}, opacity,
 *    shadowOffset, shadowColor, shadowOpacity
 *  }
 */
/**
 * Dessine un rectangle arrondi avec ombre de manière sûre
 * @param {PDFPage} page - La page PDF où dessiner
 * @param {Object} options - Configuration du rectangle
 */
function drawRoundedRectangleWithShadow(page, options = {}) {
    // Valeurs par défaut
    const margin = options.margin ?? 10;

    const rectX = typeof options.x === 'number' ? options.x : margin;
    const rectY = typeof options.y === 'number' ? options.y : 500; // valeur par défaut si pas fournie
    const rectWidth = typeof options.width === 'number' ? options.width : 200;
    const rectHeight = typeof options.height === 'number' ? options.height : 100;
    const radius = typeof options.radius === 'number' ? options.radius : 10;

    const color = options.color ?? { r: 0, g: 0, b: 0.8 };
    const opacity = typeof options.opacity === 'number' ? options.opacity : 0.8;

    const shadowOffset = typeof options.shadowOffset === 'number' ? options.shadowOffset : 5;
    const shadowColor = options.shadowColor ?? { r: 0, g: 0, b: 0 };
    const shadowOpacity = typeof options.shadowOpacity === 'number' ? options.shadowOpacity : 0.3;

    // Vérifie que tout est un nombre
    if ([rectX, rectY, rectWidth, rectHeight, radius, opacity, shadowOffset, shadowOpacity]
        .some(val => typeof val !== 'number' || isNaN(val))) {
        throw new Error('drawRoundedRectangleWithShadow : une valeur numérique est invalide');
    }

    // Chemin SVG du rectangle arrondi
    const path = `
    M ${rectX + radius} ${rectY}
    H ${rectX + rectWidth - radius}
    A ${radius} ${radius} 0 0 1 ${rectX + rectWidth} ${rectY + radius}
    V ${rectY + rectHeight - radius}
    A ${radius} ${radius} 0 0 1 ${rectX + rectWidth - radius} ${rectY + rectHeight}
    H ${rectX + radius}
    A ${radius} ${radius} 0 0 1 ${rectX} ${rectY + rectHeight - radius}
    V ${rectY + radius}
    A ${radius} ${radius} 0 0 1 ${rectX + radius} ${rectY}
    Z
    `;

    // 🔹 Ombre
    page.drawSvgPath(path, {
        color: rgb(shadowColor.r, shadowColor.g, shadowColor.b),
        opacity: shadowOpacity,
        translate: { x: shadowOffset, y: shadowOffset }
    });

    // 🔵 Rectangle principal
    page.drawSvgPath(path, {
        color: rgb(color.r, color.g, color.b),
        opacity: opacity
    });
}

const iconsFile = {
                    maison:    "maison.png",
                    tel:       "tel.png",
                    mail:      "mail.png"
                 };
                    

// Fonction pour charger toutes les fonts dans un PDF
async function loadIcons(pdfDoc) {
                                    const icons = {};

                                    for (const [key, fileName] of Object.entries(iconsFile)) {
                                        // 🔹 Chemin corrigé : remonter d'un dossier pour atteindre /public/fonts
                                        //".." pour remonter d'un niveau depuis "service" vers "pdf-doc", puis "public/fonts" pour atteindre les polices
                                        const iconPath = path.join(__dirname, "..", "public", "icons", fileName);// 

                                        // 🔹 Lire le fichier TTF
                                        const iconBytes = fs.readFileSync(iconPath);

                                        // 🔹 Embed dans pdf-lib
                                        icons[key] = await pdfDoc.embedPng(iconBytes);
                                    }

                                    return icons;
                                }
module.exports = { 
                    drawJustifiedLine, 
                    wrapText, 
                    loadFonts,
                    drawRoundedRectangleWithShadow,
                    loadIcons
                 
                };







