document.getElementById('btn').addEventListener('click', function () {
    const ciudad = document.getElementById('caja').value;
    obtenerclima(ciudad);
});

async function obtenerclima(ciudad) {
    const apikey = 'ef924cf14dfca95bfa2cceb15b8a34b3'
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${ciudad}&appid=${apikey}&units=metric&lang=es`;
    
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Ciudad no encontrada, solicitud fallida');
        }
        const data = await response.json();
        mostrarclima(data);
    }
    catch (error) {
        console.error("Error al obtener el clima", error);
    }
}

function mostrarclima(data) {
    const weatherresult = document.getElementById('weatherresult');
    weatherresult.innerHTML = `temperatura: ${data.main.temp}°C <br> clima: ${data.weather[0].description}`
}