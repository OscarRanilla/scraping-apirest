//! -NOTA- ESTE ARCHIVO SE ENCARGARÁ DE CONFIGURAR EL SERVIDOR, MANEJAR
//! LAS RUTAS (INCLUYENDO EL CRUD) Y UTILIZAR FUNCIONES DE SCRAPING
//? NOS TRAEMOS SOLO LAS SIGUIENTES DEPENDENCIAS
const express = require('express');
const fs = require('fs');
const { realizarScraping } = require('./scraping'); // Importamos la función de scraping

// Inicializamos la aplicación de Express
const app = express();
const PORT = 3000; //Hacemos la variable ajustando el puerto donde vamos a escuchar

// Middleware para manejar datos JSON
app.use(express.json());

// Middleware para manejar datos de formularios URL-encoded
app.use(express.urlencoded({ extended: true }));

// Variable para manejar las noticias
let noticias = [];

// Función para leer datos del archivo JSON
function leerDatos() {
    try {
        const data = fs.readFileSync('noticias.json', 'utf-8');
        noticias = JSON.parse(data);
    } catch (error) {
        console.error('Error al leer el archivo noticias.json:', error.message);
        noticias = [];
    }
}

// Función para guardar datos en el archivo JSON
function guardarDatos() {
    fs.writeFileSync('noticias.json', JSON.stringify(noticias, null, 2));
}

// Leer datos al iniciar el servidor
leerDatos();

// Rutas API

// Ruta para realizar scraping y guardar las noticias en noticias.json
app.get('/scraping', async (req, res) => {
    try {
        const nuevasNoticias = await realizarScraping();
        noticias = nuevasNoticias; // Actualizar las noticias
        guardarDatos(); // Guardarlas en noticias.json
        console.log('Noticias guardadas:', noticias); // Verifica en consola
        res.status(200).json(noticias);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Obtener todas las noticias
app.get('/noticias', (req, res) => {
    res.status(200).json(noticias);
});

// Obtener una noticia por índice
app.get('/noticias/:id', (req, res) => {
    const { id } = req.params;
    const noticia = noticias[id];
    if (noticia) {
        res.status(200).json(noticia);
    } else {
        res.status(404).json({ error: 'Noticia no encontrada' });
    }
});

// Crear una nueva noticia
app.post('/noticias', (req, res) => {
    const nuevaNoticia = req.body;
    noticias.push(nuevaNoticia);
    guardarDatos();
    res.status(201).json(nuevaNoticia);
});

// Actualizar una noticia existente
app.put('/noticias/:id', (req, res) => {
    const { id } = req.params;
    const noticiaActualizada = req.body;
    if (noticias[id]) {
        noticias[id] = noticiaActualizada;
        guardarDatos();
        res.status(200).json(noticiaActualizada);
    } else {
        res.status(404).json({ error: 'Noticia no encontrada' });
    }
});

// Eliminar una noticia
app.delete('/noticias/:id', (req, res) => {
    const { id } = req.params;
    if (noticias[id]) {
        const noticiaEliminada = noticias.splice(id, 1);
        guardarDatos();
        res.status(200).json(noticiaEliminada);
    } else {
        res.status(404).json({ error: 'Noticia no encontrada' });
    }
});

// Configuración del puerto y ejecución del servidor
app.listen(PORT, () => {
console.log(`Listening server on http://localhost:${PORT}`);
})