/**
 * MODÈLE CATÉGORIE
 * Une catégorie permet de classer les produits
 * Exemples: Vêtements, Livres, Électronique, etc.
 */

const Database = require('./dataBase');

class Category extends Database {
    constructor() {
        super();
        this.entity = 'categories'; // Dossier où seront stockées les catégories
    }

    /**
     * Récupère TOUTES les catégories
     */
    async getAll() {
        return await super.findAll(this.entity);
    }

    /**
     * Récupère UNE catégorie par son ID
     */
    async getById(id) {
        return await super.findOne(this.entity, id);
    }

    /**
     * Crée une NOUVELLE catégorie
     */
    async create(categoryData) {
        const data = {
            ...categoryData,
            createdAt: new Date().toISOString()
        };
         // Utiliser le slug comme nom de fichier personnalisé
         // Le slug est déjà nettoyé (ex: "vetements", "livres-pour-enfants")
        const customFileName = data.slug;
        return await super.create(this.entity, data);
    }

    /**
     * Met à jour UNE catégorie
     */
    async update(id, categoryData) {
        const data = {
            ...categoryData,
            updatedAt: new Date().toISOString()
        };
        return await super.update(this.entity, id, data);
    }

    /**
     * Supprime UNE catégorie
     */
    async delete(id) {
        return await super.delete(this.entity, id);
    }

    /**
     * Récupère les catégories parent/enfant (pour hiérarchie)
     * Exemple: Vêtements → T-shirts, Vêtements → Jeans
     */
    async getChildren(parentId) {
        const all = await this.getAll();
        return all.filter(cat => cat.parentId === parentId);
    }
}

module.exports = new Category();