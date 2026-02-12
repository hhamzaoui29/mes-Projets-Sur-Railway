



const formPortfolio = async (req, res) => {          


                                                    try {
                                                        
                                                        res.render('portfolio/views/portfolio',{ 
                                                                                        
                                                                                                    title: 'PortFolio'
                                                                                                });
                                                                                    
                                                    } catch (error) {
                                                        
                                                                    res.status(500).send({
                                                                                            success: false,
                                                                                            message: `portfolioController.js `+ `Une erreur est survenue lors de l'affichage du PortFolio : ${error.message}`,
                                                                                        });
                                                                    }
                                             };

module.exports = {  
                    formPortfolio
                 }