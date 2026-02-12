
const { Caroussel, Galerie, Services } = require("../../config/initModels");


const formPageAceuil = async (req, res) => {
                                                try {
                                                        const services = await Services.findAll();
                                                        const galeries = await Galerie.findAll();
                                                        //const testimonials = await testimonial.findAll();
                                                        //console.log ("services = ", services);
                                                        res.render('siteVitrine/views/home/formHome', {
                                                                                                services, 
                                                                                                galeries, 
                                                                                                titre: "Page d'Acceuil"
                                                                                                //testimonials, 
                                                                                                
                                                                                            }); // rend index.ejs
                                                    } catch (error) {
                                                        console.error("Erreur :", error);
                                                        res.status(500).send("Erreur serveur");
                                                    }3000
                                                };
                                                 
const formPageServices = async (req, res) => {
                                                try {
                                                        const services = await Services.findAll();
                                                        res.render('siteVitrine/views/home/servicesHome/formPageServicesHome', {
                                                                                                services,  
                                                                                                titre: "Page des Services"
                                                                                        
                                                                                            }); 
                                                    } catch (error) {
                                                        console.error("Erreur :", error);
                                                        res.status(500).send("Erreur serveur");
                                                    }
                                                    
                                            };    
        
const formPageServiceDetail = async (req, res) => {
                                                    try {
                                                        const service = await Services.findByPk(req.params.id);
                                                        console.log("formPageServiceDetail === ",service);
                                                        3000
                                                        if (!service) {
                                                        return res.status(404).send("Aucun service trouvé avec cet ID et ce titre");
                                                        }

                                                        // on passe le service à la vue
                                                        res.render("siteVitrine/views/home/servicesHome/formDetailServiceHome", { 
                                                                                                    service, 
                                                                                                    titre: "Page Détail" 
                                                                                                });
                                                    } catch (err) {
                                                        console.error("Erreur serveur :", err);
                                                        res.status(500).send("Erreur serveur");
                                                    }
                                                 };
                                            
                                            

const formPageRealisations = async(req, res) => {
                                                    try {
                                                            const galeries = await Galerie.findAll();
                                                            res.render('siteVitrine/views/home/galerieHome/formPageRealisationsHome', {
                                                                                                    galeries,  
                                                                                                    titre: "Page des Réalisations"
                                                                                            
                                                                                                }); 
                                                        } catch (error) {
                                                            console.error("Erreur :", error);
                                                            res.status(500).send("Erreur serveur");
                                                        }
                                                };

const formCarousel = async (req, res) => {     
                                            try {
                                                    const galerie = await Galerie.findByPk(req.params.id, {
                                                    include: [{ model: Caroussel, as: "images" }]
                                                    });

                                                    console.log("iamge caroussel == ", galerie);
                                                
                                                    if (!galerie) {
                                                    return res.status(404).send("Galerie introuvable");
                                                    }
                                                
                                                    res.render('siteVitrine/views/home/galerieHome/formCarousselHome', { 
                                                                                                                            galerie, 
                                                                                                                            titre: "Caroussel" 
                                                                                                                        });
                                                } catch (err) {
                                                    res.status(500).send("Erreur affichage détails : " + err.message);
                                                }
                                          };                                       
                                    
module.exports = {
                        formPageAceuil,
                        formPageRealisations,
                        formPageServiceDetail,
                        formPageServices,
                        formCarousel
                    }
