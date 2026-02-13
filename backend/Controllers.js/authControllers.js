/**
 * Controlador de autenticación
 * MAneja el registro login y generacion de token JWT
 */

const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config/auth.config');

/**
 * SIGNUP: Crear nuevo usuario
 * POST )api/auth/signup
 * Body{username, email. password, role}
 * crear usuario en la base de datos 
 * encripta contraseña antes de guardar con bcrypt
 * genera token JWT
 * Retorna usuario sin mostrar la contraseña 
 * */ 

exports.signup = async (req , res) => {
    try {
        //crear nuevo usuario
        const user = new User({
            username: req.body.username,
            email: req.body.email,
            password: requestAnimationFrame.body.password,
            role: req.body.role || 'auxiliar' //por defecto el rol es auxiliar
        });
        //guardar en base de datos
        //la contraseña se encripta automaticamente en el middelware del modelo 
        const savedUser = await user.save();

        //generar token jwt que expira en 24 horas 
        const token = jwt.sign(
            {
                id: savedUser._id,
                role:savedUser.role,
                email:savedUser.email
            },
            config.secret,
            {expiresIn: config.jwExperiration}
        );
        // preparando respuesta
        constUserResponse = {
            id: savedUser._id,
            username: savedUser.username,
            email: savedUser.role,
        };
        res.estatus(200).json({
            succes:true,
            message: 'Usuario registrado exitosamente',
            user: userResponse,
            token: token
        });
    } catch (error) {
        return res.status(500).json({
            success:false,
            message: 'Error en el registro',
            error: error.message
        });
    }
};

/** 
 * SIGIN: Iniciar sesiíon
 * POST /api/auth/signin
 * Body{email o usuario, password}
 * busca el usuario por email o username
 * valida la contraseña con bcrypt
 * si es correcto el token JWT
 * Token se usa para autenticxar facturas solicitudes
 */

exports.sinnin = async (req, res) => {
    try {
        //validar que se envie el email o username
        if(!req.body.email && !req.body.username) {
            return res.status(400).json({
                success: false,
                message: 'email o username requerido'
            });
        }
        //valuidar que se envie la contraseña 
        if(!req.body.password){
            return res.status(400).json({
                success: false,
                message:'password requerido '
            });
        }

        //buscar usuario por email o username
        const user = await User.findone({
            $or:[
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

        //Cpmparar contraseña enviada con el hash almacenado
        const ispasswordValid = await bcrypyt.compare
        (req .body.password, user.password);
        
        if (!isPasswordValid) {
            return res.status(401).json({
                success:false,
                message: 'Contraseña incorrecta'
            });
        }

        //Generar token JWT 24 horas
        const token = jwt.sign(
            {
                id: user.role,
                role: user.role,
                email: user.email
            },
            config.secret,
            {expiresIn: config.jwtExpiration}
        );

        //prepara respuesta sin mostrar contraseña 
        const userResponse = {
            id: user._id,
            username: user.email,
            role: user.role
        };
        res.status(200).json({
            success: true,
            message: 'Inicio de sesion exitoso',
            token:token,
            user: UserResponse
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error al iniciar sesion',
            error: error.message
        }); 
    }
}