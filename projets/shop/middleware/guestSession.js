/**
 * Middleware qui garantit qu'un visiteur a toujours une session
 * Même sans être connecté
 */
module.exports = (req, res, next) => {
                                        // Si pas de session du tout, Express en crée une automatiquement
                                        // mais on veut s'assurer qu'elle a une structure de panier
                                        
                                        if (!req.session.cart) {
                                                                    req.session.cart = {
                                                                                            items: [],
                                                                                            totalItems: 0,
                                                                                            totalAmount: 0
                                                                                        };
                                                                }
                                        
                                        // Ajouter un identifiant de visiteur si nécessaire
                                        if (!req.session.visitorId) {
                                                                        req.session.visitorId = 'guest_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                                                                    }
                                        
                                        next();
                                    };