// config/init.js
const sequelize = require('./db');
const bcrypt = require('bcrypt');
const { User, Services, Galerie, Caroussel, Contact } = require('./initModels');

async function init() {
                          try {
                                  // Synchronisation de la base : force true = supprime et recrée toutes les tables
                                  await sequelize.sync({ force: true });

                                  console.log("📦 Base SQLite initialisée");

                                  // Création des utilisateurs avec mot de passe haché
                                  const hashedPasswordAdmin = await bcrypt.hash('admin123', 10);
                                  const hashedPasswordInvite = await bcrypt.hash('invite123', 10);

                                  await User.bulkCreate([
                                      { nom: 'Dupond', email: 'admin@artisan.com', password: hashedPasswordAdmin, role: 'admin' },
                                      { nom: 'Durand', email: 'invite@mail.com', password: hashedPasswordInvite, role: 'invite' }
                                  ]);

                                  // Tu peux ici ajouter d'autres initialisations pour Services, Galerie, etc.

                              } catch (error) {
                                                  console.error("🔥 Erreur lors de l'initialisation :", error);
                                              } finally {
                                                            await sequelize.close();
                                                            console.log("🔒 Connexion à la base fermée");
                                                        }
                      }

// Exécution
init();
