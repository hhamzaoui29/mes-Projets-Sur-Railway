
/******************************************************************
 * 
 ****************************************************************/
function calculerTotalGeneral(lignes) {

                                            let total = 0;

                                            lignes.forEach(ligne => {
                                                const totalLigne = ligne.quantite * ligne.prix;
                                                total += totalLigne;
                                            });

                                            return total;
                                        }

/****************************************************
 * formater 
 ***************************************************/
function formatEuro(montant) {

    return montant
        .toLocaleString("fr-FR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).replace(/\u202f/g, " ") // remplace l’espace fine insécable
        + " €";
}
/****************************************************
 * Fonction de calcul HT / TVA / TTC
 ***************************************************/
function calculerTotaux(ht, tauxTVA) {

                                        const tva = ht * tauxTVA;
                                        const ttc = ht + tva;

                                        return {
                                                    ht,
                                                    tva,
                                                    ttc
                                                };
                                    }

module.exports = {
                    calculerTotalGeneral,
                    formatEuro,
                    calculerTotaux
                 }


