/**
 * Fichier AffichageController
 */

const fs = require('fs'); 
const affichageModel = require('../models/affichageModel');

const {createPdf } = require("../services/pdf");

class AffichageControllers{

    constructor() {
                    console.log('✅ QuestionnaireController initialisé');
                    this.model = new affichageModel();
                 }

/*----------------------------------------------------------------------------------------------------------*/

    async listFormulaires(req, res) {
        try {
                console.log('📋 listReponses appelé');
                
                // Récupérer la liste des formulaires (réponses)
                const resultat = await this.model.listAllFormulaires();
                console.log ("resultat dans liste réponses  == ", resultat);

                res.render('reponse/index', {
                                                title: 'Liste des réponses',
                                                reponses: resultat.success ? resultat.data : [],
                                                message: req.query.message || null,
                                                erreur: req.query.erreur || null
                                            });
                
            } catch (error) {
                                console.error('❌ Erreur listReponses:', error);
                                res.redirect('/q?erreur=' + encodeURIComponent(error.message));
                            }
    }

/*----------------------------------------------------------------------------------------------------------*/
/**
 * ÉTAPE 5.2: Page de visualisation d'une réponse (avec bouton de téléchargement)
 */
    async viewReponses(req, res) {
        try {
                const { id } = req.params;
                console.log('📋 viewReponse appelé pour:', id);

                // Lire le fichier de réponse
                const reponse = await this.model.getFormulaire(id + '.json');
                
                if (!reponse.success) {
                                        return res.redirect('/q?erreur=' + encodeURIComponent('Réponse non trouvée'));
                                      }

                res.render('affichage/formReponse', {
                                                        title: 'Détails de la réponse',
                                                        reponse: reponse.data,
                                                        formulaireId: id
                                                    });

            } catch (error) {
                                console.error('❌ Erreur viewReponse:', error);
                                res.redirect('/q?erreur=' + encodeURIComponent(error.message));
                            }
    }
/*----------------------------------------------------------------------------------------------------------*/
/**
 * ÉTAPE 5.1: Télécharger un document (PDF/Word) des réponses
 */
// Dans votre contrôleur, avant d'appeler createPdf
    async downloadPdf1(req, res) {
        try {
                const { id, format } = req.params;
                console.log('📥 downloadDocument appelé pour id:', id, 'format:', format);
                
                const reponse = await this.model.getFormulaire(id + '.json');
                
                if (!reponse.success) {
                                        return res.status(404).json({ 
                                                                        success: false, 
                                                                        message: 'Réponse non trouvée' 
                                                                    });
                                      }

                // 🔍 LOGS DE DEBUG - Voir la structure complète
                console.log('🔍 STRUCTURE COMPLÈTE DE LA RÉPONSE:');
                console.log(JSON.stringify(reponse.data, null, 2));
                
                const reponsesData = reponse.data.contenu.reponses || {};
                console.log('🔍 reponsesData:', reponsesData);
                console.log('🔍 Clés dans reponsesData:', Object.keys(reponsesData));

                // Transformer les réponses en tableau
                const questionsTableau = [];
                
                Object.entries(reponsesData).forEach(([key, value]) => {
                                                                            console.log(`🔍 Clé: "${key}", Type: ${typeof value}, Valeur: "${value}"`);
                                                                            
                                                                            if (key.startsWith('q_')) {
                                                                                                        questionsTableau.push({
                                                                                                                                question: `Question ${key.replace('q_', '')}`,
                                                                                                                                reponse: value || ''
                                                                                                                              });
                                                                                                       }
                                                                        });

                console.log('📊 Questions trouvées:', questionsTableau.length);
                
                // Si aucune question trouvée, essayons une autre approche
                if (questionsTableau.length === 0) {
                                                        console.log('⚠️ Aucune question avec "q_", tentative avec toutes les clés...');
                                                        
                                                        Object.entries(reponsesData).forEach(([key, value]) => {
                                                            // Exclure les champs metadata
                                                            if (!['titre', 'nom', 'poste', 'entreprise', 'date'].includes(key)) {
                                                                                                                                    questionsTableau.push({
                                                                                                                                                                question: key,
                                                                                                                                                                reponse: value || ''
                                                                                                                                                            });
                                                                                                                                }
                                                        });
                                                    }

                console.log('📊 Total questions après traitement:', questionsTableau.length);

                // Préparer les données pour le PDF
                const data = {
                                titre: reponsesData.titre || 'Non renseigné',
                                nom: reponsesData.nom || 'Non renseigné',
                                poste: reponsesData.poste || 'Non renseigné',
                                entreprise: reponsesData.entreprise || 'Non renseigné',
                                date: reponse.data.contenu.meta?.date || new Date().toLocaleDateString('fr-FR'),
                                questionnaire: questionsTableau
                            };

                console.log('📊 Données finales pour PDF:', {
                                                                nom: data.nom,
                                                                poste: data.poste,
                                                                nbQuestions: data.questionnaire.length
                                                            });

                console.log('📦 AVANT createPdf - questionnaire:', JSON.stringify(questionsTableau, null, 2));
                const filePath = await createPdf(data);
                
                res.download(filePath, `reponse_${id}.${format}`, (err) => {
                                                                                if (err) console.error('❌ Erreur download:', err);
                                                                                fs.unlink(filePath, () => {});
                                                                            });

            } catch (error) {
                                console.error('❌ Erreur génération document:', error);
                                res.status(500).json({ 
                                                        success: false, 
                                                        message: "Erreur lors de la génération du document",
                                                        error: error.message 
                                                    });
                            }
    }

    // controllers/questionnaireControllers.js

async downloadPdf(req, res) {
    try {
        const { id, format } = req.params;
        console.log('📥 downloadDocument appelé pour id:', id, 'format:', format);
        
        // Valider le format
        if (!format || (format !== 'pdf' && format !== 'word')) {
            return res.status(400).json({ 
                success: false, 
                message: "Format invalide. Utilisez 'pdf' ou 'word'" 
            });
        }

        // Récupérer les données de la réponse
        const reponse = await this.model.getFormulaire(id + '.json');
        
        if (!reponse.success) {
            return res.status(404).json({ 
                success: false, 
                message: 'Réponse non trouvée' 
            });
        }

        // 🔥 INSÉREZ LE CODE DE FORMATAGE ICI 🔥
        // ===========================================
        // Transformer les réponses en tableau avec des libellés lisibles
        const reponsesData = reponse.data.contenu.reponses || {};
        const questionsTableau = [];

        Object.entries(reponsesData).forEach(([key, value]) => {
            // Ne pas inclure les champs metadata (nom, poste, entreprise)
            if (!['nom', 'poste', 'entreprise'].includes(key)) {
                
                // Formater la clé pour un affichage plus lisible
                let questionLabel = key;
                
                // Si la clé est au format "q_X_Y" (question section_question)
                if (key.match(/^q_(\d+)_(\d+)$/)) {
                    const matches = key.match(/^q_(\d+)_(\d+)$/);
                    const sectionNum = matches[1];
                    const questionNum = matches[2];
                    questionLabel = `Question ${questionNum} - Section ${sectionNum}`;
                }
                // Si la clé est au format "q_X" (question globale)
                else if (key.match(/^q_(\d+)$/)) {
                    const questionNum = key.replace('q_', '');
                    questionLabel = `Question ${questionNum}`;
                }
                // Sinon, on garde la clé mais on la formate
                else {
                    questionLabel = key
                        .replace(/_/g, ' ')           // Remplacer _ par des espaces
                        .replace(/q /i, 'Question ')   // Remplacer "q " par "Question "
                        .replace(/\b\w/g, l => l.toUpperCase()); // Première lettre en majuscule
                }
                
                questionsTableau.push({
                    question: questionLabel,
                    reponse: value || ''
                });
            }
        });

        // Ajouter aussi les infos perso si vous voulez les afficher dans le tableau
        if (reponsesData.nom) {
            questionsTableau.unshift({
                question: "Nom du candidat",
                reponse: reponsesData.nom
            });
        }
        if (reponsesData.poste) {
            questionsTableau.unshift({
                question: "Poste visé",
                reponse: reponsesData.poste
            });
        }
        if (reponsesData.entreprise) {
            questionsTableau.unshift({
                question: "Entreprise",
                reponse: reponsesData.entreprise
            });
        }

        // Trier les questions par section et numéro (optionnel)
        questionsTableau.sort((a, b) => {
            const getSectionNum = (q) => {
                const match = q.question.match(/Section (\d+)/);
                return match ? parseInt(match[1]) : 999;
            };
            const getQuestionNum = (q) => {
                const match = q.question.match(/Question (\d+)/);
                return match ? parseInt(match[1]) : 999;
            };
            
            const sectionA = getSectionNum(a);
            const sectionB = getSectionNum(b);
            
            if (sectionA === sectionB) {
                return getQuestionNum(a) - getQuestionNum(b);
            }
            return sectionA - sectionB;
        });

        console.log('📊 Questions formatées:', questionsTableau.map(q => ({
            question: q.question,
            reponse: q.reponse.substring(0, 30) + '...'
        })));

        // ===========================================
        // FIN DU CODE DE FORMATAGE

        // Préparer les données pour le PDF
        const data = {
            nom: reponsesData.nom || 'Non renseigné',
            poste: reponsesData.poste || 'Non renseigné',
            entreprise: reponsesData.entreprise || 'Non renseigné',
            date: reponse.data.contenu.meta?.date || new Date().toLocaleDateString('fr-FR'),
            questionnaire: questionsTableau  // ← UTILISEZ LE TABLEAU FORMATÉ
        };

        console.log('📊 Données finales pour PDF:', {
            nom: data.nom,
            poste: data.poste,
            nbQuestions: data.questionnaire.length
        });

        // Générer le PDF
        const filePath = await createPdf(data);
        
        // Envoyer le fichier
        res.download(filePath, `reponse_${id}.${format}`, (err) => {
            if (err) {
                console.error('❌ Erreur download:', err);
            }
            // Supprimer le fichier temporaire
            fs.unlink(filePath, (unlinkErr) => {
                if (unlinkErr) {
                    console.error('❌ Erreur suppression fichier temp:', unlinkErr);
                }
            });
        });

    } catch (error) {
        console.error('❌ Erreur génération document:', error);
        res.status(500).json({ 
            success: false, 
            message: "Erreur lors de la génération du document",
            error: error.message 
        });
    }
}

}

module.exports = AffichageControllers;








