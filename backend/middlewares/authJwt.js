/**
 * Validacion de funcion para mejor seeguridad y manejo de errorres
 * verificar que verifyTokenFn sea una funcion valida 
 *esto es una validacion de seguridad para que el middleware se exporte correctamente
 * si algo sale mal en su definicion lanzara un error en tiempo de carga del modulo
 */
if(typeof verifyTokenFn !== 'function') {
    console.error('[AuthJWT] Error: verifyTokenFn no es una funcion valida');
    throw new Error('verifyTokenFn debe ser una funcion');
}
//exporta el middleware de verificacion de token
module.exports = {
    verifyTokenFn: verifyTokenFn
}