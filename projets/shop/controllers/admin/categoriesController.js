/**
 * CONTRÔLEUR CATÉGORIE
 * Gère les opérations sur les catégories
 */

const Categorie = require('../../models/admin/categoriesModel');

class CategorieController {
    
    /**
     * Affiche la liste des catégories
     * GET /shop/categories
     */
    async index(req, res) {
                            try {
                                    const data = await Categorie.getAll();
                                    
                                    res.render('admin/categories/index', {
                                                                        title: 'Gestion des catégories',
                                                                        categories: data,
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
     * GET /shop/categories/new
     */
    async formCreate(req, res) {
                                try {
                                        // Récupère toutes les catégories pour le choix du parent
                                        const data = await Categorie.getAll();
                                        
                                        res.render('admin/categories/formCreate', {
                                                                                title: 'Nouvelle catégorie',
                                                                                categories: data,
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
     * POST /shop/categories
     */
    async renderCreate(req, res) {
        try {
               
                const { name, description, parentId } = req.body;
                
                // Validation
                if (!name || name.trim() === '') {
                                                    req.session.flash = {
                                                                            type: 'error',
                                                                            message: 'Le nom de la catégorie est obligatoire'
                                                                        };
                                                    return res.redirect('/shop/categories/formCreate');
                                                 }
                
                // Créer le slug
                const slug = name.toLowerCase()
                                 .replace(/[^a-z0-9]+/g, '-')
                                 .replace(/(^-|-$)/g, '');
                
                const categorieData = {
                                            name: name.trim(),
                                            slug: slug,
                                            description: description || '',
                                            parentId: parentId ? parseInt(parentId) : null
                                        };
                
                const newCategorie = await Categorie.create(categorieData);
                
                req.session.flash = {
                                        type: 'success',
                                        message: `Catégorie "${newCategorie.name}" créée avec succès !`
                                    };
                
                res.redirect('/shop/categories');
                
            } catch (error) {
                                console.error(error);
                                req.session.flash = {
                                                        type: 'error',
                                                        message: 'Erreur lors de la création: ' + error.message
                                                    };
                                res.redirect('/shop/categories/formCreate');
                            }
    }

/*-----------------------------------------------------------*/
    /**
     * Affiche le formulaire d'édition d'une catégorie
     * GET /shop/categories/edit/:id
     */
    async formUpdate(req, res) {
                                try {
                                        const categorieId = parseInt(req.params.id);
                                        
                                        // Récupérer la catégorie à modifier
                                        const data = await Categorie.getById(categorieId);
                                        
                                        if (!data) {
                                                            req.session.flash = {
                                                                type: 'error',
                                                                message: 'Catégorie non trouvée'
                                                            };
                                                            return res.redirect('/shop/categories');
                                                        }
                                        
                                        // Récupérer toutes les catégories pour le choix du parent
                                        const allCategories = await Categorie.getAll();
                                        
                                        res.render('admin/categories/formUpdate', {
                                                                            title: 'Modifier une catégorie',
                                                                            categorie: data,
                                                                            categories: allCategories,
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
     * Traite la modification d'une catégorie
     * POST /shop/categories/update/:id
     */
    async renderUpdate(req, res) {
                                    try {
                                            const categoryId = parseInt(req.params.id);
                                            
                                            // 1. Récupérer UNIQUEMENT les champs autorisés (sécurité)
                                            const { name, description, parentId } = req.body;
                                            
                                            // 2. Validation
                                            if (!name || name.trim() === '') {
                                                                                req.session.flash = {
                                                                                    type: 'error',
                                                                                    message: 'Le nom de la catégorie est obligatoire'
                                                                                };
                                                                                return res.redirect(`/shop/categories/formUpdate/${categoryId}`);
                                                                            }
                                            
                                            // 3. Vérifier que la catégorie existe
                                            const existingCategory = await Categorie.getById(categoryId);
                                            if (!existingCategory) {
                                                                        req.session.flash = {
                                                                            type: 'error',
                                                                            message: 'Catégorie non trouvée'
                                                                        };
                                                                        return res.redirect('/shop/categories');
                                                                    }
                                        
                                            // 4. Préparer les données mises à jour
                                            const categoryData = {
                                                                    name: name.trim(),
                                                                    slug: name.toLowerCase()
                                                                        .replace(/[^a-z0-9]+/g, '-')
                                                                        .replace(/(^-|-$)/g, ''),
                                                                    description: description ? description.trim() : '',
                                                                    parentId: parentId ? parseInt(parentId) : null,
                                                                    updatedAt: new Date().toISOString()
                                                                };
                                            
                                            // 5. Sauvegarder les modifications
                                            const updatedCategory = await Categorie.update(categoryId, categoryData);
                                            
                                            // 6. Message de succès
                                            req.session.flash = {
                                                type: 'success',
                                                message: `Catégorie "${updatedCategory.name}" modifiée avec succès !`
                                            };
                                            
                                            res.redirect('/shop/categories');
                                            
                                         } catch (error) {
                                                            console.error(error);
                                                            req.session.flash = {
                                                                                    type: 'error',
                                                                                    message: 'Erreur lors de la modification: ' + error.message
                                                                                };
                                                            res.redirect(`/shop/categories/edit/${req.params.id}`);
                                                         }
                                 }

/*-----------------------------------------------------------*/
/**
 * Supprime une catégorie
 * POST /shop/categories/delete/:id
 */
async renderDelete(req, res) {
    try {
            const categorieId = parseInt(req.params.id);
            
            // 1. Vérifier que la catégorie existe
            const data = await Categorie.getById(categorieId);
            if (!data) {
                req.session.flash = {
                    type: 'error',
                    message: 'Catégorie non trouvée'
                };
                return res.redirect('/shop/categories');
            }
            
            // 2. Supprimer
            await Categorie.delete(categorieId);
            
            // 3. Message de succès
            req.session.flash = {
                type: 'success',
                message: `Catégorie "${data.name}" supprimée avec succès !`
            };
            
            res.redirect('/shop/categories');
        
        } catch (error) {
                            console.error(error);
                            req.session.flash = {
                                                    type: 'error',
                                                    message: 'Erreur lors de la suppression: ' + error.message
                                                };
                            res.redirect('/shop/categories');
                        }
}

}

module.exports = new CategorieController();