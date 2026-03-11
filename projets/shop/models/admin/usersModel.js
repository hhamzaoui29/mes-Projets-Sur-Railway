/**
 * MODÈLE UTILISATEUR
 * Utilise la méthode create de Database.js
 */

const Database = require('./dataBase');
const bcrypt = require('bcrypt');
const fs = require('fs').promises;
const path = require('path');

class Users extends Database {

                                constructor() {
                                                    super();
                                                    this.entity = 'users';
                                                }
/** =============================================================================================================================== **/
                                /**
                                 * Récupère tous les rôles depuis roles.json
                                 */
                                async getRoles() {
                                                    try {
                                                            const rolesPath = path.join(__dirname, '..', '..', 'data', 'roles.json');
                                                            const data = await fs.readFile(rolesPath, 'utf8');
                                                            const dataParse = JSON.parse(data);
                                                            console.log ("DataParse = ", dataParse);
                                                            return dataParse;

                                                        } catch (error) {
                                                                            console.error('Erreur chargement rôles:', error);
                                                                            return [];
                                                                        }
                                                 }
/** =============================================================================================================================== **/
/**
 * Récupère le nom d'un rôle à partir de son ID
 * @param {number} roleId - L'ID du rôle
 * @returns {Promise<string>} - Le nom du rôle
 */
                                async getRoleNameById(roleId) {
                                                                const roles = await this.getRoles();
                                                                const role = roles.find(r => r.id === roleId);
                                                                return role ? role.displayName || role.name : 'Inconnu';
                                                              }

/** =============================================================================================================================== **/
                                /**
                                 * Récupère TOUS les utilisateurs
                                 * @returns {Promise<Array>} - Tableau de tous les utilisateurs (sans les mots de passe)
                                 */
                               async getAll(){
                                                    // 1. Récupérer tous les utilisateurs via Database
                                                    const users = await super.findAll(this.entity);

                                                     // 2. Pour chaque utilisateur, enlever le mot de passe
                                                    const usersWithoutPasswords = users.map(user => {
                                                                                                        const { password, ...userWithoutPassword } = user;
                                                                                                        return userWithoutPassword;
                                                                                                    });
                                                    // 3. Retourner le tableau
                                                   return usersWithoutPasswords;
                                             }

/** =============================================================================================================================== **/
/**
                                 * Récupère UN utilisateur par son ID (sans mot de passe)
                                 * @param {number} id - L'ID de l'utilisateur
                                 * @returns {Promise<Object|null>}
                                 */
                                async getById(id) {
                                                    const user = await super.findOne(this.entity, id);
                                                    if (!user) return null;
                                                    
                                                    const { password, ...userWithoutPassword } = user;
                                                    return userWithoutPassword;
                                                  }

/** =============================================================================================================================== **/
                                /**
                                 * Vérifie si un email existe déjà
                                 */
                                async emailExists(email) {
                                                            const allUsers = await super.findAll(this.entity);
                                                            return allUsers.some(user => user.email === email);
                                                        }
                                /** ============= **/
                                /**
                                 * CRÉE un nouvel utilisateur
                                 * Utilise SUPER.CREATE() de Database.js
                                 */
                                async create(userData) {
                                                            // 1. Vérifier que l'email n'existe pas déjà
                                                            const exists = await this.emailExists(userData.email);
                                                            if (exists) {
                                                                            throw new Error('Un utilisateur avec cet email existe déjà');
                                                                        }

                                                            // 2. Hacher le mot de passe
                                                            const hashedPassword = await bcrypt.hash(userData.password, 10);

                                                            // 3. Préparer les données à sauvegarder
                                                            const newUser = {
                                                                                email: userData.email.toLowerCase().trim(),
                                                                                password: hashedPassword,
                                                                                nom: userData.nom.trim(),
                                                                                prenom: userData.prenom ? userData.prenom.trim() : '',
                                                                                adresse: userData.adresse || '',
                                                                                telephone: userData.telephone || '',
                                                                                roleId: userData.roleId || 2 // 2 = client par défaut
                                                                                // ✅ Plus de createdAt ici, c'est Database.js qui l'ajoute
                                                                                // ✅ Plus de id ici, c'est Database.js qui le calcule
                                                                            };

                                                            // 4. ✅ Utiliser SUPER.CREATE() de Database.js
                                                            // C'est Database.js qui va :
                                                            // - Calculer l'ID
                                                            // - Ajouter createdAt
                                                            // - Créer le fichier 1.json, 2.json, etc.
                                                            const savedUser = await super.create(this.entity, newUser);

                                                            // 5. Retourner l'utilisateur SANS le mot de passe
                                                            const { password, ...userWithoutPassword } = savedUser;
                                                            return userWithoutPassword;
                                                       }
/** =============================================================================================================================== **/
                                /**
                                 * Met à jour un utilisateur
                                 * @param {number} id - L'ID de l'utilisateur à modifier
                                 * @param {Object} userData - Les nouvelles données
                                 * @returns {Promise<Object|null>} - L'utilisateur modifié (sans mot de passe)
                                 */
                                async update(id, userData) {
                                                                // 1. Récupérer l'utilisateur existant
                                                                const existingUser = await super.findOne(this.entity, id);
                                                                if (!existingUser) {
                                                                                        throw new Error('Utilisateur non trouvé');
                                                                                    }

                                                                // 2. Préparer les données mises à jour
                                                                const updatedData = {
                                                                                        email: userData.email ? userData.email.toLowerCase().trim() : existingUser.email,
                                                                                        nom: userData.nom ? userData.nom.trim() : existingUser.nom,
                                                                                        prenom: userData.prenom ? userData.prenom.trim() : existingUser.prenom,
                                                                                        adresse: userData.adresse !== undefined ? userData.adresse : existingUser.adresse,
                                                                                        telephone: userData.telephone !== undefined ? userData.telephone : existingUser.telephone,
                                                                                        roleId: userData.roleId ? parseInt(userData.roleId) : existingUser.roleId,
                                                                                        updatedAt: new Date().toISOString()
                                                                                    };

                                                                // 3. Si un nouveau mot de passe est fourni, le hacher
                                                                if (userData.password) {
                                                                                            updatedData.password = await bcrypt.hash(userData.password, 10);
                                                                                        }

                                                                // 4. Utiliser super.update de Database.js
                                                                const savedUser = await super.update(this.entity, id, updatedData);

                                                                // 5. Retourner l'utilisateur sans le mot de passe
                                                                const { password, ...userWithoutPassword } = savedUser;
                                                                return userWithoutPassword;
                                                            }
/** =============================================================================================================================== **/
                                /**
                                 * Supprime un utilisateur
                                 * @param {number} id - L'ID de l'utilisateur à supprimer
                                 * @returns {Promise<boolean>} - true si supprimé, false sinon
                                 */
                                async delete(id) {
                                                    // 1. Vérifier que l'utilisateur existe
                                                    const user = await super.findOne(this.entity, id);
                                                    if (!user) {
                                                                    throw new Error('Utilisateur non trouvé');
                                                                }
                                                    
                                                    // 2. Empêcher la suppression du dernier admin (optionnel mais prudent)
                                                    const allUsers = await this.getAll();
                                                    const admins = allUsers.filter(u => u.roleId === 1); // 1 = admin
                                                    
                                                    if (user.roleId === 1 && admins.length === 1) {
                                                                                                        throw new Error('Impossible de supprimer le dernier administrateur');
                                                                                                    }
                                                    
                                                    // 3. Utiliser super.delete de Database.js
                                                    return await super.delete(this.entity, id);
                                                }
/** =============================================================================================================================== **/
                                }

module.exports = new Users();