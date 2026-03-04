/**
 * controlador de estadisticas
 * get /alpi/statistics
 * Ath Baerer token requerido
 * Estadisticas disponibles:
 * 1- total de usuarios
 * 2- total de productos
 * 3- total de categorias
 * total de subcategorias
 */

const User = require ('../models/User');
const Product = require ('../models/Product');
const Category = require ('../models/Category');
const Subcategory = require ('../models/Subcategory');

/**
 * 
*/

const getStatistics = async (req, res) => { 
    try{
        //ejecuta todas las querys en paralelo
        const [totalUsers, totalProducts, totalCategories, totalSubcategories] = await
        Promise.all([
            User.countDocuments(), //contar usuarios
            Product.countDocuments(), //contar productos
            Category.countDocuments(),// contar categoria
            Subcategory.countDocuments(), //contar subcategorias
        ]);

        //Retornar las estadisticas
        res.json({
            totalUsers,
            totalProducts,
            totalCategories,
            totalSubcategories
        });
    } catch (error) {
        console.error ('Error en getStatistics', error);
        res.status(500).json ({
            Success: false,
            message: 'Error al obtener estadisticas',
            error: error.message
        })
    }
}
module.exports = {getStatistics}