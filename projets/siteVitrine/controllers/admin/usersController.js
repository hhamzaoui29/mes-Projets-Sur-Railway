const bcrypt = require('bcrypt');
const User = require('../../models/usesModel');

// Liste
const formList = async (req, res) => {
                                        const users = await User.findAll();
                                        res.render('siteVitrine/views/admin/users/formList', { users, titre: "Liste Des Utilisateurs" });
                                      };

// Formulaire création
const formCreate = (req, res) => {
                                    res.render('siteVitrine/views/admin/users/formCreate', {titre: "Créer Utilisateur"});
                                  };

// Créer
const create = async (req, res) => {
                                      const { nom, email, password, role } = req.body;
                                      const hashedPassword = await bcrypt.hash(password, 10);

                                      await User.create({ nom, email, password: hashedPassword, role });
                                      res.redirect('/site/users');
                                    };

// Formulaire édition
const formUpdate = async (req, res) => {
                                          const user = await User.findByPk(req.params.id);
                                          console.log('user == ',user);
                                          res.render('siteVitrine/views/admin/users/formUpdate', { user, titre: "Modifier Utilisateur"});
                                        };

// Modifier
const update = async (req, res) => {
                                      const { nom, email, password, role } = req.body;
                                      let data = { nom, email, role };

                                      if (password) {
                                        data.password = await bcrypt.hash(password, 10);
                                      }

                                      await User.update(data, { where: { id: req.params.id } });
                                      res.redirect('/site/users');
                                    };

// Supprimer
const deleteData = async (req, res) => {
                                      await User.destroy({ where: { id: req.params.id } });
                                      res.redirect('/site/users');
                                    };
module.exports = {
                    formList,
                    formCreate,
                    create,
                    formUpdate,
                    update,
                    deleteData
                 }