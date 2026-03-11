// controllers/questionnaireControllers.js
const fs = require('fs'); 
const QuestionnaireModel = require('../models/questionnaireModel');
const { validerStructureQuestionnaire } = require('../utils/functions');


class QuestionnaireController {

    constructor() {
        console.log('✅ QuestionnaireController initialisé');
        this.model = new QuestionnaireModel();
    }

    /*--------------------------------------------------------------------------------------------------------------*/
    /**
     * ÉTAPE 3.1: Page d'accueil - Liste des questionnaires
     */
    async index(req, res) {
        try {
            console.log('📋 index appelé');
            const resultat = await this.model.listAllQuestionnaires();
            
            res.render('index', {
                title: 'Accueil - Gestionnaire de Questionnaires',
                questionnaires: resultat.success ? resultat.data : [],
                message: req.query.message || null,
                erreur: req.query.erreur || null
            });
        } catch (error) {
            console.error('❌ Erreur index:', error);
            res.render('index', {
                title: 'Accueil',
                questionnaires: [],
                message: null,
                erreur: error.message
            });
        }
    }

    /*--------------------------------------------------------------------------------------------------------------*/
        /**
     * ÉTAPE 1.2: Page de sélection d'un questionnaire pour créer un formulaire
     * À VENIR - Prochaine étape !
     */
    async formSelect(req, res) {
                                    try {
                                            console.log('📋 formSelect appelé');
                                            
                                            // Récupérer la liste des questionnaires disponibles
                                            const resultat = await this.model.listAllQuestionnaires();
                                            
                                            res.render('reponse/formSelect', {
                                                                                    title: 'Choisir un questionnaire',
                                                                                    questionnaires: resultat.success ? resultat.data : [],
                                                                                    erreur: null
                                                                                });
                                        } catch (error) {
                                                            console.error('❌ Erreur formSelect:', error);
                                                            res.status(500).send('Erreur interne');
                                                        }
                                }

    /*--------------------------------------------------------------------------------------------------------------*/
    /**
     * ÉTAPE 3.2: Formulaire de création d'un questionnaire
     */
    formCreate(req, res) {
        try {
            console.log('📝 formCreate appelé');
            res.render('questionnaire/formCreate', {
                title: 'Créer un questionnaire',
                erreur: null,
                donnees: null,
            });
        } catch (error) {
            console.error('❌ Erreur formCreate:', error);
            res.status(500).send('Erreur interne');
        }                 
    }

    /*--------------------------------------------------------------------------------------------------------------*/
    /**
     * ÉTAPE 3.3: Traitement de la création d'un questionnaire
     */
    async renderCreate(req, res) {
        try {
            console.log('💾 renderCreate appelé');
            const { nomFichier, contenu } = req.body;
            
            if (!nomFichier || !contenu) {
                return res.render('questionnaire/formCreate', {
                    title: 'Créer un questionnaire',
                    erreur: 'Tous les champs sont requis',
                    donnees: { nomFichier, contenu },
                });
            }
            
            let questionnaire;

            try {
                questionnaire = typeof contenu === 'object' ? contenu : JSON.parse(contenu);
                
                if (typeof questionnaire !== 'object' || questionnaire === null) {
                    throw new Error('Le contenu doit être un objet JSON valide');
                }
            } catch (e) {
                return res.render('questionnaire/formCreate', {
                    title: 'Créer un questionnaire',
                    erreur: 'JSON invalide: ' + e.message,
                    donnees: { nomFichier, contenu },
                });
            }
            
            // Valider la structure
            const validation = await validerStructureQuestionnaire(questionnaire);

            if (!validation.valide) {
                return res.render('questionnaire/formCreate', {
                    title: 'Créer un questionnaire',
                    erreur: validation.message,
                    donnees: { nomFichier, contenu: JSON.stringify(questionnaire, null, 2) },
                });
            }
            
            // Sauvegarder
            const resultat = await this.model.createQuestionnaire(nomFichier, questionnaire);
            
            if (resultat.success) {
                res.redirect('/q/?message=' + encodeURIComponent('✅ ' + resultat.message));
            } else {
                res.render('questionnaire/formCreate', {
                    title: 'Créer un questionnaire',
                    erreur: resultat.message,
                    donnees: { 
                        nomFichier, 
                        contenu: JSON.stringify(questionnaire, null, 2) 
                    },
                });
            }
        } catch (error) {
            console.error('❌ Erreur renderCreate:', error);
            res.render('questionnaire/formCreate', {
                title: 'Créer un questionnaire',
                erreur: error.message,
                donnees: req.body,
            });
        }
    }

    
}

module.exports = QuestionnaireController;