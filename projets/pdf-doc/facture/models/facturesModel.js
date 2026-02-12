/******************************************************************
 * IMPORTS
 ******************************************************************/
const fs = require("fs");
const path = require("path");

/******************************************************************
 * CHEMIN DU FICHIER JSON qui sera lu et écrit par les fonctions de ce module
 ******************************************************************/
const dataPath = path.join(__dirname, "..", "data", "factures.json");

/******************************************************************
 * FONCTION : lire toutes les factures
 ******************************************************************
 * - Lit le fichier factures.json
 * - Convertit le JSON en objet JavaScript
 * - Retourne un tableau de factures
 ******************************************************************/
function getAllFactures() {
                            try {
                                const data = fs.readFileSync(dataPath, "utf-8");
                                return JSON.parse(data);
                            } catch (error) {
                                console.error("❌ Erreur lecture factures :", error);
                                return [];
                            }
                          }

/******************************************************************
 * FONCTION : récupérer une facture par ID
 ******************************************************************
 * @param {number} id - identifiant de la facture
 * @returns {object|null}
 ******************************************************************/
function getFactureById(id) {
                                const factures = getAllFactures();

                                // Recherche de la facture correspondant à l'id
                                const facture = factures.find(f => f.id === id);

                                return facture || null;
                            }
                            
/******************************************************************
 * EXPORTS
 ******************************************************************/
module.exports = {
                    getAllFactures,
                    getFactureById
                };