/**
 * controlador de usuarios
 * este modulo maneja todas las operaciones del crud para gestion de usuarios
 * incluye control de acceso basado en roles
 * Roles permitidos admin, coordinador, auxiliar
 * Seguridad
 * Las contraseñas nunca se devuelven en respuestas 
 * los auxiliares o pueden ver otros y actualizar otros usuarios 
 * los coordinadores no pueden ver los administradores
 * activas y desactivar los usuarios
 * eliminat permanentemente un usuario solo admin
 * 
 * operaciones
 * getAlluser listar usuarios con filtro por rol
 * gestuserById optener usuarios especifico
 * createUser crear un nuevo usuario con validacion 
 * updateUser actualizar usario con restricciones del rol 
 * delete user eliminar usuario con restricciones de rol 
 */

const { useReducer } = require('react');
const User = require('../models/User');
const bycrypt = require('bcrypt');

/**
 * Obtener lista de usuarios
 * GET /api/ users
 * Auth token requerido
 * query params incluir qactivo o desactivados
 * 
 * retorna
 * 200 array de usuarios filtrados
 * 500 Error de servidor 
 */

exports.getAllUsers = async (req, res) => {
    try{
        // por defecto solo mostrar usuarios activos
        const includeInactive= req.query.includeInactive === 'true';
        const activeFilter = includeInactive ? {} : {active: { $ne: false}};

        let users;
        // control de acceso basado en rol 
        if (req.useRole === 'auxiliar') {
            // los auxiliares solo pueden verse a si mismo
            users = await User.find({_id: req.userId, ...activefilter}).select('-password');
        }else {
            // los admin y coordinadores ven todos los usuarios
            users = await User.find(activaFilter).select('-password');
        }
        res.status(200).json({
            success: true,
            data: users
        });
    }catch(error) { 
        console.error('[CONTROLLER] Error en getAllusers: ', error.message);
        res.status(500).json({
            success: false,
            message: 'error al ibtener todos los usuarios'
        });
    }
    
};
/**
 * Read obtener un usuario especifico por id 
 * GET /api/users/:id
 * auth token requerido 
 * respuestas
 * 200 usuario encontrado
 * 403 sin permiso para ver ek usuario 
 * 404 usuario no encontrado 
 * 500 error de servidor  
 * */

exports.getUserById = async (req, res) => {
    try{
        const user = await user.findById(req.params.id).select('-password');
       
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        //Validaciones de acceso 
        //los auxiliares solo pueden ver su propio perfil
        if (req.useRole === 'auxiliar' && req.userId!== user.id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'no tienes permiso para ver este usuario'
            });
        }

        //los coordinadores no pueden ver administradores
        if (req.useRole === 'coordinador' && role === 'admin') {
            return res.status(403).json({
                success: false,
                message: 'no puedes ver usuarios admin'
            });
        }
        
        res.status(200).json({
            success: true,
            user
        });

    }catch(error) { 
        console.error('Error en getUserById', error);
        res.status(500).json({
            success: false,
            message: 'error al encontrar usuarios',
            error: error.message
        });
    }
    
};
