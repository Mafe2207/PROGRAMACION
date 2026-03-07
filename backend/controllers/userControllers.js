// simplified user controller with stub implementations
const User = require('../models/User');

exports.getAllUsers = async (req, res) => {
    res.status(200).json({ success: true, data: [] });
};

exports.getUserById = async (req, res) => {
    res.status(200).json({ success: true, user: null });
};

exports.createUser = async (req, res) => {
    res.status(201).json({ success: true, user: null });
};

exports.updateUser = async (req, res) => {
    res.status(200).json({ success: true, user: null });
};

exports.deleteUser = async (req, res) => {
    res.status(200).json({ success: true });
};

exports.updateuser = async (req, res ) => {
    try {
        // Restriccion: auxiliar solo puede actualizar su propio perfil 
        if (req.userRole === 'auxiliar' && req.userId.toString() !== req.params.id) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permiso para actualizar este usuario'
            });
        }
    
        // Restriccion: auxiliar no puede cambair su rol
        if (req.userRole === 'auxiliar' && req.body.role) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permiso para modificar su rol'
            });
        }

        //Actualizar usuario 
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id, 
            {$sert: req.body},
            { new: true} //Retorna documento actualizado
        ).select('-pasword'); // No retornar contraseña 

        if (!updatedUser){
            return res.status (404).json ({
                success: false,
                message: 'Usuario no encontrado',
            });
        }
    
        res.status (200).json ({
            success: true,
            message: 'Usuario actualizado correctamente',
            user: updateUser
        });   

    } catch (error) {
        console.error('Error en UpdatedUser', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar el usuario',
            error: error.message
        });
    }
};

/**
 * DELETE eliminar usuario
 * delete /api/ users/:id
 * roles: admin
 * query params:
 * hardDelete=true eliminar permanenetemente
 * default soft delete (solo desactivar)
 * 
 * -El admin solo puede desactivar otro admin 
 * 
 * retorna: 
 * 200 usuario eliminado o desactivo
 * 403 sin permiso
 * 404 usuario no encontrado
 * 500 error de servidor
 */

exports.deleteUser = async (req, res) => {
    try{

        const harDelete = req.query.hardDelete === 'true';
        const userToDelete = await User.findById(req.params.id);

        if(!userToDelete){
            return res.status(404).json ({
                success: false,
                message: 'Usuario no encontrado',
            });
        }

        if (req.userRole === 'admin' && userToDelete.role_id.toString() !== req.userId.
            toString()) {
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

        //Desactivar usuario
        userToDelete.active = false;
        await userToDelete.save();

        res.status(200).json({
            success: true,
            message: 'Usuario desactivado',
            data: userToDelete
        });
    }

    } catch (error) {
        console.error('Error en deleteUser', error);
        res.status(500).json({
            success: false,
            message: 'Error al desactivar el usuario',
            error: message.error

        });
    }
};

    
