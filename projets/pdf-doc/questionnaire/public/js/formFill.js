
        let totalQuestions =  questionCount ;
        let repondues = 0;

        // Initialisation
        document.addEventListener('DOMContentLoaded', function() {
            updateStats();
            
            // Ajouter l'écouteur sur tous les champs
            document.querySelectorAll('.question-input').forEach(input => {
                input.addEventListener('input', updateProgress);
            });
        });

        // Fonction pour ouvrir/fermer les sections
        function toggleSection(sectionIndex) {
            const content = document.getElementById(`content-${sectionIndex}`);
            const toggle = document.getElementById(`toggle-${sectionIndex}`);
            const header = document.querySelector(`#section-${sectionIndex} .section-header`);
            
            content.classList.toggle('collapsed');
            header.classList.toggle('collapsed');
        }

        // Mettre à jour la progression
        function updateProgress() {
                                        let repondues = 0;
                                        
                                        document.querySelectorAll('.question-input')
                                                .forEach(input => {
                                                                if (input.value.trim() !== '') {
                                                                    repondues++;
                                                                }
                                                            });
                                        
                                        const pourcentage = (repondues / totalQuestions) * 100;
                                        document.getElementById('progressFill').style.width = pourcentage + '%';
                                        document.getElementById('totalQuestions').innerHTML = `❓ ${repondues}/${totalQuestions} question(s)`;
                                    }

        // Valider le formulaire
        function validateForm() {
            let toutesRemplies = true;
            let premierChampVide = null;
            
            document.querySelectorAll('.question-input').forEach(input => {
                if (input.value.trim() === '') {
                    toutesRemplies = false;
                    input.style.borderColor = '#ff4444';
                    if (!premierChampVide) {
                        premierChampVide = input;
                    }
                } else {
                    input.style.borderColor = '#e0e0e0';
                }
            });
            
            if (!toutesRemplies) {
                alert('Veuillez répondre à toutes les questions avant d\'envoyer le formulaire.');
                if (premierChampVide) {
                    premierChampVide.focus();
                    // Ouvrir la section contenant le champ vide
                    const section = premierChampVide.closest('.section-content');
                    if (section && section.classList.contains('collapsed')) {
                        const sectionId = section.id.replace('content-', '');
                        toggleSection(parseInt(sectionId));
                    }
                }
                return false;
            }
            
            return confirm('Voulez-vous envoyer vos réponses ?');
        }

        // Raccourci clavier pour soumettre (Ctrl+Enter)
        document.addEventListener('keydown', function(e) {
            if (e.ctrlKey && e.key === 'Enter') {
                if (validateForm()) {
                    document.getElementById('reponseForm').submit();
                }
            }
        });
  