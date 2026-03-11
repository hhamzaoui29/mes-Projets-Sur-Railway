const fs = require('fs').promises;
const path = require('path');

class Database {
                    constructor() {
                                    // Le dossier où seront stockés tous les fichiers JSON
                                    this.dataDir = path.join(__dirname, '..', '..', 'data');
                                  }
                    
                    /**
                     * Helper pour obtenir le chemin complet d'un fichier d'entité
                     */
                    _getEntityPath(entity) {
                                                return path.join(this.dataDir, `${entity}.json`);
                                                console.log (" _getEntityPath PATH = ", path.join(this.dataDir, `${entity}.json`));
                                            }
                    
                    /**
                     * Helper pour lire un fichier d'entité
                     */
                    async _readEntityFile(entity) {
                                                        try {
                                                                const filePath = this._getEntityPath(entity);
                                                                const content = await fs.readFile(filePath, 'utf8');
                                                                return JSON.parse(content);
                                                            } catch (error) {
                                                                                // Si le fichier n'existe pas, on retourne un tableau vide
                                                                                return [];
                                                                            }
                                                    }
                    
                    /**
                     * Helper pour écrire dans un fichier d'entité
                     */
                    async _writeEntityFile(entity, data) {
                                                            const filePath = this._getEntityPath(entity);
                                                            await fs.writeFile(filePath, JSON.stringify(data, null, 2));
                                                            console.log(`✅ Fichier ${entity}.json mis à jour`);
                                                         }
                    
                    /*-----------------------------------*/
                    /**
                     * Récupère TOUS les enregistrements d'une table (fichier JSON)
                     * @param {string} entity - Nom de la table (ex: 'roles', 'categories')
                     * @returns {Promise<Array>} - Tableau de tous les enregistrements
                     */
                    async findAll(entity) {
                                            console.log(`📖 Lecture de tous les enregistrements de "${entity}"`);
                                            const data = await this._readEntityFile(entity);
                                            return data.sort((a, b) => a.id - b.id);
                                          }
                    
                    /*-----------------------------------*/
                    /**
                     * Récupère UN SEUL enregistrement par son ID
                     * @param {string} entity - Nom de la table
                     * @param {number|string} id - L'identifiant de l'enregistrement
                     * @returns {Promise<Object|null>} - L'objet trouvé ou null
                     */
                    async findOne(entity, id) {
                                                console.log(`🔍 Recherche dans "${entity}" de l'ID: ${id}`);
                                                const data = await this._readEntityFile(entity);
                                                const item = data.find(item => item.id === parseInt(id));
                                                return item || null;
                                              }
                    
                    /*-----------------------------------*/
                    /**
                     * Crée un nouvel enregistrement
                     * @param {string} entity - Nom de la table
                     * @param {Object} data - Les données à sauvegarder
                     * @returns {Promise<Object>} - L'objet créé
                     */
                    async create(entity, data) {
                                                    console.log(`➕ Création d'un nouvel enregistrement dans "${entity}"`);
                                                    
                                                    // 1. Lire toutes les données existantes
                                                    const allData = await this._readEntityFile(entity);
                                                    
                                                    // 2. Calculer le prochain ID
                                                    const nextId = allData.length > 0 
                                                                                  ? Math.max(...allData.map(item => item.id)) + 1 
                                                                                  : 1;
                                                    
                                                    // 3. Créer le nouvel objet
                                                    const newItem = {
                                                                        id: nextId,
                                                                        ...data,
                                                                        createdAt: new Date().toISOString(),
                                                                        updatedAt: new Date().toISOString()
                                                                    };
                                                    
                                                    // 4. Ajouter au tableau
                                                    allData.push(newItem);
                                                    
                                                    // 5. Sauvegarder dans le fichier
                                                    await this._writeEntityFile(entity, allData);
                                                    
                                                    console.log(`✅ Enregistrement créé avec l'ID: ${nextId}`);
                                                    return newItem;
                                                }
                    
                    /*-----------------------------------*/
                    /**
                     * Met à jour un enregistrement existant
                     * @param {string} entity - Nom de la table
                     * @param {number} id - ID de l'enregistrement à modifier
                     * @param {Object} data - Nouvelles données (partielles ou complètes)
                     * @returns {Promise<Object|null>} - L'objet mis à jour ou null
                     */
                    async update(entity, id, data) {
                                                        console.log(`✏️ Mise à jour dans "${entity}" de l'ID: ${id}`);
                                                        
                                                        // 1. Lire toutes les données
                                                        const allData = await this._readEntityFile(entity);
                                                        
                                                        // 2. Trouver l'index de l'élément à modifier
                                                        const index = allData.findIndex(item => item.id === parseInt(id));
                                                        
                                                        if (index === -1) {
                                                                            console.log(`❌ Enregistrement ID ${id} non trouvé`);
                                                                            return null;
                                                                          }
                                                        
                                                        // 3. Mettre à jour l'élément
                                                        allData[index] = {
                                                                            ...allData[index],
                                                                            ...data,
                                                                            updatedAt: new Date().toISOString()
                                                                         };
                                                        
                                                        // 4. Sauvegarder dans le fichier
                                                        await this._writeEntityFile(entity, allData);
                                                        
                                                        console.log(`✅ Enregistrement ID ${id} mis à jour`);
                                                        return allData[index];
                                                    }
                    
                    /*-----------------------------------*/
                    /**
                     * Supprime un enregistrement
                     * @param {string} entity - Nom de la table
                     * @param {number} id - ID de l'enregistrement à supprimer
                     * @returns {Promise<boolean>} - true si supprimé, false sinon
                     */
                    async delete(entity, id) {
                                                console.log(`🗑️ Suppression dans "${entity}" de l'ID: ${id}`);
                                                
                                                // 1. Lire toutes les données
                                                const allData = await this._readEntityFile(entity);
                                                
                                                // 2. Filtrer pour enlever l'élément
                                                const newData = allData.filter(item => item.id !== parseInt(id));
                                                
                                                if (newData.length === allData.length) {
                                                    console.log(`❌ Enregistrement ID ${id} non trouvé`);
                                                    return false;
                                                }
                                                
                                                // 3. Sauvegarder dans le fichier
                                                await this._writeEntityFile(entity, newData);
                                                
                                                console.log(`✅ Enregistrement ID ${id} supprimé`);
                                                return true;
                                            }
                    
                    /*-----------------------------------*/
                    /**
                     * Recherche des enregistrements avec des critères
                     * @param {string} entity - Nom de la table
                     * @param {Object} criteria - Critères de recherche (ex: { parentId: null })
                     * @returns {Promise<Array>} - Tableau des enregistrements correspondants
                     */
                    async findByCriteria(entity, criteria) {
                                                                const allData = await this._readEntityFile(entity);
                                                                
                                                                return allData.filter(item => {
                                                                                                    return Object.keys(criteria).every(key => {
                                                                                                                                                    return item[key] === criteria[key];
                                                                                                                                                });
                                                                                                });
                                                            }
                    
                    /*-----------------------------------*/
                    /**
                     * Récupère les enregistrements enfants (pour hiérarchie)
                     * @param {string} entity - Nom de la table
                     * @param {number} parentId - ID du parent
                     * @returns {Promise<Array>} - Tableau des enfants
                     */
                    async getChildren(entity, parentId) {
                                                            return this.findByCriteria(entity, { parentId: parseInt(parentId) });
                                                        }
                }

module.exports = Database;