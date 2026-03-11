
// models/AffichageModel.js

const DataBase = require('../datbase/dataBase');


class AffichageModel{

    constructor() {
                    console.log('✅ reponseModel initialisé');
                    this.dataBase = new DataBase();
                  }

      async listAllFormulaires() {
        console.log('📋 listAllFormulaires appelé');
        
        try {
            const files = await this.dataBase.listFormulaires();
            const data = [];

            for (const file of files) {
                try {
                    const contenu = await this.dataBase.readFormulaire(file.nom);
                    
                    data.push({
                        ...file,
                        nomSansExtension: file.nom.replace('.json', ''),
                        date: contenu.meta?.date || 'Date inconnue',
                        questionnaireSource: contenu.meta?.questionnaireSource || 'Inconnu',
                        id: contenu.meta?.id || file.nom.replace('.json', '')
                    });
                } catch (error) {
                    data.push({
                        ...file,
                        nomSansExtension: file.nom.replace('.json', ''),
                        date: 'Erreur lecture',
                        questionnaireSource: 'Erreur'
                    });
                }
            }

            return {
                success: true,
                data: data.sort((a, b) => b.date.localeCompare(a.date))
            };

        } catch (error) {
            console.error('❌ Erreur listage formulaires:', error);
            return {
                success: false,
                message: error.message,
                data: []
            };
        }
    }
    
    async getFormulaire(fileName) {
        try {
            const contenu = await this.dataBase.readFormulaire(fileName);
            
            return {
                success: true,
                data: {
                    nom: fileName,
                    contenu: contenu,
                    date: contenu.meta?.date || new Date().toISOString()
                }
            };
        } catch (error) {
            return {
                success: false,
                message: error.message
            };
        }
    }

}

module.exports = AffichageModel;