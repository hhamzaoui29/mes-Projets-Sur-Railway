
const { save } = require("pdfkit");

const dataModel = require("../models/lettreModel");



const renderHomePage = (req, res) => {
                                        // Récupérer les données de toutes les lettres
                                       const letters = dataModel.getAllLetters();
                                       console.log("Letters envoyées à la vue :", letters);

                                        res.render("lettre/index", { 
                                                                      letters,
                                                                   });
                                     };



/** ====================================== **/
const renderShowLetter = (req, res) => {
                                        const letterId = req.params.id;
                                        console.log("ID de la lettre demandée :", letterId);

                                        // Récupérer les données de la lettre par ID
                                        const letter = dataModel.getLetterById(letterId);
                                        console.log("Données de la lettre trouvée :", letter);

                                        if (!letter) {
                                                        res.status(404).render("lettre/formShow");
                                               
                                                      } else {
                                                               res.render("lettre/formShow", { 
                                                                                                 letter 
                                                                                               }); 
                                                            }
                                    };

/** ====================================== **/
const formCreateLetter = (req, res) => {
                                          try {

                                                res.render("lettre/formCreate");
                                             
                                             } catch (error) {
                                                console.log ("votre erreur == ", error);
                                             }
                                       };

/** ====================================== **/
const renderCreateLetter = async (req, res) => {
                                                try {
                                                         // 1️⃣ Récupérer les données du formulaire
                                                         const formData = req.body;

                                                         // 2️⃣ Sauvegarder via le model
                                                         const savedLetter = dataModel.saveLetter(formData);
                                                         console.log("Données de la lettre sauvegardées :", savedLetter);

                                                         if (!savedLetter) return res.status(500).send("Erreur lors de la sauvegarde");

                                                         // 3️⃣ Répondre au client que la lettre a été créée avec succès  
                                                        // res.json({ message: "Données de la lettre reçues et sauvegardées avec succès !" });

                                                         // 3️⃣ Redirection vers la page détail
                                                         res.redirect("/l/" + savedLetter.id); 
                                                         
                                                      } catch (error) {
                                                                        console.log("Erreur lors de la sauvegarde de la lettre :", error);
                                                                     }
                                             };
                                             
/** ====================================== **/
const formUpdateLetter = async (req, res) => {
                                                try {
                                                         const letterId = req.params.id;
                                                         console.log("ID de la lettre à mettre à jour :", letterId);

                                                         // Récupérer les données mises à jour du formulaire
                                                         const  data = dataModel.getLetterById(letterId);
                                                         console.log("Données de la lettre trouvée pour mise à jour :", data);

                                                         if (!data) {
                                                                        res.status(404).render("lettre/notFound");
                                                                      } else {
                                                                                       res.render("lettre/formUpdate", { 
                                                                                                                         letter: data 
                                                                                                                       }); 
                                                                                    }
                                                      } catch (error) {
                                                                        console.error("Erreur lors de l'affichage du formulaire de mise à jour :", error);
                                                                        res.status(500).send("Erreur lors de l'affichage du formulaire de mise à jour");
                                                                     }
                                                };
                               
/** ====================================== **/
const renderUpdateLetter = async (req, res) => {
                                                try {
                                                         const letterId = req.params.id;
                                                         console.log("ID de la lettre à mettre à jour :", letterId);

                                                         // Récupérer les données mises à jour du formulaire
                                                         const updatedData = req.body;
                                                         console.log("Données mises à jour reçues :", updatedData);

                                                         // Mettre à jour la lettre avec l'ID spécifié
                                                         dataModel.updateLetter(letterId, updatedData);        
                                                         console.log("Lettres après mise à jour :", letterId);

                                                         // Rediriger vers la page d'accueil des lettres après la mise à jour
                                                         res.redirect("/l"); // Rediriger vers la page d'accueil des lettres après la mise à jour

                                                      } catch (error) {
                                                                        console.error("Erreur lors de la mise à jour de la lettre :", error);
                                                                        res.status(500).send("Erreur lors de la mise à jour de la lettre");
                                                                     }
                                                };

/** ====================================== **/
const deleteLetter = async (req, res) => {
                                try {
                                        const letterId = req.params.id;
                                        console.log("ID de la lettre à supprimer :", letterId);

                                      
                                        
                                        // Supprimer la lettre avec l'ID spécifié
                                        dataModel.deleteLetter(letterId);        
                                        console.log("Lettres après suppression :", letterId);

                                        res.redirect("/l"); // Rediriger vers la page d'accueil des lettres après la suppression


                                    } catch (error) {
                                                        console.error("Erreur lors de la suppression de la lettre :", error);
                                                        res.status(500).send("Erreur lors de la suppression de la lettre");
                                                     }
                              };
/** ====================================== **/


module.exports = { 
                     renderHomePage,
                     renderShowLetter,

                     formCreateLetter,
                     renderCreateLetter,
                     
                     formUpdateLetter,
                     renderUpdateLetter,

                     deleteLetter,
                  };