


const renderCvForm = async (req, res) => {

                                                try {
                                                        res.render('composants/views/composants/formCv', {title : "Curuculium Vitae "});
                                                    } catch (error) {
                                                        
                                                                    res.status(500).send({
                                                                                            success: false,
                                                                                            message: `cvController.js `+ `Une erreur est survenue lors de l'affichage du cv : ${error.message}`,
                                                                                        });
                                                                    }
                                            };


//** ============================================================================================================================================== **/

const renderHorlogeForm = async(req, res)=>{
                                                try {

                                                        res.render('composants/views/formHorloge', { title: "Horloge"});
                                                        
                                                    } catch (error) {
                                                                            console.error(`Erreur lors de l'affichage de l'horloge : ${error.message}`);
                                                                            res.status(500).send(`Erreur lors de l’horloge`);
                                                                    }
                                            }

module.exports = {  
                    renderCvForm,
                    renderHorlogeForm
                }