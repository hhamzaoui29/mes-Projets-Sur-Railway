const bcrypt = require('bcrypt');
const { User} = require('../../config/initModels');
const { Contact } = require("../../config/initModels");




// Middleware de protection
const ensureAuth = (req, res, next) => {
                                            if (req.session && req.session.userId) {
                                                // utilisateur connecté → OK
                                                return next(); 
                                            }
                                            // utilisateur connecté → OK
                                            res.redirect('/site/login'); // sinon → retour page login
                                        };


// Vérifie si connecté ET login
const ensureLogin = async (req, res, next) => {
                                                    if (!req.session.userId) {
                                                        return res.redirect('/site/login');
                                                    }

                                                    const user = await User.findByPk(req.session.userId);

                                                    if (!user || user.role !== 'admin') {
                                                        return res.status(403).send("Accès interdit : réservé aux loginistrateurs");
                                                    }

                                                    next();
                                                };

// Affiche le formulaire login
const formLogin = (req, res) => {
                                    res.render('siteVitrine/views/admin/login/formLogin', { 
                                                                            error: null,
                                                                            titre: "Connexion"
                                                                        });
                                };

// Vérifie les identifiants
const login = async (req, res) => {
                                        const { email, password } = req.body;

                                        try {
                                            const user = await User.findOne({ where: { email } });
                                            if (!user) {
                                                return res.render('siteVitrine/views/admin/login/formLogin', { 
                                                                                                titre: "Connexion",
                                                                                                error: "Utilisateur introuvable"
                                                                                          });
                                            }

                                            const isMatch = await bcrypt.compare(password, user.password); 

                                            if (!isMatch) {
                                                return res.render('siteVitrine/views/admin/login/formLogin', { 
                                                                                                error: "Mot de passe incorrect",
                                                                                                titre: "Connexion"
                                                                                          });
                                            }

                                            // Auth OK -> stocke l'id en session
                                            req.session.userId = user.id;

                                            // ✅ Redirection vers dashboard
                                            res.redirect('/site/login/dashboard');

                                        } catch (error) {
                                            console.error("🔥 ERREUR login:", error);
                                            res.status(500).send("Erreur serveur");
                                        }
                                    };

// Déconnexion
const logout = (req, res) => {
                                req.session.destroy((error) => {
                                    if (error) {
                                        console.error("Erreur lors de la déconnexion :", error.message);
                                        return res.status(500).send("Erreur serveur", error.message);
                                    }
                                    res.redirect('/site/login'); // retour sur page login
                                });
                             };

// Dashboard
const formDashboard = async (req, res) => {
                                                const user = await User.findByPk(req.session.userId);
                                                // 🔴 Compter les messages non lus
                                                const nbMessagesNonLu = await Contact.count({ where: { lu: false } });

                                                res.render('siteVitrine/views/admin/login/dashboard', { 
                                                                                        nom: user.nom,
                                                                                        role: user.role,
                                                                                        nbMessagesNonLu,
                                                                                        titre: "Dashboard"
                                                                                        
                                                                                     });
                                           };


module.exports = {
                    ensureAuth,
                    ensureLogin,

                    formLogin,
                    login,
                    logout,

                    formDashboard
                 };
