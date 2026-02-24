/**
 * 
 * Verificar que el usuario tenga un token valido y carga los datos del usuario en req.user
 */

const jwt = require('jsonwebtoken');
const User = require(',,/models/User');

/**
 * Autenticar usuario
 * Valida el token Bearer eb ek haeder Athorization
 * Si es valido carga el usurio en req.user
 * si no es valido o no existe retorna 401 Unauthorized
 */

exports.authenticate = async (req, res, next) => {
    try {
        //Extraer el token del header Bearer <token>
        const token = req.header('Authorization')?.replace('Bearer ', '');

        //si no hay token rechaza la solicitud 
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Token de autenticación requerido',
                details: 'Incluye Authorization Bearer'<token>'
            });
        }
    }
}