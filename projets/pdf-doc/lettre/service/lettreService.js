const { PDFDocument, rgb } = require("pdf-lib");
const fontkit = require("@pdf-lib/fontkit");
const { drawHeader } = require('./header');
const { drawBody } = require('./body');
const { drawFooter } = require('./footer');
const { loadFonts } = require('./utils'); // import propre
const {loadIcons} = require('./utils'); // import propre  loadIcons

const dataModel = require("../models/lettreModel");



const generatePDF = async (req, res) => {
    try {

        // ======================
        // 1️⃣ Récupérer l'ID depuis l'URL
        // ======================
        const id = req.params.id;

        // ======================
        // 2️⃣ Charger la lettre depuis le JSON
        // ======================
        const data = dataModel.getLetterById(id);

        // Si aucune lettre trouvée → erreur 404
        if (!data) {
            return res.status(404).send("Lettre introuvable");
        }

        // ======================
        // 3️⃣ Créer le document PDF
        // ======================
        const pdfDoc = await PDFDocument.create();

        // Enregistrer fontkit
        pdfDoc.registerFontkit(fontkit);

        // Charger les polices
        const fonts = await loadFonts(pdfDoc);

        // Charger les icônes
        const icons = await loadIcons(pdfDoc);

        // ======================
        // 4️⃣ Créer la première page
        // ======================
        let page = pdfDoc.addPage();
        const pageWidth = page.getWidth();

        const marginLeft  = 50;
        const marginRight = 50;
        const margin = 10;

        const layout = {     
            margin,
            marginLeft,
            marginRight,
            topMargin : 50,
            bottomMargin : 50,
            fontSize : 12,
            lineHeight : 18,
            maxWidth : pageWidth - marginLeft - marginRight,
        };

        // ======================
        // HEADER
        // ======================
        let currentY = await drawHeader(pdfDoc, page, data, fonts, icons, layout);

        // ======================
        // BODY
        // ======================
        const bodyResult = drawBody(pdfDoc, page, data, fonts, layout, currentY);
        page = bodyResult.page;
        currentY = bodyResult.currentY;

        // ======================
        // FOOTER
        // ======================
        drawFooter(page, data, fonts, layout, currentY);

        // ======================
        // 5️⃣ Génération finale
        // ======================
        const pdfBytes = await pdfDoc.save();

        // ======================
        // 6️⃣ Headers HTTP
        // ======================
        res.setHeader("Content-Type", "application/pdf");

        // 🔥 On ajoute l'id dans le nom du fichier
        res.setHeader(
            "Content-Disposition",
            `attachment; filename=lettre-${id}.pdf`
        );

        res.send(pdfBytes);

    } catch (error) {
        console.error("Erreur génération PDF :", error);
        res.status(500).send("Erreur serveur");
    }
};
/** Service pour générer un PDF à partir des données d'une lettre */
const generatePDF1 = async (req, res) => {
    const data = req.body;

    // 1️⃣ Créer PDF
    const pdfDoc = await PDFDocument.create();

    // 2️⃣ Enregistrer fontkit
    pdfDoc.registerFontkit(fontkit);

    // 3️⃣ Charger toutes les fonts
    const fonts = await loadFonts(pdfDoc);
    console.log("Fonts chargées :", Object.keys(fonts));

    const icons = await loadIcons(pdfDoc); // Charger les icônes et les ajouter à l'objet fonts
    console.log("Icônes chargées :", Object.keys(icons));

    // 4️⃣ Créer une page
    let page = pdfDoc.addPage();
    const pageWidth = page.getWidth();
    const marginLeft  = 50;
    const marginRight = 50;
     const margin = 10;

    const layout = {     
                        margin,          
                        marginLeft,
                        marginRight,
                        topMargin : 50,
                        bottomMargin : 50,
                        fontSize : 12,
                        lineHeight : 18,
                        maxWidth : pageWidth - marginLeft - marginRight,
                    };

    // ======================
    // HEADER
    // ======================
    let currentY = await drawHeader(pdfDoc, page, data, fonts, icons, layout);

    // ======================
    // BODY
    // ======================
    const bodyResult = drawBody(pdfDoc, page, data, fonts, layout, currentY);
    page = bodyResult.page;
    currentY = bodyResult.currentY;

    // ======================
    // FOOTER
    // ======================
    drawFooter(page, data, fonts, layout, currentY);

    // ======================
    // Générer le PDF
    // ======================
    const pdfBytes = await pdfDoc.save();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=lettre.pdf");
    res.send(pdfBytes);
};



module.exports = { 
                    generatePDF, 
                
                    
                  };