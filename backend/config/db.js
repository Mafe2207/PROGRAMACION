//CONEXION CON LA BASE DE DATOS
module.exports = {
    url: process.env.DB_URI || "mongodb://localhost:27017/PROGRAMACION"
};