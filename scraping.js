//! -NOTA- ESTE ARCHIVO SE ENCARGARÁ EXCLUSIVAMENTE DEL SCRAPING DE LA 
//!PÁGINA DE EL PAIS Y DE DEVOLVER LOS DATOS OBTENIDOS.

// Importamos las dependencias necesarias
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

// URL de la página que vamos a scrapear
const url = 'https://elpais.com/ultimas-noticias/';

// Función para realizar el scraping
async function realizarScraping() {
    try {
        const { data } = await axios.get(url); // Hace una petición GET a la página
        const $ = cheerio.load(data); // Carga el HTML con Cheerio

        let noticias = []; // Array para almacenar las noticias

        // Selecciona cada tarjeta de noticia
        $('.c').each((index, element) => {
            const titulo = $(element).find('.c_t a').text().trim(); 
            const enlaceRelativo = $(element).find('.c_t a').attr('href'); 
            const enlace = enlaceRelativo ? `https://elpais.com${enlaceRelativo.replace('https://elpais.com', '')}` : null; 
            const descripcion = $(element).find('.c_d').text().trim() || 'Descripción no disponible'; 
            const autores = $(element).find('.c_a a.c_a_a').map((i, el) => $(el).text().trim()).get().join(' y ') || 'Autor no especificado'; 
            const fecha = $(element).find('.c_a time').attr('datetime') || 'Fecha no disponible'; 
            const imagen = $(element).find('figure img').attr('src') || 'Imagen no disponible';
            
            if (titulo && enlace) {
                noticias.push({
                    titulo,
                    descripcion,
                    enlace,
                    autor: autores,
                    fecha,
                    imagen
                });
            }
        });
        console.log(noticias);      
        // Guarda las noticias en un archivo JSON
        fs.writeFileSync('noticias.json', JSON.stringify(noticias, null, 2));
        return noticias; // Devuelve las noticias obtenidas
    } catch (error) {
        console.error('Error al realizar scraping:', error.message);
        throw error; // Propaga el error para que pueda ser manejado por quien llama la función
    }
}

// Exportamos la función para que pueda ser usada en otros archivos
module.exports = { realizarScraping };