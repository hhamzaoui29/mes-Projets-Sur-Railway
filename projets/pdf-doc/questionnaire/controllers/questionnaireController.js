// ================================================================================================
//                                      questionnaireController.js
// ==============================================================================================

// ======================
// 1️⃣ IMPORTS
// ======================

const documentsService = require("../services/documentsService");
const {createPdf } = require("../services/pdf");
const {createWord} = require("../services/word");

// =======================================================================
//              LA VARIABLES GLOBALES
//              Récupérer les questions depuis le JSON
// =======================================================================

const questions = documentsService.getQuestions();

// =======================================================================
//                          2️⃣ FONCTIONS DE CONTROLEUR
// =======================================================================   


//==============================================================================
//                  Affiche la page d’accueil avec le formulaire
// ===============================================================================

const renderHomePage = (req, res) => {
                                        res.render("questionnaire/index");
                                     };

// Affiche la page du questionnaire
const renderQuestionnairePage = (req, res) => {
                                                //données envoyer par le formulaire
                                                const formData = req.body;
                                                res.render("questionnaire/questionnaire", {
                                                                                formData, 
                                                                                questions
                                                                            });
                                              }

//==============================================================================
//        Traitement des réponses du questionnaire (temporaire)
//==============================================================================

const submitQuestionnaire = (req, res) => {

                                            const formData = req.body;
                                            let questionnaire = [];
                                            let index = 0;
                                            //Recréer le lien Section -> Question -> Réponse
                                            for (const [section, questionsList] of Object.entries(questions)) {
                                                for (const question of questionsList) {
                                                    questionnaire.push({
                                                        section,
                                                        question,
                                                        reponse: formData.reponses[index] || "Pas de réponse"
                                                    });
                                                    index++;
                                                }
                                            }

                                            // Sauvegarde du questionnaire en JSON
                                            const dataToSave = {
                                                                    formData,
                                                                    questionnaire
                                                                }

                                            documentsService.saveQuestionnaireJson(dataToSave); 

                                            //page de confirmation temporaire
                                            res.render("questionnaire/result", {
                                                                                        formData, 
                                                                                        questionnaire
                                                                                    })
                                          };

// ===============================================================================
//                              TÉLÉCHARGEMENT PDF / WORD
// ===============================================================================
async function downloadDocument(req, res) {
                                            const { format, nom, poste, entreprise, date, questionnaire } = req.body;

                                            const data = { nom, poste, entreprise, date, questionnaire };

                                            try {
                                                let filePath;
                                                if (format === "pdf") {
                                                    filePath = await createPdf(data);
                                                } else if (format === "word") {
                                                    filePath = await createWord(data);
                                                } else {
                                                    return res.status(400).send("Format invalide");
                                                }

                                                res.download(filePath, err => {
                                                                                if (err) console.error(err);
                                                                                // Optionnel : supprimer le fichier après téléchargement
                                                                                // fs.unlinkSync(filePath);
                                                                              });
                                            } catch (err) {
                                                            console.error(err);
                                                            res.status(500).send("Erreur lors de la génération du document");
                                                          }
                                          }
// =======================================================================
//                          3️⃣ EXPORT DES FONCTIONS
// =======================================================================

module.exports = {
                    renderHomePage,
                    renderQuestionnairePage,
                    submitQuestionnaire,
                    downloadDocument

                 };
