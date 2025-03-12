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

// Función para buscar imágenes
async function buscarImagenes() {
    const query = document.getElementById('query').value;
    if (!query) {
        alert('Por favor, ingresa un término de búsqueda.');
        return;
    }
    const url = `https://pixabay.com/api/?key=${apiKey}&q=${encodeURIComponent(query)}&image_type=photo&pretty=true`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Error al obtener las imágenes');
        }
        const data = await response.json();
        mostrarImagenes(data.hits);
    } catch (error) {
        console.error('Error al buscar imágenes:', error);
        alert('Error al cargar las imágenes. Inténtalo de nuevo.');
    }
}

// Función para mostrar las imágenes
function mostrarImagenes(imagenes) {
    const contenedorImagenes = document.getElementById('image-container');
    contenedorImagenes.innerHTML = ''; // Limpiar contenedor antes de agregar nuevas imágenes

    if (imagenes.length === 0) {
        contenedorImagenes.innerHTML = '<p>No se encontraron imágenes.</p>';
        return;
    }

    imagenes.forEach(imagen => {
        const contenedor = document.createElement('div');
        contenedor.classList.add('contenedor-imagen');

        const imgElement = document.createElement('img');
        imgElement.src = imagen.webformatURL; // Usamos `webformatURL` para la imagen pequeña
        imgElement.alt = imagen.tags; // Pixabay usa `tags` para la descripción
        imgElement.classList.add('imagen');

        // Botón de descarga
        const botonDescargar = document.createElement('button');
        botonDescargar.classList.add('boton-descargar');
        botonDescargar.textContent = 'Descargar';
        botonDescargar.onclick = () => descargarImagen(imagen.largeImageURL, `imagen_${imagen.id}.jpg`); // Usamos `largeImageURL` para la descarga

        // Botón de favoritos
        const botonFavorito = document.createElement('button');
        botonFavorito.classList.add('boton-favorito');
        botonFavorito.textContent = 'Añadir a Favoritos';
        botonFavorito.onclick = () => agregarAFavoritos(imagen);

        contenedor.appendChild(imgElement);
        contenedor.appendChild(botonDescargar);
        contenedor.appendChild(botonFavorito);
        contenedorImagenes.appendChild(contenedor);
    });
}

// Función para descargar una imagen
async function descargarImagen(url, nombreArchivo) {
    try {
        const response = await fetch(url);
        const blob = await response.blob();
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = nombreArchivo;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (error) {
        console.error('Error al descargar la imagen:', error);
        alert('Error al descargar la imagen. Inténtalo de nuevo.');
    }
}

// Función para añadir una imagen a favoritos
function agregarAFavoritos(imagen) {
    let favoritos = JSON.parse(localStorage.getItem('favoritos')) || [];
    if (!favoritos.some(fav => fav.id === imagen.id)) {
        favoritos.push(imagen);
        localStorage.setItem('favoritos', JSON.stringify(favoritos));
        alert('Imagen añadida a favoritos');
        mostrarFavoritos();
    } else {
        alert('La imagen ya está en favoritos');
    }
}

// Función para mostrar las imágenes favoritas
function mostrarFavoritos() {
    const contenedorFavoritos = document.getElementById('favorites-grid');
    contenedorFavoritos.innerHTML = ''; // Limpiar contenedor antes de agregar nuevas imágenes

    const favoritos = JSON.parse(localStorage.getItem('favoritos')) || [];
    if (favoritos.length === 0) {
        contenedorFavoritos.innerHTML = '<p>No hay imágenes en favoritos.</p>';
        return;
    }

    favoritos.forEach(imagen => {
        const contenedor = document.createElement('div');
        contenedor.classList.add('contenedor-imagen');

        const imgElement = document.createElement('img');
        imgElement.src = imagen.webformatURL; // Usamos `webformatURL` para la imagen pequeña
        imgElement.alt = imagen.tags; // Pixabay usa `tags` para la descripción
        imgElement.classList.add('imagen');

        // Botón de descarga para favoritos
        const botonDescargar = document.createElement('button');
        botonDescargar.classList.add('boton-descargar');
        botonDescargar.textContent = 'Descargar';
        botonDescargar.onclick = () => descargarImagen(imagen.largeImageURL, `imagen_${imagen.id}.jpg`); // Usamos `largeImageURL` para la descarga

        contenedor.appendChild(imgElement);
        contenedor.appendChild(botonDescargar);
        contenedorFavoritos.appendChild(contenedor);
    });
}

// Función para mostrar/ocultar la sección de favoritos
document.getElementById('toggle-favorites').addEventListener('click', () => {
    const contenedorFavoritos = document.getElementById('favorites-container');
    contenedorFavoritos.style.display = contenedorFavoritos.style.display === 'none' ? 'block' : 'none';
    mostrarFavoritos();
});

// Mostrar favoritos al cargar la página
window.addEventListener('load', () => {
    mostrarFavoritos();
});
