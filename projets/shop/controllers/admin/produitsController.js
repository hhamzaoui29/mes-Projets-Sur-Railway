/**
 * CONTRÔLEUR PRODUIT
 */

const Product = require('../../models/admin/produitsModel');
const Category = require('../../models/admin/categoriesModel');
const imageManager = require('../../utils/imageManager'); // ← IMPORTANT
const multer = require('multer');
const path = require('path');

// Configuration de multer pour l'upload temporaire
const upload = multer({ dest: path.join(__dirname, '../../uploads/') }).single('image');

class ProductController {
    
    /**
     * Affiche le formulaire de création
     * GET /shop/produits/formCreate
     */
    async formCreate(req, res) {
        try {
            const categories = await Category.getAll();
            
            res.render('admin/produits/formCreate', {
                title: 'Nouveau produit',
                categories: categories,
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
     * Traite la création d'un produit avec image
     * POST /shop/produits/create
     */
    async renderCreate(req, res) {
        // Utiliser multer pour gérer l'upload temporaire
        upload(req, res, async function(err) {
            if (err) {
                // Erreur d'upload
                req.session.flash = {
                    type: 'error',
                    message: err.message
                };
                return res.redirect('/shop/produits/formCreate');
            }

            try {
                // 1. Récupérer les champs du formulaire
                const { name, description, price, stock, categorieId } = req.body;
                

                // 2. VALIDATIONS
                if (!name || !name.trim()) {
                    req.session.flash = { type: 'error', message: 'Le nom est obligatoire' };
                    return res.redirect('/shop/produits/formCreate');
                }

                if (!price || price <= 0) {
                    req.session.flash = { type: 'error', message: 'Le prix doit être supérieur à 0' };
                    return res.redirect('/shop/produits/formCreate');
                }

                // 3. Générer le slug
                const slug = name.toLowerCase()
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/(^-|-$)/g, '');

                // 4. Gestion de l'image
                let imageUrl = '/public/images/placeholder.jpg';
                if (req.file) {
                    // Utiliser imageManager pour déplacer l'image vers le bon dossier
                    // Le 2ème paramètre est le dossier de destination (ex: "products")
                    imageUrl = imageManager.uploadImage(req.file, name);
                    console.log("Image uploadée:", imageUrl);
                }

                // 5. Préparer les données
                const productData = {
                    name: name.trim(),
                    slug: slug,
                    description: description || '',
                    price: parseFloat(price),
                    stock: parseInt(stock) || 0,
                    categorieId: categorieId ? parseInt(categorieId) : null,
                    imageUrl: imageUrl,
                    createdAt: new Date().toISOString()
                };

                console.log("Données produit:", productData);

                // 6. Créer le produit
                const formCreateProduct = await Product.create(productData);

                // 7. Message de succès
                req.session.flash = {
                    type: 'success',
                    message: `Produit "${formCreateProduct.name}" créé avec succès !`
                };

                res.redirect('/shop/produits');

            } catch (error) {
                console.error('ERREUR:', error);
                req.session.flash = {
                    type: 'error',
                    message: error.message
                };
                res.redirect('/shop/produits/formCreate');
            }
        });
    }
}

module.exports = new ProductController();