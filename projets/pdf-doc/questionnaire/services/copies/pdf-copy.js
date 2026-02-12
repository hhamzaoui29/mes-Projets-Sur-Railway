const path = require("path");
const fs = require("fs");
const { PDFDocument, rgb, StandardFonts } = require("pdf-lib");



// ======================
// GÉNÉRER PDF POUR WEB
// ======================
async function createPdf(data) {
                                    const pdfDoc = await PDFDocument.create();
                                    const page = pdfDoc.addPage([595, 842]); // A4
                                    let y = 800;

                                    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
                                    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

                                    function drawText(text, fontUsed = font, size = 12) {
                                                                                            page.drawText(text, { x: 50, y, size, font: fontUsed });
                                                                                            y -= size + 10;
                                                                                        }

                                    drawText("QUESTIONNAIRE D’ENQUÊTE MÉTIER", fontBold, 16);
                                    drawText(`Nom : ${data.nom}`);
                                    drawText(`Poste : ${data.poste}`);
                                    drawText(`Entreprise : ${data.entreprise}`);
                                    drawText(`Date : ${data.date}`);
                                    y -= 20;

                                    data.questionnaire.forEach(item => {
                                                                            drawText(item.question, fontBold, 12);
                                                                            drawText(item.reponse, font, 12);
                                                                            y -= 10;
                                                                            if (y < 100) y = 800; // simple pagination pour l’instant
                                                                        });

                                    const pdfBytes = await pdfDoc.save();
                                    const filePath = path.join(__dirname, "../tmp", `questionnaire_${data.nom}.pdf`);
                                    fs.writeFileSync(filePath, pdfBytes);
                                    return filePath;
                                }

module.exports = {
                    createPdf
                 };
