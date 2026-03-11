/**
 * Modèle Cart - Gère les opérations du panier
 * Contrairement aux autres modèles, le panier n'est pas sauvegardé dans des fichiers JSON
 * mais dans la session de l'utilisateur (temporaire)
 */
class Cart {
            /**
             * Récupère le panier depuis la session
             * @param {Object} session - La session Express
             * @returns {Object} Le panier
             */
            static getCart(session) {
                                        // Si le panier n'existe pas dans la session, on le crée
                                        if (!session.cart) {
                                                            session.cart = {
                                                                                items: [],        // Tableau des articles
                                                                                totalItems: 0,    // Nombre total d'articles
                                                                                totalAmount: 0    // Montant total
                                                                            };
                                                            }
                                        return session.cart;
                                    }

            /**
             * Ajoute un produit au panier
             * @param {Object} session - La session Express
             * @param {Object} product - Le produit à ajouter
             * @param {number} quantity - Quantité à ajouter
             * @returns {Object} Le panier mis à jour
             */
            static addItem(session, product, quantity = 1) {
                                                                const cart = this.getCart(session);
                                                                
                                                                // Vérifier si le produit est déjà dans le panier
                                                                const existingItem = cart.items.find(item => item.productId === product.id);
                                                                
                                                                if (existingItem) {
                                                                                    // Si le produit existe déjà, on augmente la quantité
                                                                                    existingItem.quantity += quantity;
                                                                                    existingItem.totalPrice = existingItem.quantity * existingItem.price;
                                                                                    } else {
                                                                                            // Sinon, on ajoute un nouvel article
                                                                                            cart.items.push({
                                                                                                                productId: product.id,
                                                                                                                name: product.name,
                                                                                                                price: product.price,
                                                                                                                imageUrl: product.imageUrl,
                                                                                                                quantity: quantity,
                                                                                                                totalPrice: product.price * quantity
                                                                                                            });
                                                                                            }
                                                                
                                                                // Recalculer les totaux
                                                                this.recalculateTotals(cart);
                                                                
                                                                return cart;
                                                            }

            /**
             * Supprime un article du panier
             * @param {Object} session - La session Express
             * @param {number} productId - ID du produit à supprimer
             * @returns {Object} Le panier mis à jour
             */
            static removeItem(session, productId) {
                                                        const cart = this.getCart(session);
                                                        
                                                        // Filtrer pour garder tous les articles sauf celui à supprimer
                                                        cart.items = cart.items.filter(item => item.productId !== productId);
                                                        
                                                        // Recalculer les totaux
                                                        this.recalculateTotals(cart);
                                                        
                                                        return cart;
                                                    }

            /**
             * Met à jour la quantité d'un article
             * @param {Object} session - La session Express
             * @param {number} productId - ID du produit
             * @param {number} newQuantity - Nouvelle quantité
             * @returns {Object} Le panier mis à jour
             */
            static updateQuantity(session, productId, newQuantity) {
                                                                        const cart = this.getCart(session);
                                                                        
                                                                        // Trouver l'article
                                                                        const item = cart.items.find(item => item.productId === productId);
                                                                        
                                                                        if (item) {
                                                                                        if (newQuantity <= 0) {
                                                                                            // Si quantité <= 0, on supprime l'article
                                                                                            return this.removeItem(session, productId);
                                                                                        } else {
                                                                                                    // Sinon on met à jour la quantité
                                                                                                    item.quantity = newQuantity;
                                                                                                    item.totalPrice = item.quantity * item.price;
                                                                                                }
                                                                                    }
                                                                        
                                                                        // Recalculer les totaux
                                                                        this.recalculateTotals(cart);
                                                                        
                                                                        return cart;
                                                                    }

            /**
             * Vide complètement le panier
             * @param {Object} session - La session Express
             */
            static clearCart(session) {
                                            session.cart = {
                                            items: [],
                                            totalItems: 0,
                                            totalAmount: 0
                                            };
                                        }

            /**
             * Recalcule les totaux du panier
             * @param {Object} cart - Le panier à recalculer
             * @private
             */
            static recalculateTotals(cart) {
                                                // totalItems = somme des quantités de tous les articles
                                                cart.totalItems = cart.items.reduce((total, item) => total + item.quantity, 0);
                                                
                                                // totalAmount = somme des prix totaux de tous les articles
                                                cart.totalAmount = cart.items.reduce((total, item) => total + item.totalPrice, 0);
                                                
                                                // Arrondir à 2 décimales
                                                cart.totalAmount = Math.round(cart.totalAmount * 100) / 100;
                                            }
           }

module.exports = Cart;