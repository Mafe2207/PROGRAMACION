/**
 * Controlador de autenticación para el backend.
 * Maneja el registro login y generacion de token JWT
 */

const User = require('../models/User');
const bcrypt = require('bcryptjs'); // usar bcryptjs instalado en package.json
const jwt = require('jsonwebtoken'); //para generar el token de autenticación 
const config = require('../config/auth.config'); //para obtener la clave secreta del JWT

/**
 * SIGNUP: Registro o creacion de usuario
 * POST /api/auth/signup - RUTA
 * Body: {username, email. password, role}
 * 
 * crear usuario en la base de datos 
 * encripta contraseña antes de guardar con bcrypt
 * genera token JWT para el usuario registrado
 * Retorna usuario sin mostrar la contraseña 
 * */ 

exports.signup = async (req , res) => {
    try {
        // crear nuevo usuario
        const user = new User({
            username: req.body.username,
            email: req.body.email,
            password: req.body.password,
            role: req.body.role || 'auxiliar' // por defecto el rol es auxiliar si no especifica 
        });

        // Guardar en base de datos
        // La contraseña se encripta automáticamente en el middleware del modelo 
        const savedUser = await user.save();

        // generar token jwt que expira en 24 horas 
        const token = jwt.sign(
            {
                id: savedUser._id,
                role: savedUser.role,
                email: savedUser.email
            },
            config.secret,
            { expiresIn: config.jwtExpiration }
        );
        // preparando respuesta
        const userResponse = {
            id: savedUser._id,
            username: savedUser.username,
            email: savedUser.email,
            role: savedUser.role,
        };
        // POSTMAN 200 AFIRMATIVO - USUARIO REGISTRADO EXITOSAMENTE 
        res.status(200).json({
            success: true,
            message: 'Usuario registrado exitosamente!',
            token: token,
            user: userResponse
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error en el registro de usuario!',
            error: error.message
        });
    }
};

/** 
 * SIG IN: Iniciar sesiíon
 * POST /api/auth/signin -RUTA
 * Body: {email o usuario, password}
 * busca el usuario por email o username en la base de datos
 * valida la contraseña con bcrypt
 * si es correcto el token JWT
 * Token se usa para autenticar futuras solicitudes del usuario
 */

exports.signin = async (req, res) => {
    try {
        //validar que se envie el email o username
        if(!req.body.email && !req.body.username) {
            return res.status(400).json({
                success: false,
                message: 'Email o username requerido!'
            });
        }
        //validar que se envie la contraseña 
        if(!req.body.password){
            return res.status(400).json({
                success: false,
                message:'Password requerido '
            });
        }

        //buscar usuario por email o username
        const user = await User.findOne({
            $or:[ //funciona como un "o" lógico - array - agarra cualquiera de los dos o los que esten 
                {username: req.body.username},
                {email: req.body.email}
            ]
        }).select('+password'); //include password field

        //si no se encuentra el usuario con este email o username
        if(!user) {
            return res.status(400).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        //verificar que el usuario tenga contraseña 
        if(!user.password){
            return res.status(500).json({
                success: false,
                message: 'Error interno: usuario sin contraseña'
            }); 
        }

        //Comparar contraseña enviada con el hash almacenado -HASH: contraseña encriptada
        const isPasswordValid = await bcrypt.compare(req.body.password, user.password);
        
        if (!isPasswordValid) {
            return res.status(401).json({
                success:false,
                message: 'Contraseña incorrecta!'
            });
        }

        //Generar token JWT 24 horas
        const token = jwt.sign(
            {
                id: user._id,
                role: user.role,
                email: user.email
            },
            config.secret,
            { expiresIn: config.jwtExpiration }
        );

        // prepara respuesta sin mostrar contraseña 
        const userResponse = {
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role
        };
        // POSTMAN 200 AFIRMATIVO - Usuario iniciado sesión exitosamente
        res.status(200).json({
            success: true,
            message: 'Inicio de sesión exitoso!',
            token: token,
            user: userResponse
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error al iniciar sesion',
            error: error.message
        }); 
    }
};