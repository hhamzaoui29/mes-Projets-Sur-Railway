const path = require("path");
const fs = require("fs");
const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType } = require("docx");


// ======================
// GÉNÉRER WORD POUR WEB
// ======================
async function createWord(data) {
    const doc = new Document({
        sections: [{
            properties: {},
            children: [
                new Paragraph({ children: [new TextRun(`QUESTIONNAIRE D’ENQUÊTE MÉTIER`)], heading: "Heading1", spacing: { after: 300 } }),
                new Paragraph({ children: [new TextRun(`Nom : ${data.nom}`)], spacing: { after: 200 } }),
                new Paragraph({ children: [new TextRun(`Poste : ${data.poste}`)], spacing: { after: 200 } }),
                new Paragraph({ children: [new TextRun(`Entreprise : ${data.entreprise}`)], spacing: { after: 200 } }),
                new Paragraph({ children: [new TextRun(`Date : ${data.date}`)], spacing: { after: 200 } }),
                ...data.questionnaire.map(item => new Paragraph({ children: [new TextRun(`${item.question}\n${item.reponse}`)], spacing: { after: 200 } }))
            ]
        }]
    });

    const buffer = await Packer.toBuffer(doc);
    const filePath = path.join(__dirname, "../tmp", `questionnaire_${data.nom}.docx`);
    fs.writeFileSync(filePath, buffer);
    return filePath;
}


module.exports = {
                    createWord,

                };
