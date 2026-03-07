/**
 * Rutas de categorias
 * define los endpoinsts CRUD para la gestion de categorias
 * las categorias son contenedores padres de subcategorias y productos
 * endpoints:
 * Post/api/categories crea una nueva categoria
 * Get/api/categories obtiene todas las categorias
 * Get/api/categories/:id obtiene una categoria por id
 * Put/api/categories/:id actualiza una categoria por id
 * Delete /api/categories/:id elimina una categoria/desactivar
 */

const express = require('express');
const router = express.Router();
const productController = require('../controllers/productControllers');
const { verifyToken, checkRole } = require('../middlewares');

//RUTA CRUD
router.post('/',
    verifyToken,
    checkRole(['admin', 'coordinador','auxiliar']),
    productController.createProducts
);

router.get('/', productController.getProducts);

router.get('/:id', productController.getProductsById);

router.put('/:id',
    verifyToken,
    checkRole(['admin','coordinador']),
    productController.updateProducts
);

router.delete('/:id',
    verifyToken,
    checkRole('admin'),
    productController.deleteProducts
);

module.exports = router; 