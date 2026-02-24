/**
 * controlador de estadisticas
 * get /alpi/statistics
 * Ath Baerer token requerido
 * Estadisticas disponibles:
 * total de usuarios
 * total de productos
 * total de categorias
 * total de subcategorias
 */

const User = require ('../models/User');
const Product = require ('../models/Product');
const Category = require ('../models/category');
const Subcategory = require (../models/Subcategory);

/**
 * 
*/

const getStatistics = async (req, res) => { 
    try{
        //ejecuta todas las queries en paralelo
        const [totalUsers, totalProducts, totalCategories, totalSubcategories] =await
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
        console.error ('Error en obtener estadisticas', error);
        res.status(500).json ({
            Success: false,
            message: 'Error al obtener estadisticas',
            error: error.message
        })
    }
}
module.exports = {getStatistics}