// footer.js


/**
 * ======================================================
 * Gère tout ce qui concerne le footer
 * ======================================================
 */

const {drawMultilineText} = require('./texte');


/*------------------------------------------------------------------
// Footer
/*
* - (0,0) = bas gauche
 * - Y : augmente vers le haut
 * - Donc le bas de la page est proche de Y = 0
 *            - page   → pour dessiner
 *            - width  → pour centrer ou aligner
 *            - height → pour cohérence (même si on travaille en bas)
 *            - font   → pour le texte
 *------------------------------------------------------------------*/
async function createFooter(
                              page, 
                              data, 
                              width, 
                              height, 
                              font, 
                              pageNumber = null, 
                              totalPages = null
                              
                            ) {
                                const fontSize = 9;
                                const margin = 50;
                                const yPosition = 40;

                                // Ligne de séparation
                                page.drawLine({ 
                                                 start: { x: margin, y: yPosition + 10 }, 
                                                 end: { x: width - margin, y: yPosition + 10 }, 
                                                 thickness: 1 
                                             });

                                // Numéro de page si fourni
                                if (pageNumber !== null && totalPages !== null) {
                                    const pageText = `Page ${pageNumber} / ${totalPages}`;
                                
                                

                                // Texte centrée
                                    const adresse = "Adresse : " + data.entreprise.adresse + " - " 
                                                                 + data.entreprise.cp + " - " 
                                                                 + data.entreprise.ville + "\n";

                                    const coordonnee = "Coordonnée : " + data.entreprise.tel + " - "
                                                                       + data.entreprise.mail + "\n";

                                    const siret =  data.siret + "\n";
                    
                                    const footerText = adresse + coordonnee + siret + `${pageText}`; 
                                //const footerText = ` ${data.entreprise.adresse} - ${data.entreprise.cp} ${data.entreprise.ville} - ${data.entreprise.tel} - ${data.entreprise.mail} - ${data.siret} - ${pageText}`;

                                drawMultilineText({
                                                    page,
                                                    text: footerText,
                                                    x: margin,
                                                    y: yPosition - 5,
                                                    width: width - margin * 2,
                                                    font,
                                                    fontSize,
                                                    lineHeight: 11,
                                                    align: "center"
                                                });
                }

    
                            }
module.exports = { 
                   createFooter
                }