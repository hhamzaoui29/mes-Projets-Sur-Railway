//Fichier ReponseControllers.js

const ReponseModel = require('../models/reponseModel');


class ReponsesController {

    constructor() {
                        console.log('✅ QuestionnaireController initialisé');
                        this.model = new ReponseModel();
                    }
    

    


/**
     * ÉTAPE 4.1: Afficher le formulaire de réponse pour un questionnaire
     */
    async formFill(req, res) {
                                try {
                                        console.log('📝 formFill appelé pour:', req.params.nomFichier);
                                        
                                        const { nomFichier } = req.params;
                                        
                                        // Récupérer le questionnaire
                                        const resultat = await this.model.getQuestionnaire(nomFichier);
                                        
                                        if (!resultat.success) {
                                                                    return res.redirect('/q/formSelect?erreur=' + 
                                                                        encodeURIComponent('Questionnaire non trouvé'));
                                                                }
                                        
                                        const questionnaire = resultat.data.contenu;
                                        
                                        // Générer un ID unique pour ce formulaire
                                        const formulaireId = 'reponse_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                                        
                                        res.render('reponse/formFill', {
                                                                                title: 'Remplir le questionnaire',
                                                                                questionnaire: questionnaire,
                                                                                nomFichierSource: nomFichier,
                                                                                formulaireId: formulaireId,
                                                                                erreur: null
                                                                            });
                                        
                                    } catch (error) {
                                                        console.error('❌ Erreur formFill:', error);
                                                        res.redirect('/q/formSelect?erreur=' + encodeURIComponent(error.message));
                                                    }
                            }

    /**
     * ÉTAPE 4.2: Sauvegarder les réponses du formulaire
     */
     async save(req, res) {
        try {
            console.log('💾 La fonction save appelé');
            console.log('📦 req.body:', req.body);
            
            const { formulaireId, nomFichierSource, ...reponses } = req.body;
            
            if (!formulaireId || !nomFichierSource) {
                throw new Error('Données manquantes');
            }
            
            // Construire l'objet de réponse
            const reponseFinale = {
                                        meta: {
                                                    id: formulaireId,
                                                    questionnaireSource: nomFichierSource,
                                                    date: new Date().toISOString(),
                                                    dateCreation: new Date().toLocaleString('fr-FR')
                                                },
                                        reponses: reponses
                                    };
            
            // Sauvegarder dans le dossier formulaires
            const resultat = await this.model.saveFormulaire(formulaireId + '.json', reponseFinale);
            
            if (resultat.success) {
                                        res.redirect('/q/formConfirme/' + formulaireId);
                                    } else {
                                                throw new Error(resultat.message);
                                            }
            
        } catch (error) {
            console.error('❌ Erreur dans la fonction save:', error);
            res.redirect('/q/formSelect?erreur=' + encodeURIComponent(error.message));
        }
    }
    async save1(req, res) {
        try {
            console.log('💾 La fonction save appelé');
            console.log('📦 req.body:', req.body);
            
            const { formulaireId, nomFichierSource, ...reponses } = req.body;
            
            if (!formulaireId || !nomFichierSource) {
                throw new Error('Données manquantes');
            }
            
            // Construire l'objet de réponse
            const reponseFinale = {
                                        meta: {
                                                    id: formulaireId,
                                                    questionnaireSource: nomFichierSource,
                                                    date: new Date().toISOString(),
                                                    dateCreation: new Date().toLocaleString('fr-FR')
                                                },
                                        reponses: reponses
                                    };
            
            // Sauvegarder dans le dossier formulaires
            const resultat = await this.model.saveFormulaire(formulaireId + '.json', reponseFinale);
            
            if (resultat.success) {
                                        res.redirect('/q/formConfirme/' + formulaireId);
                                    } else {
                                                throw new Error(resultat.message);
                                            }
            
        } catch (error) {
            console.error('❌ Erreur dans la fonction save:', error);
            res.redirect('/q/formSelect?erreur=' + encodeURIComponent(error.message));
        }
    }

    /**
     * ÉTAPE 4.3: Page de confirmation
     */
    async formulaireConfirmation(req, res) {
        try {
            const { id } = req.params;
            
            res.render('reponse/formConfirme', {  
                                                        title: 'Formulaire envoyé',
                                                        formulaireId: id,
                                                        message: 'Vos réponses ont été enregistrées avec succès !'
                                                    });
            
        } catch (error) {
            console.error('❌ Erreur confirmation:', error);
            res.redirect('/q');
        }
    }


}

module.exports = ReponsesController;
