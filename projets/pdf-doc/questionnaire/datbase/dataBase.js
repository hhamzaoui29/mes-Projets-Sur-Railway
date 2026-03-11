// Fichier: models/dataBase.js
// Objectif: Gérer toutes les opérations sur les fichiers JSON des questionnaires

/**
 * - fs (File System) :  Cette ligne importe le module natif fs (File System) de Node.js, mais pas sa version standard. En ajoutant .
 *                       promises, nous importons spécifiquement la version qui utilise des Promesses plutôt que des callbacks. 
 *                       Cela nous permettra d'utiliser async/await pour les opérations sur les fichiers, rendant le code plus lisible et plus facile à maintenir.
 * - path :  Nous importons le module path de Node.js, un utilitaire essentiel pour manipuler les chemins de fichiers de manière sécurisée et indépendante du système 
 *           d'exploitation (Windows utilise des backslashes \, tandis que Mac/Linux utilisent des forward slashes /).
 */
const fs = require('fs').promises;
const path = require('path');


/**
 *  - Nous déclarons une classe nommée QuestionnaireModel. Dans l'architecture MVC (Modèle-Vue-Contrôleur), le "Modèle" est responsable de la gestion des données. 
 *  - Cette classe va donc encapsuler toute la logique d'accès aux données des questionnaire.
 *  - constructor() : Le constructeur est une méthode spéciale qui s'exécute automatiquement lorsqu'on crée une nouvelle instance de la classe avec new QuestionnaireModel().
 *  - this.dataDir  : Crée une propriété d'instance qui contiendra le chemin absolu vers le dossier de données.
 *  - __dirname     : Est une variable globale de Node.js qui contient le chemin absolu du dossier où se trouve CE fichier (models)
 *  - 'data'        : Est le nom du dossier cible.
 *  - async         : Indique que cette fonction retourne automatiquement une Promesse et permet d'utiliser await à l'intérieur
 *  - try/catch     : Est une structure essentielle en programmation asynchrone pour gérer les erreurs avec élégance. On "essaie" d'exécuter le code dans ce bloc, 
 *                    et si une erreur se produit, on "attrape" cette erreur dans le bloc catch.
 *  - await         : Suspend l'exécution de la fonction jusqu'à ce que la Promesse soit résolue.
 *  - catch         : Qui s'exécute uniquement si une erreur s'est produite dans le bloc try. Ici, l'erreur est capturée dans le paramètre error.
 *  - map()         : transforme chaque élément du tableau en quelque chose de nouveau.
 * 
 * // Les Métodes 
 * =======================================================
 * NB : 
 *      - save() utilise JSON.stringify() (objet → chaîne)
 *      - read() utilise JSON.parse() (chaîne → objet)
 * ==========================================================
 *  - fs.mkdir()     : Est la méthode pour créer un nouveau dossier.
 *  - fs.access()    : Est une méthode qui vérifie si un fichier ou dossier existe et si le programme a les permissions nécessaires pour y accéder.
 *  - fs.writeFile() : Méthode asynchrone qui écrit des données dans un fichier.
 *  - fs.readFile()  : Node.js va dans le système de fichiers, ouvre le fichier, lit tout son contenu.
 *  - fs.readdir()   : Est une méthode qui lit le contenu d'un dossier.
 *  - fs.unlink()    : Est la méthode qui supprime un fichier du système de fichiers, 
 *                     unlink est le terme traditionnel Unix pour "supprimer un fichier" (littéralement "délier" le fichier du répertoire)
 * 
 *  - fileName.endsWith('.json') : vérifie si le nom du fichier se termine par l'extension .json.
 *  - JSON.parse()   : Transforme cette chaîne en une structure de données JavaScript.
 *  - JSON.stringify(contenu, null, 2): convertit l'objet JavaScript en chaîne JSON formatée
 *                                      - null : signifie "pas de fonction de remplacement" (on garde toutes les propriétés)
 *                                      - 2    : indique l'indentation de 2 espaces pour rendre le fichier JSON lisible par un humain
 *                                      Sans ce formatage, tout serait sur une seule ligne, illisible.
 * 
 *  - Le ! devant inverse la condition : on entre dans le bloc si le nom NE se termine PAS par .jsoN
 *  - Les accolades ({ ... }) avec parenthèses  : permettent de retourner directement un objet littéral
 *  - '..'          : Signifie "remonter d'un niveau" (du dossier models vers le dossier parent).
 * 
 */


class DataBase {
    constructor() { 
        console.log('📁 APPEL DU CONSTRUCTEUR DataBase');
        
        // Définir les deux dossiers
        this.questionnairesDir = path.join(__dirname, '..', 'data', 'questionnaires');
        this.formulairesDir = path.join(__dirname, '..', 'data', 'formulaires');
        
        console.log('📁 Dossier questionnaires:', this.questionnairesDir);
        console.log('📁 Dossier formulaires:', this.formulairesDir);
    }

    /**
     * ÉTAPE 1.1: Vérifier/créer les dossiers nécessaires
     */
    async ensureDirs() {
        console.log('📁 Vérification/création des dossiers...');
        
        try {
            // Créer le dossier questionnaires s'il n'existe pas
            await fs.mkdir(this.questionnairesDir, { recursive: true });
            console.log('✅ Dossier questionnaires prêt');
            
            // Créer le dossier formulaires s'il n'existe pas
            await fs.mkdir(this.formulairesDir, { recursive: true });
            console.log('✅ Dossier formulaires prêt');
            
        } catch (error) {
            console.error('❌ Erreur création dossiers:', error);
            throw error;
        }
    }

    /**
     * ÉTAPE 1.2: Obtenir le chemin d'un fichier questionnaire
     */
    getQuestionnairePath(fileName) {
        if (!fileName) {
            throw new Error('nomFichier est undefined');
        }
        
        let nomFichier = fileName;
        if (!nomFichier.endsWith('.json')) {
            nomFichier += '.json';
        }
        
        return path.join(this.questionnairesDir, nomFichier);
    }

    /**
     * ÉTAPE 1.3: Obtenir le chemin d'un fichier formulaire (réponses)
     */
    getFormulairePath(fileName) {
        if (!fileName) {
            throw new Error('nomFichier est undefined');
        }
        
        let nomFichier = fileName;
        if (!nomFichier.endsWith('.json')) {
            nomFichier += '.json';
        }
        
        return path.join(this.formulairesDir, nomFichier);
    }

    /**
     * ÉTAPE 1.4: Sauvegarder un questionnaire
     */
    async saveQuestionnaire(fileName, contenu) {
        console.log('📝 Sauvegarde questionnaire:', fileName);
        
        try {
            await this.ensureDirs();
            const filePath = this.getQuestionnairePath(fileName);
            await fs.writeFile(filePath, JSON.stringify(contenu, null, 2));
            
            return { 
                success: true, 
                message: 'Questionnaire sauvegardé',
                path: filePath
            };
        } catch (error) {
            console.error('❌ Erreur sauvegarde:', error);
            return {
                success: false,
                message: `Erreur: ${error.message}`
            };
        }
    }

    /**
     * ÉTAPE 1.5: Sauvegarder un formulaire (réponses)
     */
    async saveFormulaire(fileName, contenu) {
        console.log('📝 Sauvegarde formulaire:', fileName);
        
        try {
            await this.ensureDirs();
            const filePath = this.getFormulairePath(fileName);
            await fs.writeFile(filePath, JSON.stringify(contenu, null, 2));
            
            return { 
                success: true, 
                message: 'Formulaire sauvegardé',
                path: filePath
            };
        } catch (error) {
            console.error('❌ Erreur sauvegarde:', error);
            return {
                success: false,
                message: `Erreur: ${error.message}`
            };
        }
    }

    /**
     * ÉTAPE 1.6: Lire un questionnaire
     */
    async readQuestionnaire(fileName) {
        console.log('📖 Lecture questionnaire:', fileName);
        
        try {
            const filePath = this.getQuestionnairePath(fileName);
            const contenu = await fs.readFile(filePath, 'utf8');
            return JSON.parse(contenu);
        } catch (error) {
            throw new Error(`Impossible de lire ${fileName}: ${error.message}`);
        }
    }

    /**
     * ÉTAPE 1.7: Lire un formulaire (réponses)
     */
    async readFormulaire(fileName) {
        console.log('📖 Lecture formulaire:', fileName);
        
        try {
            const filePath = this.getFormulairePath(fileName);
            const contenu = await fs.readFile(filePath, 'utf8');
            return JSON.parse(contenu);
        } catch (error) {
            throw new Error(`Impossible de lire ${fileName}: ${error.message}`);
        }
    }

    /**
     * ÉTAPE 1.8: Lister tous les questionnaires
     */
    async listQuestionnaires() {
        console.log('📋 Liste des questionnaires');
        
        try {
            await this.ensureDirs();
            const files = await fs.readdir(this.questionnairesDir);
            
            return files
                .filter(f => f.endsWith('.json'))
                .map(f => ({
                    nom: f,
                    chemin: path.join(this.questionnairesDir, f)
                }));
        } catch (error) {
            console.error('❌ Erreur listage:', error);
            return [];
        }
    }

    /**
     * ÉTAPE 1.9: Lister tous les formulaires (réponses)
     */
    async listFormulaires() {
        console.log('📋 Liste des formulaires');
        
        try {
            await this.ensureDirs();
            const files = await fs.readdir(this.formulairesDir);
            
            return files
                .filter(f => f.endsWith('.json'))
                .map(f => ({
                    nom: f,
                    chemin: path.join(this.formulairesDir, f)
                }));
        } catch (error) {
            console.error('❌ Erreur listage:', error);
            return [];
        }
    }

    /**
     * ÉTAPE 1.10: Vérifier si un questionnaire existe
     */
    async questionnaireExists(fileName) {
        try {
            const filePath = this.getQuestionnairePath(fileName);
            await fs.access(filePath);
            return true;
        } catch {
            return false;
        }
    }
}

module.exports = DataBase;