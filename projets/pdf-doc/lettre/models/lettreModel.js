 // Import du module fs pour la gestion des fichiers
const fs = require("fs");

// Import du module path pour la gestion des chemins de fichiers
const path = require("path"); 







// Chemin vers le fichier JSON pour stocker les données des lettres
const filePath = path.join(__dirname, '../data/lettres.json'); 

// lire toutes les lettres
function getAllLetters(){
                    try {

                            if (!fs.existsSync(filePath)) {
                                                            // Si le fichier n'existe pas, retourner un tableau vide ou une valeur par défaut
                                                            console.warn(`Le fichier ${filePath} n'existe pas. Aucune lettre à lire.`);
                                                            return [];
                                                          }    
                            // Lire les données existantes
                            const data = fs.readFileSync(filePath, 'utf-8');

                            // Si le fichier est vide, retourne tableau vide
                            if (!data) {
                                         return [];
                                        }

                            // Vérifier que les données sont au format attendu (un tableau de lettres)
                            const parsedData = JSON.parse(data);

                            if (!Array.isArray(parsedData)) {
                                            console.warn(`Le fichier ${filePath} ne contient pas un tableau de lettres. Aucune lettre à lire.`);
                                            return [];
                                        }
                            // Retourner les données sous forme d'objet JavaScript, ou un tableau vide si le fichier est vide
                            return parsedData ; 

                        } catch (error) {
                                            // Gérer les erreurs de lecture du fichier
                                            console.error("Erreur lors de la lecture des données des lettres :", error);
                                            return [];
                                        }
                  }
/** ================================================= **/
function getLetterById(id) {
                                try {
                                         // Lire toutes les lettres
                                        const letters = getAllLetters();

                                        // Trouver la lettre avec l'ID correspondant
                                         const letter = letters.find(letter => letter.id === id); 

                                         // Retourner la lettre trouvée ou null si elle n'existe pas
                                         return letter || null; 

                                    } catch (error) {
                                                        console.error("Erreur lors de la récupération de la lettre par ID :", error);
                                                        return null;
                                                    }
                              }

/** ================================================= **/
function saveAllLetters(data) {
                                try {
                                        // Sauvegarder les données dans un fichier JSON
                                        fs.writeFileSync(
                                                            filePath,  // Chemin du fichier
                                                            JSON.stringify(data, null, 2), // Convertir les données en JSON avec une indentation de 2 espaces pour la lisibilité
                                                            'utf-8'   // Encodage du fichier
                                                        );

                                        console.log(`Données de toutes les lettres sauvegardées dans ${filePath}`);
                                    
                                    }
                                    catch (error) {
                                                        console.error("Erreur lors de la sauvegarde des données de toutes les lettres :", error);
                                                   } 
                              }

/** ================================================= **/
function saveLetter(data) {
                                
                            try {
                                    //verification que formData existe
                                    if (!data) {
                                                    console.error("Aucune donnée à sauvegarder");
                                                    return;
                                                }

                                    // Charger les données existantes
                                    const existingData = getAllLetters();

                                    const newData = {
                                                    
                                                    id: Date.now().toString(),             // Générer un ID unique basé sur le timestamp
                                                    ...data,                             // Ajouter les nouvelles données à l'objet existant
                                                    createdAt: new Date().toISOString(), // Ajouter une date de création
                                                    updateAt: null                       // Ajouter une date de mise à jour
                                                    }
                                    // Ajouter la nouvelle lettre aux données existantes
                                    existingData.push(newData);

                                    // Sauvegarder les données mises à jour dans le fichier JSON
                                    saveAllLetters(existingData);
                                    
                                    // Retourner les données de la lettre sauvegardée
                                    return newData;
                                
                                } catch (error) {
                                                    console.error("Erreur lors de la sauvegarde des données de la lettre :", error);
                                                } 
                          }

/** ================================================= **/
function updateLetter(id, updatedData) {
                                try {
                                        // Lire toutes les lettres
                                        const letters = getAllLetters();

                                        // Trouver l'index de la lettre à mettre à jour
                                        const index = letters.findIndex(letter => letter.id === id);

                                        if (index === -1) {
                                                        console.warn(`Lettre avec ID ${id} non trouvée. Aucune mise à jour effectuée.`);
                                                        return null;
                                                      }

                                        // Mettre à jour les données de la lettre
                                        letters[index] = {
                                                            ...letters[index], // Conserver les données existantes
                                                            ...updatedData,   // Ajouter les nouvelles données
                                                            updateAt: new Date().toISOString() // Mettre à jour la date de mise à jour
                                                        };

                                        // Sauvegarder les données mises à jour dans le fichier JSON
                                        saveAllLetters(letters);
                                        console.log(`Lettre avec ID ${id} mise à jour avec succès.`);

                                        // Retourner les données de la lettre mise à jour
                                        return letters[index];
                                    
                                    } catch (error) {
                                                        console.error("Erreur lors de la mise à jour de la lettre :", error);
                                                        return null;
                                                    }
                              };

/** ================================================= **/
function deleteLetter(id) {
                                try {
                                        // Lire toutes les lettres
                                        const letters = getAllLetters();

                                        // Filtrer les lettres pour exclure celle avec l'ID spécifié
                                        const deleteLetter = letters.filter(letter => letter.id !== id);

                                        // Suppruimer la lettre
                                        saveAllLetters(deleteLetter);
                                        console.log(`Lettre avec ID ${id} supprimée avec succès.`);

                                    } catch (error) {
                                                        console.error("Erreur lors de la suppression de la lettre :", error);
                                                    }
                              }
/** ================================================= **/

module.exports = { 
                    getAllLetters,
                    getLetterById,
                    saveAllLetters,
                    saveLetter,
                    updateLetter,
                    deleteLetter,
                    
                  };    