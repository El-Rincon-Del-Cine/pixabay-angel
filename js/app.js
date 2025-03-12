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

btnBuscar.addEventListener('click', function () {
    const terminoBusqueda = inputCaja.value.trim();
    if (terminoBusqueda) {
        console.log("Buscando imágenes para:", terminoBusqueda);
        buscarImagenes(terminoBusqueda);
    } else {
        alert("Por favor, ingresa un término de búsqueda.");
    }
});

async function buscarImagenes(termino) {
    const url = `https://pixabay.com/api/?key=${apiKey}&q=${encodeURIComponent(termino)}&image_type=photo&pretty=true`;

    try {
        console.log("Consultando API:", url);
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("Error al conectar con la API");
        }

        const data = await response.json();
        console.log("Datos recibidos:", data);

        if (!data.hits || data.hits.length === 0) {
            resultadoImagenes.innerHTML = `<p class="text-danger">No se encontraron imágenes.</p>`;
        } else {
            mostrarListaImagenes(data.hits);
        }
    } catch (error) {
        console.error("Error:", error);
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
                    <button class="btn btn-primary" onclick="mostrarImagen('${imagen.largeImageURL}', '${imagen.tags}', ${imagen.imageWidth}, ${imagen.imageHeight}, '${imagen.user}', '${imagen.pageURL}')">
                        Ver Detalles
                    </button>
                </div>
            </div>
        `;

        resultadoImagenes.appendChild(col);
    });
}

function mostrarImagen(url, tags, width, height, user, pageURL) {
    resultadoImagenes.innerHTML = `
        <div class="card text-white bg-dark shadow-lg p-4">
            <div class="card-body text-center">
                <h3 class="card-title">${tags}</h3>
                <img src="${url}" class="img-fluid hero-img mb-3" alt="Imagen relacionada">
                <p><strong>Resolución:</strong> ${width} x ${height} px</p>
                <p><strong>Fotógrafo:</strong> <a href="${pageURL}" target="_blank" class="text-light">${user}</a></p>
                <button class="btn btn-success mt-3" onclick="descargarImagen('${url}')">
                    <i class="fas fa-download"></i> Descargar
                </button>
                <button class="btn btn-secondary mt-3" onclick="window.location.reload()">Volver</button>
            </div>
        </div>
    `;
}

async function descargarImagen(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("No se pudo descargar la imagen");

        const blob = await response.blob();

        if ('showSaveFilePicker' in window) {
            // Usar el sistema de archivos nativo
            const opciones = {
                suggestedName: "imagen.jpg",
                types: [{
                    description: "Imagen JPG",
                    accept: { "image/jpeg": [".jpg"] }
                }]
            };
            const archivo = await window.showSaveFilePicker(opciones);
            const stream = await archivo.createWritable();
            await stream.write(blob);
            await stream.close();
            alert("Imagen guardada correctamente");
        } else {
            throw new Error("El sistema de archivos no está disponible.");
        }
    } catch (error) {
        console.error("Error al descargar la imagen:", error);
        alert("No se pudo descargar la imagen.");
    }
}
});
