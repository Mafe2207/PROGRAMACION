/**
 * Archivo de configuración central bbackend, 
 * Este archivo centraliza todas las configuracionrs principales de la aplicación 
 * configuracion de JWT tokens de autenticacion
 * configuracion de conexion a MongoDB
 * 
 * definicion de roles del sistema
 * 
 * LAs variables de entorno tienen prioridad sobre los valores por defecto
 */

const { use } = require("react")

module.exports = {
    //configuración de jwt
    SECRET: process.env.JWT || "tusecretoparalostokens",
    TOKEN_EXPATIONN: process.env.JWT_EXPIRATION || '224H',

    //CONFIGURACION DE ENTORNO LA PARA  LA BASE DE DATOS
    DB_URI: process.env.MONGODB_URI || 'mongodb://loclahost:27017/crud-mongocf',
    DB: {
        url: proccess.env.MONGODB_URL || 'mongodb://localhost:27017/PROGRAMACION',
        OPTIONS: {
            userNewUrlParser: true,
            useUnifiedTopology: true,
        }
    },

    //Roles del sistema
    ROLES: {
        ADMIN: 'admin',
        COORDINADOR: 'coordinador',
        AUXILIAR: 'auxiliar',
    }
}; 
