const fs = require("fs");
const path = require("path");






// ======================
// LIRE LES QUESTIONS DE questions.json
// ======================
function getQuestions() {
                            const filePath = path.join(__dirname, "../data/questions.json");

                            if (!fs.existsSync(filePath)) {
                                                                console.error("❌ Fichier questions.json introuvable !");
                                                                return {};
                                                            }

                            const jsonData = fs.readFileSync(filePath, "utf-8");
                            return JSON.parse(jsonData);
                        }


/**
 * Sauvegarde les réponses d'un questionnaire dans un fichier JSON
 * @param {Object} data - Contient formData et questionnaire
 *  data.formData : { nom, poste, entreprise, date, reponses }
 *  data.questionnaire : tableau d'objets { section, question, reponse }
 */
function saveQuestionnaireJson(data) {
    // Vérification que formData existe
    if (!data || !data.formData) {
        console.error("Erreur : données du formulaire manquantes !");
        return;
    }

    // Nettoyage du nom pour générer un nom de fichier sûr
    // Si nom manquant, on met 'inconnu'
    const nomUtilisateur = data.formData.nom || "inconnu";
    const safeName = nomUtilisateur.replace(/\s+/g, "_"); // remplace les espaces par "_"

    // Vérification que la date existe, sinon on met la date du jour
    const date = data.formData.date || new Date().toISOString().split("T")[0];

    // Nom complet du fichier
    const fileName = `questionnaire_${safeName}_${date}.json`;

    // Chemin complet vers le dossier data
    const filePath = path.join(__dirname, "../data", fileName);

    try {
        // Écriture du fichier JSON avec indentation pour lisibilité
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
        console.log(`Questionnaire sauvegardé : ${filePath}`);
    } catch (err) {
        console.error("Erreur lors de la sauvegarde du fichier :", err);
    }
}

module.exports = { 
                    getQuestions,
                    saveQuestionnaireJson,      
                 }           