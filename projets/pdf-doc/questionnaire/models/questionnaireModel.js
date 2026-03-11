// models/QuestionnaireModel.js
const DataBase = require('../datbase/dataBase');
const { compterTotalQuestions } = require('../utils/functions');

class QuestionnaireModel {
    constructor() {
        console.log('✅ QuestionnaireModel initialisé');
        this.dataBase = new DataBase();
    }

    /*--------------------------------------------------------------------------------------------------------------*/
    /**
     * ÉTAPE 2.1: Lister tous les questionnaires avec statistiques
     */
    async listAllQuestionnaires() {
        console.log('📋 listAllQuestionnaires appelé');
        
        try {
            const files = await this.dataBase.listQuestionnaires();
            const data = [];

            for (const file of files) {
                try {
                    const contenu = await this.dataBase.readQuestionnaire(file.nom);
                    const totalQuestions = await compterTotalQuestions(contenu);
                    console.log('Stats pour', file.nom, ':', totalQuestions); // Pour debug
                    
                    data.push({
                        ...file,
                        nomSansExtension: file.nom.replace('.json', ''),
                       // nombreSections: Object.keys(contenu).length,
                        nombreSections: totalQuestions.sections,
                        nombreQuestions:  totalQuestions.total,
                        dateModification: await this.getFileDate(file.chemin)
                    });
                } catch (error) {
                    data.push({
                        ...file,
                        nomSansExtension: file.nom.replace('.json', ''),
                        nombreSections: 0,
                        nombreQuestions: 0,
                        erreur: 'Lecture impossible'
                    });
                }
            }

            return {
                success: true,
                data: data.sort((a, b) => b.nom.localeCompare(a.nom)) // Tri alphabétique
            };

        } catch (error) {
            console.error('❌ Erreur listage:', error);
            return {
                success: false,
                message: error.message,
                data: []
            };
        }
    }

    /*--------------------------------------------------------------------------------------------------------------*/
    /**
     * ÉTAPE 2.2: Créer un questionnaire
     */
    async createQuestionnaire(fileName, contenu) {
        try {
            if (!fileName || fileName.trim() === '') {
                return {
                    success: false,
                    message: 'Le nom du fichier est requis'
                };
            }

            if (!contenu || typeof contenu !== 'object') {
                return {
                    success: false,
                    message: 'Le contenu doit être un objet valide'
                };
            }

            // Vérifier si le fichier existe déjà
            const existe = await this.dataBase.questionnaireExists(fileName);

            if (existe) {
                return {
                    success: false,
                    message: `${fileName} existe déjà` 
                };
            }

            // Sauvegarder
            const resultat = await this.dataBase.saveQuestionnaire(fileName, contenu);
            
            return resultat;

        } catch (error) {
            return {
                success: false,
                message: `Erreur: ${error.message}`
            };
        }
    }
        
    /*--------------------------------------------------------------------------------------------------------------*/
    /**
     * ÉTAPE 2.: Obtenir la date d'un fichier (utilitaire)
     */
    async getFileDate(filePath) {
        try {
            const stats = await fs.stat(filePath);
            return stats.mtime;
        } catch {
            return null;
        }
    }

    
    
}

module.exports = QuestionnaireModel;