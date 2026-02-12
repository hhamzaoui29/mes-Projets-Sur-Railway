const {Contact } = require('../config/initModels');

const renderMessageNonLu = async(req, res, next)=>{
    try {
            const messagesNonLu = await Contact.count({ where: { lu: false } });
            res.locals.messagesNonLu = messagesNonLu; // disponible dans toutes les vues
            next();
        } catch (err) {
                            next(err);
                        }

}

module.exports = renderMessageNonLu;