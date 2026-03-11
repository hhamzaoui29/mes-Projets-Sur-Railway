/**
 * Middleware qui rend des variables disponibles dans TOUTES les vues
 */
// viewHelpers.js
module.exports = (req, res, next) => {
                                        // Variables globales pour TOUTES les vues
                                        res.locals.shopName = process.env.SHOP_NAME || 'Ma Boutique';
                                        res.locals.currentYear = new Date().getFullYear();
                                        res.locals.siteUrl = process.env.SITE_URL || 'http://localhost:3001';
                                        
                                        // Variables selon la route ou l'utilisateur (si vous avez une session)
                                        res.locals.user = req.session?.user || null;
                                        res.locals.isAuthenticated = req.session?.isAuthenticated || false;
                                        res.locals.cartCount = req.session?.cart?.length || 0;
                                        
                                        // Fonctions utilitaires pour les vues
                                        res.locals.formatPrice = (price) => {
                                                                                return new Intl.NumberFormat('fr-FR', { 
                                                                                    style: 'currency', 
                                                                                    currency: 'EUR' 
                                                                                }).format(price);
                                                                            };

                                        // Exemple de fonction pour calculer le total du panier
                                        res.locals.getCartTotal = (cart) => {
                                                                                if (!cart || cart.length === 0) return 0;
                                                                                return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
                                                                            };
                                                                            
                                        // Fonction pour tronquer du texte (ex: description de produit)
                                        res.locals.truncateText = (text, length = 100) => {
                                                                                            if (!text) return '';
                                                                                            return text.length > length ? text.substring(0, length) + '...' : text;
                                                                                        };
                                        
                                        // Pour le titre des pages (avec valeur par défaut)
                                        res.locals.title = '';
                                        
                                        next();
                                    };

