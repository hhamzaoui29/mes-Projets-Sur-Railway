const Database = require('./dataBase');

/**
 * Modèle Product - Gère toutes les opérations liées aux produits
 * Hérite de Database mais ajoute des méthodes spécifiques aux produits
 */
class Produits extends Database {
            constructor() {
                            super(); // Appelle le constructeur de la classe parente (Database)
                            this.entity = 'produits'; // Le nom de la table/dossier pour ce modèle
                          }

            /**
             * Récupère tous les produits
             * @returns {Promise<Array>} - Liste de tous les produits
             */
            async getAll() {
                                // super.findAll = fait appel à la méthode findAll de la classe parente
                                return await super.findAll(this.entity);
                            }

            /**
             * Récupère un produit par son ID
             * @param {number} id - ID du produit
             * @returns {Promise<Object|null>} - Le produit ou null
             */
            async getById(id) {
                                    return await super.findOne(this.entity, id);
                                }

            /**
             * Crée un nouveau produit
             * @param {Object} productData - Données du produit (nom, prix, etc.)
             * @returns {Promise<Object>} - Le produit créé avec son ID
             */
            async create(productData) {
                                            return await super.create(this.entity, productData);
                                        }

            /**
             * Met à jour un produit
             * @param {number} id - ID du produit à modifier
             * @param {Object} productData - Nouvelles données
             * @returns {Promise<Object|null>} - Produit modifié ou null
             */
            async update(id, productData) {
                                                return await super.update(this.entity, id, productData);
                                            }

            /**
             * Supprime un produit
             * @param {number} id - ID du produit à supprimer
             * @returns {Promise<boolean>} - true si supprimé
             */
            async delete(id) {
                                    return await super.delete(this.entity, id);
                                }

            /**
             * Méthode spécifique : recherche de produits par catégorie
             * @param {number} categoryId - ID de la catégorie
             * @returns {Promise<Array>} - Produits de cette catégorie
             */
            async getByCategory(categoryId) {
                                                // 1. Récupère tous les produits
                                                const allProducts = await this.getAll();
                                                
                                                // 2. Filtre pour ne garder que ceux de la catégorie demandée
                                                // filter() crée un nouveau tableau avec les éléments qui correspondent
                                                return allProducts.filter(product => product.categoryId === categoryId);
                                            }
        }

// On exporte une instance unique du modèle (singleton)
// Comme ça on n'a pas à faire "new Product()" à chaque fois
module.exports = new Produits();     