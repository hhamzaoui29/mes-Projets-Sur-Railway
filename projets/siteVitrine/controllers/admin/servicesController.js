const {  Services } = require("../../config/initModels");

const imageManager  = require("../../utils/imageManager");

// ✅ Liste des services
const renderFormList = async (req, res) => {
                                              try {
                                                    const services = await Services.findAll({
                                                      order: [['id', 'DESC']]
                                                    });
                                                    console.log (" services = ", services)
                                                    res.render('siteVitrine/views/admin/services/formList', { services, titre: "Listes Des Services" });
                                                  } catch (err) {
                                                    res.status(500).send("Erreur affichage services : " + err.message);
                                                  }
                                            };

// ✅ Formulaire de création
const renderFormCreate= (req, res) => {
                                    res.render('siteVitrine/views/admin/services/formCreate', { titre: "Créer Un Service"});
                                  };
//*------------------------------------------------**/

// ✅ Création d’un service
const renderCreate = async (req, res) => {
                                            try {
                                                  const { titre, description } = req.body;

                                                  // 🧱 Vérification des champs obligatoires
                                                  if (!titre || !description) {
                                                                                return res.status(400).send("Titre et description sont requis.");
                                                                              }

                                                  // 🖼️ Gestion de l'image
                                                  let imagePath = null;

                                                  if (req.file) {
                                                                  // Si une image a été uploadée
                                                                  imagePath = imageManager.uploadImage(req.file, titre, true); // true = site vitrine
                                                                }

                                                  // 💾 Enregistrement en base de données
                                                  await Services.create({
                                                                          titre,
                                                                          description,
                                                                          icon: imagePath || "/images/default-service.png", // image par défaut si aucune image
                                                                        });

                                                  // 🚀 Redirection après création
                                                  res.redirect("/site/services");

                                                } catch (err) {
                                                                console.error("Erreur lors de la création du service :", err);
                                                                res.status(500).send("Erreur interne : " + err.message);
                                                              }
                                          };


/** ------------------------------------------------------ **/
// ✅ Formulaire de modification
const renderFormUpdate = async (req, res) => {
                                          try {
                                            const service = await Services.findByPk(req.params.id);
                                            if (!service) return res.status(404).send("Image introuvable");
                                            res.render('siteVitrine/views/admin/services/formUpdate', { service, titre: "Modifier Un Service" });
                                          } catch (err) {
                                            res.status(500).send("Erreur affichage édition : " + err.message);
                                          }
                                        };

// ✅ Mise à jour avec archivage
const renderUpdate = async (req, res) => {
                                            try {
                                              const { titre, description } = req.body;
                                              const service = await Services.findByPk(req.params.id);
                                              if (!service) return res.status(404).send("Service introuvable");

                                              let iconPath = service.icon;

                                              if (req.file) {
                                                // Archiver l’ancienne image avant remplacement
                                                if (service.icon) {
                                                  imageManager.archiveBeforeReplace(service.icon, req.file, service.titre);
                                                  iconPath = `/images/${service.titre}/${Date.now()}-${req.file.originalname.replace(/\s+/g, "_")}`;
                                                }
                                              }

                                                await service.update({ titre, description, icon: iconPath });

                                                res.redirect("/site/services");
                                              } catch (err) {
                                                res.status(500).send("Erreur modification service : " + err.message);
                                              }
                                            };

// ✅ Suppression avec archivage
const renderDelete = async (req, res) => {
                                            try {
                                                  const service = await Services.findByPk(req.params.id);
                                                  if (!service) return res.status(404).send("Service introuvable");

                                                  if (service.icon) {
                                                    imageManager.archiveBeforeDelete(service.icon, service.titre);
                                                  }

                                                  await Services.destroy({ where: { id: req.params.id } });

                                                  res.redirect("/site/services");
                                                } catch (err) {
                                                  res.status(500).send("Erreur suppression service : " + err.message);
                                                }
                                          };

const renderFormShow = async (req, res)=> {
                                              try {
                                                const service = await Services.findOne({
                                                                                          where: {
                                                                                                    id: req.params.id,
                                                                                                    titre: req.params.titre
                                                                                                  }
                                                                                        });
                                                console.log("service == ", service);
                                                if (!service) {
                                                  return res.status(404).send("Aucun service trouvé avec cet ID et ce titre");
                                                }

                                                // on passe le service à la vue
                                                res.render("siteVitrine/views/admin/services/fromShow", { 
                                                                                                          service,
                                                                                                          titre: service.titre 
                                                                                                        });
                                              } catch (err) {
                                                console.error("Erreur serveur :", err);
                                                res.status(500).send("Erreur serveur");
                                              }
                                            };
/**----------------------------------**/

module.exports = {
                  renderFormList,
                  renderFormShow,
                  renderFormCreate,
                  renderCreate,
                  renderFormUpdate,
                  renderUpdate,
                  renderDelete
                }