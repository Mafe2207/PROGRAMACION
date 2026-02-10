//carga las variables de entorno desde .env
require('dotenv').config();


module.exports = {
    //clave firmar  los token de jwt
    secret: process.env.JWT_SECRET || "tu secreto para los token en segundos",
    //tiempo de ezpiracion del token en segundos
    jwtExpiration: process.env.JWT_EZPIRATION || 86400, //24 horas
    //tiempo de expiracion de refrescar token 
    jwtRefresh: 6048000, //7 dias
    // numero de rondas para encriptar la contraseña
    slatRounds: process.env.SALT_ROUNDS || 8

};