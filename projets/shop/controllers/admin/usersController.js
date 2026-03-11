/**
 * CONTRÔLEUR UTILISATEUR
 * Pour l'instant : formulaire de création et fonction create
 */

const User = require('../../models/admin/usersModel');
const Role = require('../../models/admin/rolesModel');
const table = "user";

class UserController {

                        /**
                         * Affiche la liste de tous les utilisateurs
                         * GET /shop/users
                         */
                        async index(req, res) {
                                                try {
                                                        // 1. Récupérer tous les utilisateurs
                                                        const users = await User.getAll();
                                                        
                                                        // 2. Pour chaque utilisateur, récupérer le nom du rôle
                                                        const usersWithRoleNames = await Promise.all(users.map(async (user) => {
                                                                                                                                    const roleName = await User.getRoleNameById(user.roleId);
                                                                                                                                    return {
                                                                                                                                                ...user,
                                                                                                                                                roleName: roleName
                                                                                                                                            };
                                                                                                                                }));
                                                        
                                                        // 3. Afficher la vue
                                                        res.render('admin/users/index', {
                                                                                            title: 'Gestion des utilisateurs',
                                                                                            users: usersWithRoleNames,
                                                                                            flash: req.session.flash || null,
                                                                                            layout: 'admin/layout'
                                                                                        });
                                                        
                                                    } catch (error) {
                                                                    console.error(error);
                                                                    res.status(500).render('errors/500', {
                                                                                                            title: 'Erreur',
                                                                                                            message: error.message
                                                                                                            });
                                                                    }
                                            }
/** =============================================================================================================================== **/
                        /**
                         * Affiche le formulaire de création d'utilisateur
                         * GET /shop/users/new
                         */
                        async formCreate(req, res) {
                                                        try {
                                                                // Récupérer les rôles depuis le modèle
                                                                const roles = await User.getRoles();
                                                                
                                                                res.render(`admin/users/formCreate`, {
                                                                                                    title: 'Nouvel utilisateur',
                                                                                                    roles: roles,
                                                                                                    flash: req.session.flash || null,
                                                                                                    layout: 'admin/layout'
                                                                                                });
                                                            } catch (error) {
                                                                                console.error(error);
                                                                                res.status(500).render('errors/500', {
                                                                                                                        title: 'Erreur',
                                                                                                                        message: error.message
                                                                                                                    });
                                                                            }
                                                    }

/** =============================================================================================================================== **/
    /**
                         * Traite la création d'un utilisateur
                         * POST /shop/users/create
                         */
                        async renderCreate(req, res) {
                                                        try {
                                                                // 1. Récupérer UNIQUEMENT les champs autorisés (sécurité)
                                                                const { email, password, confirmPassword, nom, prenom, adresse, telephone, roleId } = req.body;

                                                                // 2. VALIDATIONS
                                                                if (!email || !email.trim()) {
                                                                                                req.session.flash = { type: 'error', message: 'L\'email est obligatoire' };
                                                                                                return res.redirect('/shop/users/formCreate');
                                                                                            }

                                                                if (!password || password.length < 6) {
                                                                                                            req.session.flash = { type: 'error', message: 'Le mot de passe doit faire au moins 6 caractères' };
                                                                                                            return res.redirect('/shop/users/formCreate');
                                                                                                        }

                                                                if (password !== confirmPassword) {
                                                                                                        req.session.flash = { type: 'error', message: 'Les mots de passe ne correspondent pas' };
                                                                                                        return res.redirect('/shop/users/formCreate');
                                                                                                    }

                                                                if (!nom || !nom.trim()) {
                                                                                            req.session.flash = { type: 'error', message: 'Le nom est obligatoire' };
                                                                                            return res.redirect('/shop/users/formCreate');
                                                                                        }

                                                                // 3. Préparer les données
                                                                const userData = {
                                                                                    email: email.trim(),
                                                                                    password: password,
                                                                                    nom: nom.trim(),
                                                                                    prenom: prenom ? prenom.trim() : '',
                                                                                    adresse: adresse || '',
                                                                                    telephone: telephone || '',
                                                                                    roleId: roleId ? parseInt(roleId) : 2 // 2 = client par défaut
                                                                                };

                                                                // 4. Créer l'utilisateur
                                                                const newUser = await User.create(userData);

                                                                // 5. Message de succès
                                                                req.session.flash = {
                                                                                        type: 'success',
                                                                                        message: `Utilisateur ${newUser.prenom} ${newUser.nom} créé avec succès !`
                                                                                    };

                                                                // Pour l'instant on retourne au formulaire (plus tard ce sera vers la liste)
                                                                res.redirect('/shop/users');

                                                            } catch (error) {
                                                                                console.error(error);
                                                                                req.session.flash = {
                                                                                                        type: 'error',
                                                                                                        message: error.message
                                                                                                    };
                                                                                res.redirect('/shop/users/formCreate');
                                                                            }
                                                     }
/** =============================================================================================================================== **/
                        /**
                         * Affiche le formulaire d'édition d'un utilisateur
                         * GET /shop/users/edit/:id
                         */
                        async formUpdate(req, res) {
                                                        try {
                                                            const userId = parseInt(req.params.id);
                                                            
                                                            // 1. Récupérer l'utilisateur
                                                            const user = await User.getById(userId);
                                                            
                                                            if (!user) {
                                                                            req.session.flash = {
                                                                                                    type: 'error',
                                                                                                    message: 'Utilisateur non trouvé'
                                                                                                };
                                                                            return res.redirect('/shop/users');
                                                                        }
                                                            
                                                            // 2. Récupérer les rôles
                                                            const roles = await User.getRoles();
                                                            
                                                            // 3. Afficher le formulaire
                                                            res.render('admin/users/formUpdate', {
                                                                                                title: 'Modifier un utilisateur',
                                                                                                user: user,
                                                                                                roles: roles,
                                                                                                flash: req.session.flash || null,
                                                                                                layout: 'admin/layout'
                                                                                            });
                                                            
                                                            } catch (error) {
                                                                                console.error(error);
                                                                                req.session.flash = {
                                                                                                        type: 'error',
                                                                                                        message: error.message
                                                                                                    };
                                                                                res.redirect('/shop/users');
                                                                            }
                                                }

/** =============================================================================================================================== **/
                        /**
                         * Traite la modification d'un utilisateur
                         * POST /shop/users/update/:id
                         */
                        async renderUpdate(req, res) {
                                                        try {
                                                                const userId = parseInt(req.params.id);
                                                                
                                                                // 1. Récupérer UNIQUEMENT les champs autorisés
                                                                const { email, password, confirmPassword, nom, prenom, adresse, telephone, roleId } = req.body;

                                                                // 2. VALIDATIONS
                                                                if (!email || !email.trim()) {
                                                                                                req.session.flash = { type: 'error', message: 'L\'email est obligatoire' };
                                                                                                return res.redirect(`/shop/users/formUpdate/${userId}`);
                                                                                            }

                                                                if (!nom || !nom.trim()) {
                                                                                            req.session.flash = { type: 'error', message: 'Le nom est obligatoire' };
                                                                                            return res.redirect(`/shop/users/formUpdate/${userId}`);
                                                                                        }

                                                                // Si nouveau mot de passe, vérifier la confirmation
                                                                if (password && password !== confirmPassword) {
                                                                                                                req.session.flash = { type: 'error', message: 'Les mots de passe ne correspondent pas' };
                                                                                                                return res.redirect(`/shop/users/formUpdate/${userId}`);
                                                                                                            }

                                                                // 3. Préparer les données
                                                                const userData = {
                                                                                    email: email.trim(),
                                                                                    nom: nom.trim(),
                                                                                    prenom: prenom ? prenom.trim() : '',
                                                                                    adresse: adresse || '',
                                                                                    telephone: telephone || '',
                                                                                    roleId: roleId ? parseInt(roleId) : 2
                                                                                };

                                                                // Ajouter le mot de passe seulement s'il est fourni
                                                                if (password) {
                                                                                userData.password = password;
                                                                            }

                                                                // 4. Mettre à jour
                                                                const updatedUser = await User.update(userId, userData);

                                                                // 5. Message de succès
                                                                req.session.flash = {
                                                                                        type: 'success',
                                                                                        message: `Utilisateur ${updatedUser.prenom} ${updatedUser.nom} modifié avec succès !`
                                                                                    };

                                                                res.redirect('/shop/users');

                                                            } catch (error) {
                                                                                console.error(error);
                                                                                req.session.flash = {
                                                                                                        type: 'error',
                                                                                                        message: error.message
                                                                                                    };
                                                                                res.redirect(`/shop/users/formUpdate/${req.params.id}`);
                                                                            }
                                                     }
/** =============================================================================================================================== **/
/**
 * Supprime un utilisateur
 * POST /shop/admin/users/delete/:id
 */
async renderDelete(req, res) {
                            try {
                                    const userId = parseInt(req.params.id);
                                    
                                    // 1. Récupérer l'utilisateur pour le message (optionnel)
                                    const user = await User.getById(userId);
                                    
                                    if (!user) {
                                                    req.session.flash = {
                                                                            type: 'error',
                                                                            message: 'Utilisateur non trouvé'
                                                                        };
                                                    return res.redirect('/shop/users');
                                                }
                                    
                                    // 2. Empêcher de se supprimer soi-même (si connecté plus tard)
                                     if (userId === req.session.userId) {
                                                                            req.session.flash = {
                                                                                                    type: 'error',
                                                                                                    message: 'Vous ne pouvez pas vous supprimer vous-même'
                                                                                                };
                                                                            return res.redirect('/shop/users');
                                                                        }
                                    
                                    // 3. Supprimer l'utilisateur
                                    await User.delete(userId);
                                    
                                    // 4. Message de succès
                                    req.session.flash = {
                                                            type: 'success',
                                                            message: `Utilisateur ${user.prenom} ${user.nom} supprimé avec succès !`
                                                        };
                                    
                                    res.redirect('/shop/users');
                                
                                } catch (error) {
                                                    console.error(error);
                                                    req.session.flash = {
                                                                            type: 'error',
                                                                            message: error.message
                                                                        };
                                                    res.redirect('/shop/users');
                                                }
                        }
/** =============================================================================================================================== **/

}

module.exports = new UserController();