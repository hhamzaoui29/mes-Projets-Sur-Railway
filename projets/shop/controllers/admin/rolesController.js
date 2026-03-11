/**
 * CONTRÔLEUR CATÉGORIE
 * Gère les opérations sur les catégories
 */


const Roles = require('../../models/admin/rolesModel');
const table = "role";


class RolesController {
    
                        /**
                         * Affiche la liste des ROLES
                         * GET /shop/roles
                         */
                        async index(req, res) {
                                                try {
                                                        const data = await Roles.getAll();
                                                      
                                          
                                                        res.render(`admin/${table}s/index`, {
                                                                                            title: `Gestion des ${table}s`,
                                                                                            [`${table}s`]: data,
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
/*--------------------------------------------------------------*/
    /**
     * Affiche le formulaire de création
     * GET /shop/admin/Roles/formCreate
     */
    async formCreate(req, res) {
                                try {
                                        // Récupère toutes les catégories pour le choix du parent
                                        const data = await Roles.getAll();
                           
                                        res.render(`admin/${table}s/formCreate`, {
                                                                                title: `Nouveau ${table}`,
                                                                                 [`${table}s`]: data,
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

    /**
     * Crée une nouvelle catégorie
     * POST /shop/roles/create
     */
    async renderCreate(req, res) {
        try {
               
                const { name,displayName,permission, description, parentId } = req.body;
                
                // Validation
                if (!name || name.trim() === '') {
                                                    req.session.flash = {
                                                                            type: 'error',
                                                                            message: `Le nom du ${table} est obligatoire`
                                                                        };
                                                    return res.redirect(`/shop/${table}s/formCreate`);
                                                 }
                
                // Créer le slug
                const slug = name.toLowerCase()
                                 .replace(/[^a-z0-9]+/g, '-')
                                 .replace(/(^-|-$)/g, '');
                
                const RolesData = {
                                            name: name.trim(),
                                            displayName: displayName.trim(),
                                            permission: permission.trim(),
                                            slug: slug,
                                            description: description || '',
                                            parentId: parentId ? parseInt(parentId) : null
                                        };
                
                const newRoles = await Roles.create(RolesData);
                
                req.session.flash = {
                                        type: 'success',
                                        message: `${table} "${newRoles.name}" créé(e) avec succès !`
                                    };
                
                res.redirect(`/shop/${table}s`);
                
            } catch (error) {
                                console.error(error);
                                req.session.flash = {
                                                        type: 'error',
                                                        message: 'Erreur lors de la création: ' + error.message
                                                    };
                                res.redirect(`/shop/${table}s/formCreate`);
                            }
    }

/*-----------------------------------------------------------*/
    /**
     * Affiche le formulaire d'édition d'un RÔLE
     * GET /shop/Roles/formUpdate/:id
     */
    async formUpdate(req, res) {
                                try {
                                        const RolesId = parseInt(req.params.id);
                                        
                                        // Récupérer la catégorie à modifier
                                        const data = await Roles.getById(RolesId);
                                        console.log("data dans roleId = ", data);
                                        
                                        if (!data) {
                                                            req.session.flash = {
                                                                                    type: 'error',
                                                                                    message: `${table} non trouvé(e)`
                                                                                };
                                                            return res.redirect(`/shop/${table}s`);
                                                        }
                                        
                                        // Récupérer toutes les catégories pour le choix du parent
                                        const allData = await Roles.getAll();
                                        
                                        res.render(`admin/${table}s/formUpdate`, {
                                                                            title: `Modifier un(e) ${table}`,
                                                                            [`${table}`]: data,
                                                                            [`${table}s`]: allData,
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
    /**
     * Traite la modification d'un rôle
     * POST /shop/Roles/update/:id
     */
    async renderUpdate(req, res) {
                                    try {
                                            const roleId = parseInt(req.params.id);
                                            
                                            // 1. Récupérer UNIQUEMENT les champs autorisés (sécurité)
                                            const { name,displayName,permission, description, parentId } = req.body;
                                            
                                            // 2. Validation
                                            if (!name || name.trim() === '') {
                                                                                req.session.flash = {
                                                                                    type: 'error',
                                                                                    message: 'Le nom de la rôle est obligatoire'
                                                                                };
                                                                                return res.redirect(`/shop/${table}s/formUpdate/${roleId}`);
                                                                            }
                                            
                                            // 3. Vérifier que la catégorie existe
                                            const existing = await Roles.getById(roleId);
                                            if (!existing) {
                                                                req.session.flash = {
                                                                    type: 'error',
                                                                    message: `${table} non trouvée`
                                                                };
                                                                return res.redirect(`/shop/${table}s`);
                                                            }
                                        
                                            // 4. Préparer les données mises à jour
                                            const Data = {
                                                                    name: name.trim(),
                                                                    displayName: displayName.trim(),
                                                                    permission: permission.trim(),
                                                                    slug: name.toLowerCase()
                                                                              .replace(/[^a-z0-9]+/g, '-')
                                                                              .replace(/(^-|-$)/g, ''),
                                                                    description: description ? description.trim() : '',
                                                                    parentId: parentId ? parseInt(parentId) : null,
                                                                    updatedAt: new Date().toISOString()
                                                                };
                                            
                                            // 5. Sauvegarder les modifications
                                            const update = await Roles.update(roleId, Data);
                                            
                                            // 6. Message de succès
                                            req.session.flash = {
                                                type: 'success',
                                                message: `${table} "${update.name}" modifié(e) avec succès !`
                                            };
                                            
                                            res.redirect(`/shop/${table}s`);
                                            
                                         } catch (error) {
                                                            console.error(error);
                                                            req.session.flash = {
                                                                                    type: 'error',
                                                                                    message: 'Erreur lors de la modification: ' + error.message
                                                                                };
                                                            res.redirect(`/shop/${table}s/formUpdate/${req.params.id}`);
                                                         }
                                 }

/*-----------------------------------------------------------*/
/**
 * Supprime une catégorie
 * POST /shop/Roless/delete/:id
 */
async renderDelete(req, res) {
    try {
            const RolesId = parseInt(req.params.id);
            
            // 1. Vérifier que la catégorie existe
            const data = await Roles.getById(RolesId);
            if (!data) {
                req.session.flash = {
                    type: 'error',
                    message: `${table} non trouvée`
                };
                return res.redirect(`/shop/${table}s`);
            }
            
            // 2. Supprimer
            await Roles.delete(RolesId);
            
            // 3. Message de succès
            req.session.flash = {
                type: 'success',
                message: `${table} "${data.name}" supprimé(e) avec succès !`
            };
            
            res.redirect(`/shop/${table}s`);
        
        } catch (error) {
                            console.error(error);
                            req.session.flash = {
                                                    type: 'error',
                                                    message: 'Erreur lors de la suppression: ' + error.message
                                                };
                            res.redirect(`/shop/${table}s`);
                        }
}

}

module.exports = new RolesController();