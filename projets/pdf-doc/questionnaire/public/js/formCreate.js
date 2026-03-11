
// ==================== VARIABLES GLOBALES ====================
let compteurSection = 0;

// ==================== GESTION DES TABS ====================
function switchTab(mode) {
    // Mettre à jour les classes des tabs
    document.getElementById('tab-step').classList.remove('active');
    document.getElementById('tab-json').classList.remove('active');
    document.getElementById(`tab-${mode}`).classList.add('active');
    
    // Mettre à jour les contenus
    document.getElementById('mode-step').classList.remove('active');
    document.getElementById('mode-json').classList.remove('active');
    document.getElementById(`mode-${mode}`).classList.add('active');
}

// ==================== MODE ÉTAPE PAR ÉTAPE ====================
function ajouterSection() {
    compteurSection++;


    
    const sectionsDiv = document.getElementById('sections');
    
    const sectionDiv = document.createElement('div');
    sectionDiv.className = 'section-card';
    sectionDiv.id = `section-${compteurSection}`;
    
    sectionDiv.innerHTML = `
        <div class="section-header">
            <input type="text" 
                    class="titre-section" 
                    placeholder="Titre de la section (ex: 1/- Compétences techniques)"
                    data-section="${compteurSection}">
            <button type="button" class="btn-supprimer" onclick="supprimerSection(${compteurSection})">
                Supprimer
            </button>
        </div>
        
        <div class="questions-list" id="questions-${compteurSection}">
            <!-- Les questions seront ajoutées ici -->
        </div>
        
        <button type="button" class="btn-ajouter-question" onclick="ajouterQuestion(${compteurSection})">
            ➕ Ajouter une question
        </button>
    `;
    
    sectionsDiv.appendChild(sectionDiv);
    ajouterQuestion(compteurSection); // Ajouter une première question
}

function supprimerSection(sectionId) {
    const section = document.getElementById(`section-${sectionId}`);
    section.remove();
}

function ajouterQuestion(sectionId) {
    const questionsDiv = document.getElementById(`questions-${sectionId}`);
    const questionCount = questionsDiv.children.length + 1;
    
    const questionDiv = document.createElement('div');
    questionDiv.className = 'question-item';
    
    questionDiv.innerHTML = `
        <input type="text" 
                class="question-text" 
                placeholder="Question ${questionCount}"
                data-section="${sectionId}">
        <button type="button" class="btn-supprimer-question" onclick="this.parentElement.remove()">
            ✕
        </button>
    `;
    
    questionsDiv.appendChild(questionDiv);
}

function construireJsonDepuisStep() {
    const nomFichier = document.getElementById('nomFichier').value;
    if (!nomFichier) {
        alert('Veuillez saisir un nom de fichier');
        return null;
    }

    let nomFichierFinal = nomFichier;
    if (!nomFichierFinal.endsWith('.json')) {
        nomFichierFinal += '.json';
    }

    const questionnaire = {};
    const sections = document.querySelectorAll('.section-card');
    
    if (sections.length === 0) {
        alert('Veuillez ajouter au moins une section');
        return null;
    }

    let sectionCount = 0;
    sections.forEach((section) => {
        sectionCount++;
        
        const titreInput = section.querySelector('.titre-section');
        let titre = titreInput.value.trim();
        
        if (!titre) {
            titre = `${sectionCount}/- Section ${sectionCount}`;
        } else if (!titre.match(/^\d+\/-/)) {
            titre = `${sectionCount}/- ${titre}`;
        }
        
        const questions = [];
        section.querySelectorAll('.question-text').forEach(question => {
            const texte = question.value.trim();
            if (texte) {
                questions.push(texte);
            }
        });
        
        if (questions.length > 0) {
            questionnaire[titre] = questions;
        }
    });

    if (Object.keys(questionnaire).length === 0) {
        alert('Veuillez ajouter au moins une question');
        return null;
    }

    return {
        nomFichier: nomFichierFinal,
        contenu: questionnaire
    };
}

function genererDepuisStep() {
    const data = construireJsonDepuisStep();
    if (!data) return;

    if (confirm('Voulez-vous créer ce questionnaire ?')) {
        document.getElementById('nomFichierFinal').value = data.nomFichier;
        document.getElementById('contenuFinal').value = JSON.stringify(data.contenu, null, 2);
        document.getElementById('formEnvoi').submit();
    }
}

function convertStepToJson() {
    const data = construireJsonDepuisStep();
    if (!data) return;

    // Passer en mode JSON
    switchTab('json');
    
    // Remplir le champ JSON
    document.getElementById('nomFichierJson').value = data.nomFichier;
    document.getElementById('contenuJson').value = JSON.stringify(data.contenu, null, 2);
    
    // Afficher l'aperçu
    afficherPreviewJson(data.contenu);
}

// ==================== MODE JSON DIRECT ====================
function formatJson() {
    const contenu = document.getElementById('contenuJson').value;
    try {
        const json = JSON.parse(contenu);
        document.getElementById('contenuJson').value = JSON.stringify(json, null, 2);
        afficherPreviewJson(json);
    } catch (e) {
        alert('JSON invalide : ' + e.message);
    }
}

function afficherPreviewJson(json) {
    const preview = document.getElementById('jsonPreview');
    const previewContent = document.getElementById('jsonPreviewContent');
    preview.style.display = 'block';
    previewContent.textContent = JSON.stringify(json, null, 2);
}

function genererDepuisJson() {
    const nomFichier = document.getElementById('nomFichierJson').value;
    const contenu = document.getElementById('contenuJson').value;

    if (!nomFichier || !contenu) {
        alert('Veuillez remplir tous les champs');
        return;
    }

    try {
        // Valider le JSON
        const jsonValide = JSON.parse(contenu);
        
        // Valider la structure (optionnel)
        if (typeof jsonValide !== 'object' || Array.isArray(jsonValide)) {
            alert('Le JSON doit être un objet avec des sections');
            return;
        }

        if (confirm('Voulez-vous créer ce questionnaire ?')) {
            let nomFichierFinal = nomFichier;
            if (!nomFichierFinal.endsWith('.json')) {
                nomFichierFinal += '.json';
            }

            document.getElementById('nomFichierFinal').value = nomFichierFinal;
            document.getElementById('contenuFinal').value = JSON.stringify(jsonValide, null, 2);
            document.getElementById('formEnvoi').submit();
        }

    } catch (e) {
        alert('JSON invalide : ' + e.message);
    }
}

function convertJsonToStep() {
    const contenu = document.getElementById('contenuJson').value;
    
    try {
        const json = JSON.parse(contenu);
        
        // Vérifier que c'est un objet
        if (typeof json !== 'object' || Array.isArray(json)) {
            alert('Le JSON doit être un objet avec des sections');
            return;
        }

        // Vider les sections existantes
        document.getElementById('sections').innerHTML = '';
        compteurSection = 0;

        // Reconstruire l'interface
        for (const [titre, questions] of Object.entries(json)) {
            if (!Array.isArray(questions)) {
                alert(`La section "${titre}" ne contient pas un tableau de questions`);
                return;
            }

            compteurSection++;
            ajouterSection();
            
            // Remplir le titre
            const sectionDiv = document.getElementById(`section-${compteurSection}`);
            const titreInput = sectionDiv.querySelector('.titre-section');
            titreInput.value = titre;
            
            // Supprimer la question par défaut
            const questionsDiv = document.getElementById(`questions-${compteurSection}`);
            questionsDiv.innerHTML = '';
            
            // Ajouter les questions
            questions.forEach(question => {
                if (typeof question !== 'string') {
                    alert(`La question "${question}" n'est pas valide`);
                    return;
                }
                
                ajouterQuestion(compteurSection);
                const questionInput = document.querySelector(`#section-${compteurSection} .question-item:last-child input`);
                if (questionInput) {
                    questionInput.value = question;
                }
            });
        }

        // Copier le nom du fichier
        const nomFichier = document.getElementById('nomFichierJson').value;
        document.getElementById('nomFichier').value = nomFichier;

        // Passer en mode étape
        switchTab('step');

    } catch (e) {
        alert('JSON invalide : ' + e.message);
    }
}

// ==================== CHARGEMENT DES DONNÉES EXISTANTES ====================
function chargerDonneesExistantes(donnees) {
    if (!donnees) return;
    
    try {
        if (donnees.contenu) {
            let questionnaire;
            if (typeof donnees.contenu === 'string') {
                questionnaire = JSON.parse(donnees.contenu);
            } else {
                questionnaire = donnees.contenu;
            }
            
            // Mode étape par étape
            document.getElementById('sections').innerHTML = '';
            compteurSection = 0;
            
            for (const [titre, questions] of Object.entries(questionnaire)) {
                compteurSection++;
                ajouterSection();
                
                const sectionDiv = document.getElementById(`section-${compteurSection}`);
                const titreInput = sectionDiv.querySelector('.titre-section');
                titreInput.value = titre;
                
                const questionsDiv = document.getElementById(`questions-${compteurSection}`);
                questionsDiv.innerHTML = '';
                
                questions.forEach(question => {
                    ajouterQuestion(compteurSection);
                    const questionInput = document.querySelector(`#section-${compteurSection} .question-item:last-child input`);
                    if (questionInput) {
                        questionInput.value = question;
                    }
                });
            }
            
            // Mode JSON
            document.getElementById('contenuJson').value = JSON.stringify(questionnaire, null, 2);
        }
        
        if (donnees.nomFichier) {
            document.getElementById('nomFichier').value = donnees.nomFichier;
            document.getElementById('nomFichierJson').value = donnees.nomFichier;
        }
    } catch (e) {
        console.error('Erreur chargement données:', e);
    }
}

// ==================== INITIALISATION ====================
window.onload = function() {
    // Ajouter une première section
    ajouterSection();
    
    // Charger les données existantes si présentes
        if (locals.donnees) { 
        chargerDonneesExistantes(- JSON.stringify(donnees) );
        } 
};