const images =  JSON.stringify(images) ;
  const carouselModal = document.getElementById('carouselModal');
  const carouselPhotos = document.getElementById('carouselPhotos');

  carouselModal.addEventListener('show.bs.modal', function(event) {
                                                                    const button = event.relatedTarget;
                                                                    const categorie = button.getAttribute('data-categorie');

                                                                    const photos = images.filter(img => img.categorie === categorie);
                                                                    carouselPhotos.innerHTML = '';

                                                                    photos.forEach((img, index) => {
                                                                                                        const active = index === 0 ? 'active' : '';
                                                                                                        carouselPhotos.innerHTML += `
                                                                                                            <div class="carousel-item ${active} text-center">
                                                                                                            <img src="${img.image}" class="img-fluid rounded shadow" alt="${img.titre}">
                                                                                                            <div class="mt-2 text-center text-white"><h5>${img.titre}</h5></div>
                                                                                                            </div>
                                                                                                        `;
                                                                                                    });
                                                                    });