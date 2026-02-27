const { rgb } = require("pdf-lib");


async function drawHeader(pdfDoc, page, data, fonts, icons, layout) {

    const { regular, bold, italic, boldItalic, xBold } = fonts;
    const { margin, marginLeft, marginRight, lineHeight, fontSize, topMargin } = layout;
    const {maison, tel, mail} = icons ;

    const pageWidth = page.getWidth();
    const pageHeight = page.getHeight();
    const headerHeight = 160 ;

  

    // ===============================
    // 1️⃣ DÉGRADÉ PREMIUM (simulation)
    // ===============================
    // ===============================
    // 🇫🇷 FOND TRICOLORE
    // ===============================


    const bandHeight = headerHeight / 3;
    const rectHeight = bandHeight + 10 ; // si tu veux que le rectangle ait une hauteur spécifique   
    const rectWidth = pageWidth - 2 * margin;
    const rectX = margin - 5;
    const rectY = pageHeight - margin - rectHeight;

    // rectangle ombre
    const shadowOffset = 5; // décalage de l'ombre
    const shadowOpacity = 0.8; // opacité de l'ombre
    

    // 🔵 Bleu
    page.drawRectangle({
                            x: rectX + shadowOffset,
                            y: rectY + shadowOffset ,
                            width: rectWidth,
                            height: rectHeight,    
                            color: rgb(0.4,0.7,1),
                            opacity: shadowOpacity,
                        });
                    


    

    /// ==============================
    // 🖊 Texte dans le header
    // ==============================

    let currentY = pageHeight - topMargin; // point de départ vertical

    // Nom complet à gauche
    const fullName = `${data.prenom || ""} ${data.nom || ""}`;
    page.drawText(fullName, {
                                x: marginLeft + 150,
                                y: currentY,
                                size: 25,
                                font: xBold,
                                color: rgb(1,1,1) // texte blanc pour contraster avec le bandeau
                            });

    currentY -= lineHeight + 50;

    // Adresse à droite
    
     // Dimensions icônes
    const iconSize = 12;
    const iconGap = 5;

    const adresseText = ` ${data.adresse || ""}`;
    const adresseWidth = regular.widthOfTextAtSize(adresseText, fontSize);

    // Position du texte aligné à droite
    const textAdresse = pageWidth - marginRight - adresseWidth -25; // 26px de marge supplémentaire pour le texte

    // Position de l'icône juste avant le texte
    const iconAdresse = textAdresse - iconSize - iconGap  ; // 25px de marge supplémentaire pour l'icône



    page.drawImage(maison, {
                                    x: iconAdresse,
                                    y: currentY  ,
                                    width: iconSize,
                                    height: iconSize
                                });

  

    page.drawText(adresseText, {
                                    x: textAdresse ,
                                    y: currentY,
                                    size: fontSize,
                                    font: regular,
                                    color: rgb(0,0,0) // texte blanc pour contraster avec le bandeau
                                });

    currentY -= lineHeight;

    // CP + Ville à droite
    const cpVilleText = `${data.cp || ""} ${data.ville || ""}`;
    const cpVilleWidth = regular.widthOfTextAtSize(cpVilleText, fontSize);

    page.drawText(cpVilleText, {
                                    x: pageWidth - marginRight - cpVilleWidth - 25,
                                    y: currentY,
                                    size: fontSize,
                                    font: regular,
                                    color: rgb(0,0,0) // texte blanc pour contraster avec le bandeau
                                });

    // Téléphone avec icône
    currentY -= lineHeight;
    const telText = ` ${data.tel || "" }`;
    const telWidth = regular.widthOfTextAtSize(telText, fontSize);

    // Position du texte aligné à droite
    const textTel = pageWidth - marginRight - telWidth -70; // 70px de marge supplémentaire pour le texte

    // Position de l'icône juste avant le texte
    const iconTel = textTel - iconSize - iconGap ; // 25px de marge supplémentaire pour l'icône


    page.drawImage(tel, {
                            x: iconTel,
                            y: currentY  ,
                            width: iconSize,
                            height: iconSize
                        });

    page.drawText(telText, {
                                x: textTel ,
                                y: currentY,
                                size: fontSize,
                                font: regular,
                                color: rgb(0,0,0)
                            });
    
    // Mail avec icône
    
    currentY -= lineHeight;
    const mailText = ` ${data.mail || ""  }`;
    const mailWidth = regular.widthOfTextAtSize(mailText, fontSize);

    // Position du texte aligné à droite
    const textMail = pageWidth - marginRight - mailWidth ; 

    // Position de l'icône juste avant le texte
    const iconMail = textMail - iconSize - iconGap ; // 25px de marge supplémentaire pour l'icône

    page.drawImage(mail, {
                            x: iconMail,
                            y: currentY  ,
                            width: iconSize,
                            height: iconSize
                        });

    page.drawText(mailText, {
                                x: textMail,
                                y: currentY,
                                size: fontSize,
                                font: regular,
                                color: rgb(0,0,0)
                            });

    // Société à gauche sur la même ligne que mail
      currentY -= lineHeight - 50;
    const societeText = data.societe || "";
    page.drawText(societeText, {
                                    x: marginLeft,
                                    y: currentY,
                                    size: fontSize,
                                    font: xBold,
                                    color: rgb(0,0,0)
                                });

    // Adresse Société à gauche
    currentY -= lineHeight; // descendre avant l'adresse de la société
    const adresseSocieteText = data.addr || "";
    page.drawText(adresseSocieteText, {
                                            x: marginLeft,
                                            y: currentY,
                                            size: fontSize,
                                            font: regular,
                                            color: rgb(0,0,0)
                                        });


    // CP + Ville Société à gauche
    currentY -= lineHeight; // descendre avant le CP + Ville de la société
    const cpVilleSocieteText = `${data.cp_s || ""} ${data.ville_s || ""}`;
    page.drawText(cpVilleSocieteText, {
                                            x: marginLeft,
                                            y: currentY,
                                            size: fontSize,
                                            font: regular,
                                            color: rgb(0,0,0)
                                        });

      /* ================================
       DATE (alignée droite)
     ================================= */
    currentY -= lineHeight +20;
    const today = new Date();
    const dateStr = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`;
    const dateText = `À ${data.ville}, Le ${dateStr}`;
    const dateWidth = italic.widthOfTextAtSize(dateText, fontSize);
    page.drawText(dateText, {
                                x: pageWidth - (marginRight +320) - dateWidth,
                                y: currentY,
                                size: fontSize,
                                font: italic,
                                color: rgb(0,0,0)
                            });

    page.drawLine({
                            start: { x: margin , y: rectY - 10 },
                            end: { x: pageWidth - margin, y: rectY - 10 },
                            thickness: 1,
                            color: rgb(0, 0, 0),// ligne noire pour séparer le header du body
                        });
    // Espace avant le body
    currentY -= 2 * lineHeight;

    // 🔁 Retour de la position verticale
    return currentY ; // ajustement pour laisser un espace avant le body
}

module.exports = { drawHeader };