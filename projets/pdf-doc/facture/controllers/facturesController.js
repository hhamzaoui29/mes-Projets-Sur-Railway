/******************************************************************
 * IMPORT DU MODEL
 ******************************************************************/
const factureModel = require("../models/facturesModel");
const pdfService   = require("../services/pdfService");

/******************************************************************
 * CONTROLLER : afficher toutes les factures (test)
 ******************************************************************/
function afficherFactures(req, res) {
                                        const factures = factureModel.getAllFactures();

                                        // Pour l’instant, on teste avec du JSON
                                        res.json(factures);
                                    }

/******************************************************************
 * CONTROLLER : afficher la liste des factures
 ******************************************************************/
function afficherListeFactures(req, res) {
                                            // Récupération des factures via le Model
                                            const factures = factureModel.getAllFactures();

                                            // Envoi des données à la vue EJS
                                            res.render("factures/liste", {
                                                factures
                                            });
                                        }

/******************************************************************
 * CONTROLLER : afficher le détail d’une facture
 ******************************************************************/
function afficherDetailFacture(req, res) {
                                            // Récupération de l'id depuis l'URL
                                            const id = parseInt(req.params.id);

                                            // Appel au Model
                                            const facture = factureModel.getFactureById(id);

                                            // Si facture introuvable
                                            if (!facture) {
                                                return res.status(404).send("❌ Facture introuvable");
                                            }

                                            // Envoi à la vue
                                            res.render("factures/detail", {
                                                facture
                                            });
                                        }

async function teste(req, res) {
                                    const id = parseInt(req.params.id);
                                    const facture = factureModel.getFactureById(id);
                                    if (!facture) return res.status(404).send("Facture introuvable");

                                    try {
                                        const cheminPdf = await pdfService.creerPdfSimple(facture);
                                        res.download(cheminPdf); // télécharge le PDF
                                    } catch (error) {
                                        res.status(500).send("Erreur création PDF");
                                    }
                                };


/******************************************************************
 * CONTROLLER : visualiser PDF dans le navigateur
 ******************************************************************/
async function visualiserPdf(req, res) {




    const id = parseInt(req.params.id);
    const facture = factureModel.getFactureById(id);
    if (!facture) return res.status(404).send("Facture introuvable");

    try {
        // Générer PDF en mémoire
        const pdfBytes = await pdfService.creerPdfSimple(facture);
            //console.log("PDF bytes type:", typeof pdfBytes);
            //console.log("PDF bytes length:", pdfBytes?.length);
            
        // Envoyer au navigateur
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `inline; filename=${facture.numero}.pdf`);
        res.send(Buffer.from(pdfBytes));

    } catch (error) {
        res.status(500).send("Erreur génération PDF");
    }
}

/******************************************************************
 * EXPORTS
 ******************************************************************/
module.exports = {
                    afficherFactures,
                    afficherListeFactures,
                    afficherDetailFacture,
                    teste,
                    visualiserPdf
                };
