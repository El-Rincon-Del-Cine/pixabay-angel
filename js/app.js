if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('../sw.js')
            .then((registration) => {
                console.log('Service Worker registrado', registration.scope);

                // Solicita permiso para las notificaciones al cargar la página
                if (Notification.permission === "default") {
                    Notification.requestPermission().then(permission => {
                        if (permission === "granted") {
                            registration.active?.postMessage({ type: 'SHOW_NOTIFICATION' });
                        }
                    });
                } else if (Notification.permission === "granted") {
                    registration.active?.postMessage({ type: 'SHOW_NOTIFICATION' });
                }
            })
            .catch((error) => {
                console.log('Error al registrar el Service Worker:', error);
            });
    });
}

const apiKey = '49289919-e711188a26aff37e0277420d1';
const inputCaja = document.getElementById('caja');
const btnBuscar = document.getElementById('btn');
const resultadoImagenes = document.getElementById('imageResult');
const favoritesContainer = document.createElement('div');
favoritesContainer.id = 'favorites-container';
favoritesContainer.style.display = 'none';
favoritesContainer.innerHTML = '<h2>Favoritos</h2><div id="favorites-grid" class="row row-cols-1 row-cols-md-3 g-4"></div>';
document.body.appendChild(favoritesContainer);

btnBuscar.addEventListener('click', function () {
    const terminoBusqueda = inputCaja.value.trim();
    if (terminoBusqueda) {
        buscarImagenes(terminoBusqueda);
    } else {
        alert("Por favor, ingresa un término de búsqueda.");
    }
});

async function buscarImagenes(termino) {
    const url = `https://pixabay.com/api/?key=${apiKey}&q=${encodeURIComponent(termino)}&image_type=photo&pretty=true`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error("Error al conectar con la API");
        }
        const data = await response.json();
        if (!data.hits || data.hits.length === 0) {
            resultadoImagenes.innerHTML = `<p class="text-danger">No se encontraron imágenes.</p>`;
        } else {
            mostrarListaImagenes(data.hits);
        }
    } catch (error) {
        resultadoImagenes.innerHTML = `<p class="text-danger">${error.message}</p>`;
    }
}

function mostrarListaImagenes(imagenes) {
    resultadoImagenes.innerHTML = '';
    imagenes.forEach(imagen => {
        const col = document.createElement('div');
        col.classList.add('col');
        col.innerHTML = `
            <div class="card h-100 shadow-lg text-center">
                <img src="${imagen.previewURL}" class="card-img-top" alt="Imagen">
                <div class="card-body">
                    <p class="card-text">${imagen.tags}</p>
                    <button class="btn btn-primary" onclick="mostrarImagen('${imagen.largeImageURL}', '${imagen.tags}', ${imagen.imageWidth}, ${imagen.imageHeight}, '${imagen.user}', '${imagen.pageURL}', '${imagen.id}')">
                        Ver Detalles
                    </button>
                </div>
            </div>
        `;
        resultadoImagenes.appendChild(col);
    });
}

function mostrarImagen(url, tags, width, height, user, pageURL, id) {
    resultadoImagenes.innerHTML = `
        <div class="card text-white bg-dark shadow-lg p-4">
            <div class="card-body text-center">
                <h3 class="card-title">${tags}</h3>
                <img src="${url}" class="img-fluid hero-img mb-3" alt="Imagen relacionada">
                <p><strong>Resolución:</strong> ${width} x ${height} px</p>
                <p><strong>Fotógrafo:</strong> <a href="${pageURL}" target="_blank" class="text-light">${user}</a></p>
                <button class="btn btn-success mt-3" onclick="downloadImage('${url}', 'imagen_${id}.jpg')">
                    <i class="fas fa-download"></i> Descargar
                </button>
                <button class="btn btn-warning mt-3" onclick="addToFavorites({ id: '${id}', urls: { small: '${url}', full: '${url}' }, alt_description: '${tags}' })">
                    <i class="fas fa-star"></i> Añadir a Favoritos
                </button>
                <button class="btn btn-secondary mt-3" onclick="window.location.reload()">Volver</button>
            </div>
        </div>
    `;
}

async function downloadImage(url, filename) {
    try {
        const response = await fetch(url);
        const blob = await response.blob();
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (error) {
        console.error('Error descargando la imagen:', error);
    }
}

function addToFavorites(image) {
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    if (!favorites.some(fav => fav.id === image.id)) {
        favorites.push(image);
        localStorage.setItem('favorites', JSON.stringify(favorites));
        displayFavorites();
    }
}

function displayFavorites() {
    const favoritesGrid = document.getElementById('favorites-grid');
    favoritesGrid.innerHTML = '';
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    if (favorites.length === 0) {
        favoritesGrid.innerHTML = '<p>No hay imágenes en favoritos.</p>';
        return;
    }
    favorites.forEach(image => {
        const imageWrapper = document.createElement('div');
        imageWrapper.classList.add('image-wrapper');
        const imgElement = document.createElement('img');
        imgElement.src = image.urls.small;
        imgElement.alt = image.alt_description;
        const downloadButton = document.createElement('button');
        downloadButton.classList.add('btn', 'btn-primary');
        downloadButton.textContent = 'Descargar';
        downloadButton.onclick = () => downloadImage(image.urls.full, `imagen_${image.id}.jpg`);
        imageWrapper.appendChild(imgElement);
        imageWrapper.appendChild(downloadButton);
        favoritesGrid.appendChild(imageWrapper);
    });
}

document.getElementById('btn').insertAdjacentHTML('afterend', '<button id="toggle-favorites" class="btn btn-secondary mt-3">Ver Favoritos</button>');
document.getElementById('toggle-favorites').addEventListener('click', () => {
    favoritesContainer.style.display = favoritesContainer.style.display === 'none' ? 'block' : 'none';
    displayFavorites();
});
