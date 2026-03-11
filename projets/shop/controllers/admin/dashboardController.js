/**
 * CONTRÔLEUR DASHBOARD
 * Affiche les statistiques et résumés
 */

const Users      = require('../../models/admin/usersModel');
const Products   = require('../../models/admin/produitsModel');
const Categories = require('../../models/admin/categoriesModel');
const Roles      = require('../../models/admin/rolesModel');

class DashboardController {
    
    /**
     * Affiche le tableau de bord
     * GET /shop/admin/dashboard
     */
    async index(req, res) {

                console.log("=".repeat(50));
                console.log("🔵 DASHBOARD CONTROLLER - index() appelé");
                console.log("🔵 URL appelée:", req.originalUrl);
                console.log("🔵 Méthode:", req.method);
                console.log("=".repeat(50));

                            try {
                                    // 1. Récupérer les statistiques
                                    const users = await Users.getAll();
                                    const products = await Products.getAll();
                                    const categories = await Categories.getAll();
                                    const roles = await Roles.getAll();

                                    // 2. Compter les utilisateurs par rôle
                                    const usersByRole = {};
                                    for (const role of roles) {
                                                                const count = users.filter(u => u.roleId === role.id).length;
                                                                usersByRole[role.name] = count;
                                                            }

                                    // 3. Statistiques des produits
                                    const totalStock = products.reduce((sum, p) => sum + (p.stock || 0), 0);
                                    const outOfStock = products.filter(p => !p.stock || p.stock === 0).length;
                                    const totalValue = products.reduce((sum, p) => sum + (p.price * (p.stock || 0)), 0);

                                    // 4. Derniers utilisateurs inscrits
                                    const recentUsers = [...users].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                                                                .slice(0, 5)
                                                                .map(u => {
                                                                                const { password, ...userWithoutPassword } = u;
                                                                                return userWithoutPassword;
                                                                            });

                                    // 5. Produits les plus récents
                                    const recentProducts = [...products]
                                        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                                        .slice(0, 5);

                                    // 6. Statistiques des catégories
                                    const categoriesWithCount = categories.map(cat => {
                                                                                            const count = products.filter(p => p.categoryId === cat.id).length;
                                                                                            return {
                                                                                                        ...cat,
                                                                                                        productCount: count
                                                                                                    };
                                                                                        });

                                    // 7. Rendre la vue
                                    res.render('admin/dashboards/dashboard', {
                                                                            title: 'Tableau de bord',
                                                                            layout: 'admin/layout',
                                                                            stats: {
                                                                                totalUsers: users.length,
                                                                                totalProducts: products.length,
                                                                                totalCategories: categories.length,
                                                                                totalRoles: roles.length,
                                                                                totalStock,
                                                                                outOfStock,
                                                                                totalValue: totalValue.toFixed(2)
                                                                            },
                                                                            usersByRole,
                                                                            recentUsers,
                                                                            recentProducts,
                                                                            categoriesWithCount
                                                                        });

                                } catch (error) {
                                                    console.error('Erreur dashboard:', error);
                                                    res.status(500).render('errors/500', {
                                                                                            title: 'Erreur',
                                                                                            message: error.message
                                                                                        });
                                                }
                          }
}

module.exports = new DashboardController();