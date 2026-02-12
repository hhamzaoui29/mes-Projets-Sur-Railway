

// Animation d'apparition des sections au scroll
const sections = document.querySelectorAll("section");

window.addEventListener("scroll", () => {
                                            sections.forEach(section => {
                                                                            const sectionTop = section.getBoundingClientRect().top;
                                                                            if (sectionTop < window.innerHeight - 100) {
                                                                                                                        section.classList.add("visible");
                                                                                                                        }
                                                                        });
                                        });

// Bouton de téléchargement
document.addEventListener("DOMContentLoaded", () => {
                                                        const downloadBtn = document.getElementById("download-cv");

                                                        if (downloadBtn) {
                                                                            downloadBtn.addEventListener("click", () => {
                                                                            window.print(); // Imprime la page, peut aussi servir à "enregistrer en PDF"
                                                                          });
                                                        }
                                                    });
