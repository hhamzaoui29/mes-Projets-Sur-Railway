
async function compterTotalQuestions(contenu) {
    try {
        // Vérifier que le contenu est valide
        if (!contenu || typeof contenu !== 'object') {
            throw new Error('Le contenu doit être un objet valide');
        }

        let total = 0;
        let sections = 0;
        
        for (const section in contenu) {

                                            if (Array.isArray(contenu[section])) {
                                                                                    total += contenu[section].length;
                                                                                    sections++;
                                                                                }
                                            console.log ("compterTotalQuestions contenu =  ", total)
                                        }
        
        return {
                    total,
                    sections,
                    message: `Total de ${total} questions réparties dans ${sections} sections`
                };
        
    } catch (error) {
                        console.error('Erreur dans compterTotalQuestions:', error);
                        return {
                                    total: 0,
                                    sections: 0,
                                    error: error.message
                                };
                    }
}

/*------------------------------------------------------------------------------*/
async function validerStructureQuestionnaire(questionnaire) {
    console.log('🔍 Validation structure - début');
    console.log('📦 Type:', typeof questionnaire);
    console.log('📦 Est array?', Array.isArray(questionnaire));
    
    // Vérifier que c'est un objet
    if (typeof questionnaire !== 'object' || Array.isArray(questionnaire) || questionnaire === null) {
        console.log('❌ Ce n\'est pas un objet valide');
        return {
            valide: false,
            message: 'Le questionnaire doit être un objet avec des sections'
        };
    }
    
    const cles = Object.keys(questionnaire);
    console.log('📊 Nombre de sections:', cles.length);
    
    // Vérifier qu'il y a au moins une section
    if (cles.length === 0) {
        console.log('❌ Aucune section');
        return {
            valide: false,
            message: 'Le questionnaire doit contenir au moins une section'
        };
    }
    
    // Vérifier chaque section
    for (const [titre, questions] of Object.entries(questionnaire)) {
        console.log(`📌 Section "${titre}":`, questions);
        
        // Vérifier que les questions sont un tableau
        if (!Array.isArray(questions)) {
            console.log(`❌ La section "${titre}" n'est pas un tableau`);
            return {
                valide: false,
                message: `La section "${titre}" doit contenir un tableau de questions`
            };
        }
        
        console.log(`📊 Nombre de questions dans "${titre}":`, questions.length);
        
        // Vérifier qu'il y a au moins une question
        if (questions.length === 0) {
            console.log(`❌ Aucune question dans "${titre}"`);
            return {
                valide: false,
                message: `La section "${titre}" doit contenir au moins une question`
            };
        }
        
        // Vérifier que chaque question est une chaîne
        for (let i = 0; i < questions.length; i++) {
            if (typeof questions[i] !== 'string' || questions[i].trim() === '') {
                console.log(`❌ Question ${i+1} invalide dans "${titre}":`, questions[i]);
                return {
                    valide: false,
                    message: `La question ${i + 1} de la section "${titre}" n'est pas valide`
                };
            }
        }
    }
    
    console.log('✅ Structure valide !');
    return {
        valide: true,
        message: 'Structure valide'
    };
}
module.exports = {
                    compterTotalQuestions,
                    validerStructureQuestionnaire

};
