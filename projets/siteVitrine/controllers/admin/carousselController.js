const fs = require("fs");
const path = require("path");
const { Caroussel, Galerie } = require("../../config/initModels");
const imageManager = require("../../utils/imageManager");




  const renderFormList = async (req, res) => {
                                                    try {
                                                            console.log("params ==>", req.params);
                                                            const caroussel = await Caroussel.findByPk()
                                                            const galerie = await Galerie.findByPk(req.params.galerieId, {
                                                                include: [{ model: Caroussel, as: "images" }]
                                                            });
                                                            console.log("galerie dans renderFormList dans carousselController ==", galerie);
                                                            if (!galerie) {
                                                                                return res.status(404).send("Galerie introuvable (id=" + req.params.galerieId + ")");
                                                                            }
                                                        
                                                            res.render("siteVitrine/views/admin/caroussel/formList", { 
                                                                                                            galerie, 
                                                                                                            titre: "Carrousel de la galerie" 
                                                                                                        });
                                                        } catch (err) {
                                                                        res.status(500).send("Erreur affichage carrousel : " + err.message);
                                                                    }
                                                }; 

// ✅ Ajouter une image au carrousel d’une galerie
const addImage = async (req, res) => {
                                        try {
                                                const { galerieId } = req.body;
                                                const file = req.file;

                                                if (!galerieId || !file) {
                                                return res.status(400).send("Galerie et image obligatoires");
                                                }

                                                const imagePath = imageManager.uploadImage(file, "caroussel");

                                                await Caroussel.create({
                                                image_path: imagePath,
                                                galerieId
                                                });

                                                res.redirect(`/site/galeries`); //  
                                            } catch (err) {
                                                res.status(500).send("Erreur ajout image carrousel : " + err.message);
                                            }
                                        };

// ✅ Supprimer une image du carrousel
const deleteImage = async (req, res) => {
                                            try {
                                                    const image = await Caroussel.findByPk(req.params.id);
                                                    if (!image) return res.status(404).send("Image introuvable");

                                                    imageManager.deleteImage(image.image_path);
                                                    await image.destroy();

                                                    res.redirect(`/site/galeries`);
                                                } catch (err) {
                                                    res.status(500).send("Erreur suppression image carrousel : " + err.message);
                                                }
                                            };



module.exports = { 
                    renderFormList,
                    addImage, 
                    deleteImage, 
                };
