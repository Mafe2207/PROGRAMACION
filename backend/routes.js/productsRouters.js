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
const productController = require('/../Controllers/productController');
const { verifyToken } = require('../middlewares/authJwt');
const checkRole = require('../middleware/role');

const validateProduct =[
    check('name')
        .not().isEmpty()
        .withMessage('El nombre es obligario'),

    check('description')
        .not().isEmpty()
        .withMessage('La descripcion es obligatoria'),
    
    check('price')
        .not().isEmpty()
        .withMessage('El precio es obligatoria'),

    check('stock')
        .not().isEmpty()
        .withMessage('El stock obligatoria'),

    check('category')
        .not().isEmpty()
        .withMessage('La categoria es obligatoria'),
    
    check('subcategory')
        .not().isEmpty()
        .withMessage('La subcategoria es obligatoria'),
]

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