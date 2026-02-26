/**
 * MIDDLEWARE control de roles de usuario
 * 
 * sirve para verificar que el usuario autenticado tiene
 * permisos necesarios para acceder a una ruta especifica
 * 
 * Funcion factory checkRole() permite especificar los roles permitidos
 * funcion Helper para roles especificos isAdmin, isCoodinador, isAuxiliar
 * Requiere que veryToken se haya ejecutado primero 
 * flujo:
 * verificar que req.userRole exista
 * compara req.userRole contra la lista de roles 
 * permitidos
 * si esta en la lista
 * si no esta en lka lista retorna 403 forbidden con mensaje descriptivo
 * si no existe userRole retorna 401 (token corructo)
 * 
 * uso:
 * checkRole('admin') solo admin
 * checkRole('admin', 'coordinador') admin y coordinador con permisos
 * checkRole('admin', 'coordinador', auxiliar) todos los permisos
 * 
 * ROLES DEL SISTEMA
 * admin : acceso total
 * coodindor : no puede eliminar ni gestionar usuarios
 * auxiliar: acceso limitado a tareas especificas 
 * 
*/

/**
 * 
 * factory funtion checkRole
 * retorna middleware que verifica si el usuario tiene uno de los roles permitidos
 * @param {...string} allowedRoles roles permitidos en el sistema
 * @returns {function} mniddleware de express
 * 
 */

const checkRole = (...allowedRoles) => {
    return (req, res, next) => {
        // validar que el usuario fue autenticado y veryfyToken ejecutado
        // req, userRole es establecido por veryfyToken middleware
        if (!req.userRole) {
            return res.status(401).json({
                success: false,
                message: 'Token invalido o expirado'
            });
        }
    }
}            