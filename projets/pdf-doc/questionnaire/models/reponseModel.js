
// models/ReponseModel.js
const DataBase = require('../datbase/dataBase');
const { compterTotalQuestions } = require('../utils/functions');

class ReponseModel{

    constructor() {
                    console.log('✅ reponseModel initialisé');
                    this.dataBase = new DataBase();
                  }

  

    /*--------------------------------------------------------------------------------------------------------------*/
    /**
     * ÉTAPE 2.3: Lire un questionnaire spécifique
     */
    async getQuestionnaire(fileName) {
        try {
            const contenu = await this.dataBase.readQuestionnaire(fileName);
            
            return {
                success: true,
                data: {
                    nom: fileName,
                    contenu: contenu,
                    nombreSections: Object.keys(contenu).length,
                    nombreQuestions: compterTotalQuestions(contenu)
                }
            };
        } catch (error) {
            return {
                success: false,
                message: error.message
            };
        }
    }

    /**
     * ÉTAPE 2.4: Sauvegarder un formulaire (réponses)
     */
    async saveFormulaire(fileName, contenu) {
    try {
            if (!fileName || !contenu) {
            return {
                    success: false,
                    message: 'Données manquantes'
            };
            }
            
            // Sauvegarder dans le dossier formulaires
            const resultat = await this.dataBase.saveFormulaire(fileName, contenu);
            
            return resultat;
            
    } catch (error) {
            console.error('❌ Erreur saveFormulaire:', error);
            return {
            success: false,
            message: `Erreur: ${error.message}`
            };
    }
    }

}

module.exports = ReponseModel