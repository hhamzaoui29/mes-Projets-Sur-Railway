/**
 * MODÈLE ROLES
 * Un role permet de données des autorisations aux utilisateurs
 * Exemples: Vêtements, Administrateur, client, etc.
 */

const Database = require('./dataBase');

const table = 'roles'

class Roles extends Database {
                                constructor() {
                                                super();
                                                this.entity = `${table}`; // Dossier où seront stockées les rôles
                                                console.log("Roles entity:", this.entity); // Debug
                                              }

                                /**
                                 * Récupère TOUTES les catégories
                                 */
                                async getAll() {
                                                    return await super.findAll(this.entity);
                                               }

                                /*------------------------------------*/
                                /**
                                 * Récupère UNE catégorie par son ID
                                 */
                                async getById(id) {
                                                        return await super.findOne(this.entity, id);
                                                  }

                                /*------------------------------------*/
                                /**
                                 * Crée une NOUVELLE catégorie
                                 */
                                async create(objetData) {
                                                                const data = {
                                                                                ...objetData,
                                                                                createdAt: new Date().toISOString()
                                                                             };        
                                                                return await super.create(this.entity, data);
                                                            }

                                /*------------------------------------*/
                                /**
                                 * Met à jour UNE catégorie
                                 */
                                async update(id, objetData) {
                                                                    const data = {
                                                                                    ...objetData,
                                                                                    updatedAt: new Date().toISOString()
                                                  /*-----------------------------------*/                                };
                                                                    return await super.update(this.entity, id, data);
                                                                }

                                /*------------------------------------*/
                                /**
                                 * Supprime UNE catégorie
                                 */
                                async delete(id) {
                                                    return await super.delete(this.entity, id);
                                                 }

                                /*------------------------------------*/
                                /**
                                 * Récupère les catégories parent/enfant (pour hiérarchie)
                                 * Exemple: Vêtements → T-shirts, Vêtements → Jeans
                                 */
                                async getChildren(parentId) {
                                                                const all = await this.getAll();
                                                                return all.filter(cat => cat.parentId === parentId);
                                                            }       
                            }

module.exports = new Roles();