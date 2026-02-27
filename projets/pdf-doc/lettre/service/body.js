
const { StandardFonts, rgb } = require("pdf-lib");
const { drawJustifiedLine, wrapText } = require('./utils');

function drawBody(pdfDoc, page, data, fonts, layout, startY) {

    const { regular, bold, italic, boldItalic } = fonts;
    const { marginLeft, marginRight, bottomMargin, topMargin, lineHeight } = layout;

    const fontSize = 10;
    const maxWidth = page.getWidth() - marginLeft - marginRight;
   
    /* ================================
    OBJET
    ================================= */
    let currentY = startY;

    const objetLabel = "OBJET: ";

    page.drawText(objetLabel, {
                                x: marginLeft,
                                y: currentY,
                                size: fontSize ,
                                font: bold,
                                color: rgb(0.4,0.7,1), // bleu clair pour différencier le label de l'objet
                            });

    const labelWidth = bold.widthOfTextAtSize(objetLabel, fontSize);

    page.drawText(data.objet, {
                                x: marginLeft + labelWidth,
                                y: currentY,
                                size: fontSize,
                                font: boldItalic,
                            });

    // Saut de ligne après l'objet
    currentY -= lineHeight + 50;
    // ================================
    // CONTENU
    // ================================
    const texte = `Madame, Monsieur.\n\n${data.contenu}`;

    // 1️⃣ Normaliser les retours Windows
    let cleanText = texte.replace(/\r\n/g, '\n');

    // 2️⃣ Remplacer les retours simples par des espaces
    cleanText = cleanText.replace(/(?<!\n)\n(?!\n)/g, ' ');

    // 3️⃣ Séparer uniquement les vrais paragraphes (double retour)
    const paragraphs = cleanText.split('\n\n');

    for (let paragraph of paragraphs) {

        if (paragraph.trim() === '') {
                                        currentY -= lineHeight;
                                        continue;
                                    }

        const lines = wrapText(paragraph, regular, fontSize, maxWidth);

        for (let i = 0; i < lines.length; i++) {

            if (currentY - lineHeight < bottomMargin) {
                                                        page = pdfDoc.addPage();
                                                        currentY = page.getHeight() - topMargin;
                                                    }

            const line = lines[i];

            if (i === lines.length - 1) {
                                        page.drawText(line, {
                                                                x: marginLeft,
                                                                y: currentY,
                                                                size: fontSize,

                                                                font: regular,
                                                            });
            } else {
                    drawJustifiedLine(
                                        page,
                                        line,
                                        marginLeft,
                                        currentY,
                                        regular,   
                                        fontSize,
                                        maxWidth
                                    );
            }

            currentY -= lineHeight;
        }

        currentY -= lineHeight / 2;
        //console.log(JSON.stringify(data.contenu));
    }

    return { page, currentY };

    
}
module.exports = { drawBody };