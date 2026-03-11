/**
 * CONTRÔLEUR CATÉGORIE
 * Gère les opérations sur les catégories
 */

const Categorie = require('../models/categoriesModel');

class CategoryController {
    
    /**
     * Affiche la liste des catégories
     * GET /shop/admin/categories
     */
    async index(req, res) {
                                try {
                                        const data = await Categorie.getAll();
                                        
                                        res.render('categories/index', {
                                                                            title: 'Gestion des catégories',
                                                                            categories: data,
                                                                            flash: req.session.flash || null,
                                                                            layout: 'layout'
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
     * Affiche le formulaire de création
     * GET /shop/admin/categories/new
     */
    async new(req, res) {
        try {
            // Récupère toutes les catégories pour le choix du parent
            const categories = await Category.getAll();
            
            res.render('shop/categories/new', {
                title: 'Nouvelle catégorie',
                categories: categories,
                flash: req.session.flash || null,
                layout: 'shop/layout'
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
     * POST /shop/admin/categories
     */
    async create(req, res) {
        try {
            const { name, description, parentId } = req.body;
            
            // Validation
            if (!name || name.trim() === '') {
                req.session.flash = {
                    type: 'error',
                    message: 'Le nom de la catégorie est obligatoire'
                };
                return res.redirect('/shop/admin/categories/new');
            }
            
            // Créer le slug
            const slug = name.toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '');
            
            const categoryData = {
                name: name.trim(),
                slug: slug,
                description: description || '',
                parentId: parentId ? parseInt(parentId) : null
            };
            
            const newCategory = await Category.create(categoryData);
            
            req.session.flash = {
                type: 'success',
                message: `Catégorie "${newCategory.name}" créée avec succès !`
            };
            
            res.redirect('/shop/admin/categories');
            
        } catch (error) {
            console.error(error);
            req.session.flash = {
                type: 'error',
                message: 'Erreur lors de la création: ' + error.message
            };
            res.redirect('/shop/admin/categories/new');
        }
    }
}

module.exports = new CategoryController();