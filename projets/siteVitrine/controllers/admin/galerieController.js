
const { Galerie, Caroussel, Services } = require('../../config/initModels');
const imageManager = require("../../utils/imageManager");

// ✅ Liste des images (côté client et admin)
const renderFormList = async (req, res) => {
                                              try {
                                                      const galeries = await Galerie.findAll({
                                                                                              include: [{ model: Caroussel, as: "images" }],
                                                                                              order: [['categorie', 'ASC'], ['id', 'DESC']],
                                                                                            });
                                                      res.render('siteVitrine/views/admin/galerie/formList', { galeries, titre: "Liste Des Galeries" });
                                                    } catch (err) {
                                                                    res.status(500).send("Erreur affichage galerie : " + err.message);
                                                                  }
                                            };

// ✅ Formulaire création
const renderFormCreate = async (req, res) => {
                                                const services = await Services.findAll({ order: [['titre', 'ASC']] }); 
                                                res.render('siteVitrine/views/admin/galerie/formCreate', { titre: "Créer Une Galerie", services });
                                              };

// ✅ Création (upload simple ou multiple)
const renderCreate = async (req, res) => {
                                            try {
                                                  const { titre, categorie, serviceId } = req.body;

                                                  // Gestion multi-upload possible si req.files
                                                  const files = req.files || (req.file ? [req.file] : []);

                                                  for (const file of files) {
                                                                              const imagePath = imageManager.uploadImage(file, categorie);
                                                                              await Galerie.create({ titre, categorie, image: imagePath, serviceId });
                                                                            }

                                                  res.redirect("/site/galeries");
                                                } catch (err) {
                                                                res.status(500).send("Erreur upload image : " + err.message);
                                                              }
                                          };

// ✅ Formulaire modification
const renderFormUpdate = async (req, res) => {
                                                  try {
                                                        const image = await Galerie.findByPk(req.params.id);
                                                        if (!image) return res.status(404).send("Image introuvable");

                                                        const services = await Services.findAll({ order: [['titre', 'ASC']] });

                                                        res.render('siteVitrine/views/admin/galerie/formUpdate', { image, services, titre: "Modifier Une Galerie" });
                                                      } catch (err) {
                                                                      res.status(500).send("Erreur affichage édition : " + err.message);
                                                                    }
                                              };
// ✅ Mise à jour avec archivage
const renderUpdate = async (req, res) => {
                                            try {
                                                    const { titre, categorie } = req.body;
                                                    const galerie = await Galerie.findByPk(req.params.id);
                                                    if (!galerie) return res.status(404).send("Galerie introuvable");

                                                    let imagePath = galerie.image;
                                                    console.log ("ImagePth == ", imagePath);

                                                    if (req.file) {
                                                                      // Archiver l’ancienne image avant remplacement
                                                                      if (galerie.image) {
                                                                                          imageManager.archiveBeforeReplace(galerie.image, req.file, galerie.titre);
                                                                                          imagePath = `images/services/${Date.now()}-${req.file.originalname.replace(/\s+/g, "_")}`;
                                                                                        }
                                                                  }

                                                    await galerie.update({ titre, categorie, image: imagePath });

                                                    res.redirect("/site/galeries");
                                                  } catch (err) {
                                                                  res.status(500).send("Erreur modification image : " + err.message);
                                                                }
                                          };
// ✅ Suppression
const renderDelete = async (req, res) => {
                                            try {
                                                  const galerie = await Galerie.findByPk(req.params.id);
                                                  if (!galerie) return res.status(404).send("Image introuvable");

                                                  imageManager.deleteImage(galerie.image);
                                                  await galerie.destroy();

                                                  res.redirect("/site/galeries");
                                                } catch (err) {
                                                  res.status(500).send("Erreur suppression de la galerie : " + err.message);
                                                }
                                          };



const renderGalerieCarousel = async (req, res) => {                                                      
                                                        try {
                                                            const galerie = await Galerie.findByPk(req.params.id, {
                                                                                                                      include: [{ model: Caroussel, as: "images" }]
                                                                                                                  });
                                                        
                                                            if (!galerie) {
                                                                            return res.status(404).send("Galerie introuvable");
                                                                           }
                                                      
                                                          res.render('siteVitrine/views/admin/galerie/formCaroussel', { galerie, titre: "Détails de la galerie" });
                                                        } catch (err) {
                                                                        res.status(500).send("Erreur affichage détails : " + err.message);
                                                                       }
                                                    };

module.exports = {
                    renderFormList,
                    renderFormCreate,
                    renderCreate,
                    renderFormUpdate,
                    renderUpdate,
                    renderDelete,
                    renderGalerieCarousel
                  };
