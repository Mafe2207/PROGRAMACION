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
            message: 'error al obtener todos los usuarios'
        });
    }
    
};
/**
 * Read obtener un usuario especifico por id 
 * GET /api/users/:id
 * auth token requerido 
 * respuestas
 * 200 usuario encontrado
 * 403 sin permiso para ver el usuario 
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

/** 
 * CREATE  crear un nuevo usuario 
 * POST api/ users 
 * Auth token requerido
 * Roles: admin y coordinador (con restricciones)
 * VALIDACIONES
 * 1 - 201: Usuario creado
 * 2- 400: Validación fallida
 * 3- 500: Error de servidor
 */

exports.createUser = async (req, res) => {
    try {
        const { username, email, password, role } = req.body;

        //Crear usuario nuevo
        const user = new User ({
            username,
            email,
            password,
            role 
        });
    }

        // Guardar usuario en BD
        const savedUser = await user.save();

        res.status(201).json ({
            sucess: true,
            message: 'Usuario creado correctamente',
            user: {
                id: savedUser._id,
                username: savedUser.username,
                email: savedUser.email,
                role: savedUser.role,
            }    
        });
    } catch (error) {
        console.error ( 'Error en createUser', error);
        res.status(500).json({
            success: false,
            message: 'Error al crear usuario',
            error: error.message
        });
    }    
};

/**
 * UPDATE actualizar usuario existente
 * PUT /api/users/:id
 * Auth Bearer token requerido
 * validaciones
 * auxiliar solo puede actualizar su propío perfil 
 * auxiliar no puede cambiar su rol
 * admin, coordinador pueden actualizar otros usuarios
 * 200 usuario actualizado
 * 403 sin permiso para actualizar
 * 404 usuario no encontrado
 * 500 error del servidor
 */

exports.updateuser = async (req, res ) => {
    try {
        // Restriccion: auxiliar solo puede actualizar su propio perfil 
        if (req.userRole === 'auxiliar' && req.userId.toString() !== req.params.id) {
            return res.status(403).json({
                success: false,
                message: 'no tienes permiso para actualizar este usuario'
            });
        }
    
}
// Restriccion: auxiliar no puede cambair su rol
        if (req.userRole === 'auxiliar' && req.body.role) {
            return res.status(403).json({
                success: false,
                message: 'no tienes permiso para modificar su rol'
            });
        }
    }

    //Actualizar usuario 
    const updateUser = await User.findByIdAndUpdate( req.params.id,
        {$sert: req.body},
        { new: true} //retorna documento actualizado
    ).select('-pasword'); // no retornar contraseña 

    if (!updateUser){
        return res.status (200).json ({
            success: true,
            message: 'Usuario actualizado correctamente',
            user: updateUser
        });   
    }
    if (!updateUser){
        return res.status (403).json ({
            success: false,
            message: 'Usuario no encontrado',
        });
    }    
        if (!updateUser){
        return res.status (404).json ({
            success: false,
            message: 'Usuario no encontrado',
        });

    } catch (error) {
        console.error('Error en UpdateUser', error);
        res.status(500).json({
            success: false,
            
        })
    }
/**
 * DELETE eliminar usuario
 * delete /api/ users/:id
 * roles:
 * query params:
 * hardDelete=true eliminar permanenetemente
 * default soft delete desactivar
 * 
 * El admin solo puede desactivar otro admin 
 * retorna
 * 403 sin permiso
 * 404 usuario no encontrado
 * 500 error de servidor
 */

exports.deleteUser = async (req, res) => {
    try{
        const isharDelete = req.queryhardDelete === 'true';
        const userToDelete = await User.findById(req.params.id);

        if(!userToDelete){
            return res.status(404).json ({
                success: false,
                message: 'Usuario no encontrado',
            });
        }
        if (usertoDelete === 'admin' && userToDelete._id.toString() !== req.userId.toString()){
            return res.status(403).json ({
                success: false,
                message: 'No tiene permiso para eliminar o desactivar administradores'
            });
    }

    if (ishardDelete) {
        //Eliminar permanentemente
        await User.findByIdAndDelte(req.params.id);
        
        res.status(200).json({
            success: true,
            message: 'Usuario eliminado permanentemente',
            data: userToDelete
        });
    } else{
        //soft delete desactivar usuario
        userToDelete.active = false;
        await userToDelete.save();

        res.status(500).json({
            success: false,
            message: 'error al desactivar usuario',
            error: error.message

        });
    }
};

    


