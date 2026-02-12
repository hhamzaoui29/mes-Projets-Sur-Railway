const { Contact } = require("../../config/initModels");
//const imageManager = require("../../utils/imageManager");

// ✅ Liste des services
const renderFormList = async (req, res) => {
                                                try {
                                                        const page = parseInt(req.query.page) || 1;
                                                        const limit = 3;
                                                        const offset = (page - 1) * limit;
                                                    
                                                        const { count, rows: contacts } = await Contact.findAndCountAll({
                                                            order: [['createdAt', 'DESC']],
                                                            limit,
                                                            offset
                                                        });
                                                    
                                                        const totalPages = Math.ceil(count / limit);

                                                        // 🔴 Compter les messages non lus
                                                        const nbMessagesNonLu = await Contact.count({ where: { lu: false } });
                                                    
                                                        res.render('siteVitrine/views/admin/contact/formList', { 
                                                                                                        contacts, 
                                                                                                        titre: "Listes Des Contacts",
                                                                                                        currentPage: page,  
                                                                                                        totalPages, 
                                                                                                        nbMessagesNonLu
                                                                                                    });
                                                    } catch (err) {
                                                                    res.status(500).send("Erreur affichage des Contacts : " + err.message);
                                                                  }
                                            };
  
const renderFormList1 = async (req, res) => {
                                                try {
                                                      
                                                      const contacts = await Contact.findAll({
                                                                                                  order: [['id', 'DESC']]
                                                                                              });
                                                      console.log ("  = ", contacts)
                                                      res.render('siteVitrine/views/admin/contact/formList', { 
                                                                                                  contacts, 
                                                                                                  titre: "Listes Des Contacts" 
                                                                                                  });
                                                      } catch (err) {
                                                                          res.status(500).send("Erreur affichage des Contacts : " + err.message);
                                                                      }
                                              };

const renderFormContact = async (req,res) => {
                                                    try {
                                                            const contacts = await Contact.findAll({
                                                                                                        order: [['id', 'DESC']]
                                                                                                    });
                                                            console.log ("  = ", contacts)
                                                            res.render('siteVitrine/views/home/contactHome/formContact', { 
                                                                                                                contacts, 
                                                                                                                titre: "Listes Des Contacts" 
                                                                                                            });
                                                        } catch (err) {
                                                                            res.status(500).send("Erreur affichage des Contacts : " + err.message);
                                                                        }
                                                };
                
const renderCreate = async (req, res) => {
                                                try {
                                                        const { nom, email, telephone, sujet, message, website } = req.body;
                                                    
                                                        // Anti-spam : si le champ "website" est rempli => bot
                                                        if (website) {
                                                                        return res.status(400).send("Spam détecté !");
                                                                    }
                                                    
                                                        await Contact.create({ nom, email, telephone, sujet, message });
                                                    
                                                        // Message de confirmation
                                                        res.redirect('/site/vitrine');
                                                
                                                    } catch (err) {
                                                                    res.status(500).send("Erreur envoi message : " + err.message);
                                                                    }
                                            };


const deleteData = async (req, res) => {
                                            await Contact.destroy({ where: { id: req.params.id } });
                                            res.redirect('/site/contact/liste');
                                        };

const marquerCommeLu = async(req,res)=>{
                                            try {
                                                    await Contact.update(
                                                    { lu: true },
                                                    { where: { id: req.params.id } }
                                                    );
                                                    res.redirect('/site/contact/liste');
                                                } catch (err) {
                                                                    res.status(500).send("Erreur lors de la mise à jour du message : " + err.message);
                                                                }
                                      }
module.exports = {
                        renderFormList,
                        renderFormContact,
                        renderCreate,
                        deleteData,
                        marquerCommeLu
                 }