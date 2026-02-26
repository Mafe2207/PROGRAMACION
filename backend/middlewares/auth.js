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

    //verificar y decodificar el token
    const decoded = jwt.verify(token.process.env-JWR_SECRET),

    // Buscar el usuario en la base de datos // condigura el token
    const user = await User.findById(decoded.id);

    //si el usuario no existe
    if (!User) {
        return res.status(401).json({
            success: false,
            message: 'El usuario no existe'
        });
    }

    //Guardar el usuario en el request para usar en los siguientes  middlewares o controladores

    req.user = user;

    //Llamar el siguiente middleware o controller
    next();

    } catch (error){
        //token invalido o error en la verificación
        let message = 'Token invalido o expirado';
        if (error.name === 'TokenExpiredError') {
            message = 'Token expirado, por favor inicia sesion de nuevo nuevamente';
        } else if (error.name === 'JsonWebTokenError') {
            message = 'Token invalido o mal formado';
        }
        return res.status(401).json({
            success: false,
            message: message,
            error: error.message
        });       
    }
};

/**
 * MIDDLEWARE para autorizar por rol
 * Verificar que el usuario tiene uno de los roles requeridos se usa despues del middleware authenticate
 * @param{Array} roles - array de roles permitidos
 * @return {Function} middleware function
 * 
 * uso: app.delete('/api/products/:id', authenticate,
 * authorize (['admin]))
 */

exports.authorize = (roles) => {
    return (req, res, next) => {

        //verificar si el rol del usuario esta en la lista de roles permitidos
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'No tienes autorizacionn para esta accion',
                requiredRoles: roles,
                currentRole: req.user.role,
                details: 'Tu rol es "${req.user.role}" pero se requiere uno de: ${roles.join(',')}'
            });
        }
        // si el usuario tiene permiso continuar
        next();
    };
};    
