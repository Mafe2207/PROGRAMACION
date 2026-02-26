/**
 * MIDDLEWARE DE VERIFICACION JWWWT
 * middleware para verificar y validar tokens JWT en las solicitudes 
 * se usa en todas las rutas protegidas para auetenticar usuarios
 * caracteristicas:
 * soporta dos formatos de token 
 * 1 Authorization: Bearer <token> (Estandar REST) //trae solo el token
 * 2 x-access--token (header personalizado)
 * extrae informacion del token (id role email) //trae token e informacion adjunta
 * la adjunta a req.userId req.Role, req.userEmail para uso en los controladores
 * manejo de errores con codigo 403/401 apropiados 
 * flujo:
 * 1. lee el header Athorization o x-access-token
 * 2. Extraee el token (quita el bearer si es necesario)
 * 3. verifica el token con JWT_SECRET
 * 4. Si es valido continua al siguiente middleware
 * 5. si es invalido retorna 401 Unauthorized
 * 6. si falta retorna 403 Forbiden
 * 
 *Validacion del token 
 *1.Verifica firma criptografica con JWT_SECRET
 *2. Comprueba que no haya expirado  
 * 3. Extrae payloas {id, rol, email}
 */
const jwt = require('jsonwebtoken');
const config = require('../config/auth,config');

/**
 * Verificar token
 * funcionalidad
 * busca el token en las ubicaciones posibes (orden de procedencia)
 * 1. header Athorization con formato Bearer <token>
 * 2. header x-access-token
 * si encuentra retorna 403 Forbidden
 * si token es invalido/expirado retorna 401 Unauthorized 
 * si el token es valido adjunta datos del usuario a req.user y continua
 * 
 * Headers soportados:
 * 1- Authorization bearer <jajdbdbdjab>
 * 2- x-acess-token: <jshsjkddjsd> id, role, email
 * -Propiedades del request despues del middleware:
 *  req.userId = (string) Id del nuevo usuario Mongo DB 
 * rq.useRole= (string) rol del usuario(admin,cordinador,auxiliar)
 * req.userEmail= (string) email del usuario
 */

const verifyToken = (req, res, next) => {
    try{
        // Soporta dos formatos Athorization bearer o access-token
        let token =null;
    
        // Formato Authorization 
        if (req.headers.autorization && req.headers.autorization.startsWith('bearer')) {

        //Extraer token quitando "Bearer"
        token = req.headers.autorization.substring(7);
        }

        // Formato x-access-token
        else if (req.headers['x-access-token']) {
            token = req.headers['x-access-token'];
        }

        //Si no encuentra el token rechaza la solicitud 
        if (!token) {
            return res.status(403).json ({
                sucess: false,
                message: 'Token no proporcionado'
            });
        }
        // verificar el token con la calve secreta 
        const decoded = jwt.verify(token, config.secret);

        //adjuntar informacion del usuario al request object para que otros middlewares y rutas puedan acceder a ella

        req.userId = decoded.id;// id de mongoDB
        req.userRole = decoded.role;// Rol usuario
        req.userEmail = decoded,email;// email de usuario

        // token es valido continuar siguiente moddleware o ruta
        next();
    } catch (error) {
        // n token invalido o expirado 
        return res.status(401).json ({
            success: false, 
            message: 'Token invalido o expirado',
            error: error.message
        })

    }
    
};

/**
 * Validacion de funcion para mejor seeguridad y manejo de errorres
 * verificar que verifyTokenFn sea una funcion valida 
 *esto es una validacion de seguridad para que el middleware se exporte correctamente
 * si algo sale mal en su definicion lanzara un error en tiempo de carga del modulo
 */
if(typeof verifyTokenFn !== 'funtion') {
    console.error('Error: verifyTokenFn no es una funcion valida');
    throw new Error('verifyTokenFn debe ser una funcion');
}
//exporta el middleware de verificacion de token
module.exports = {
    verifyTokenFn: verifyTokenFn
}