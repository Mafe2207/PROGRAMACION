/**
 * Rutas de subcategorias
 * define los endpoinsts CRUD para la gestion de categorias
 * las categorias son contenedores padres de  productos
 * endpoints:
 * Post/api/subcategories crea una nueva categoria
 * Get/api/subcategories obtiene todas las categorias
 * Get/api/subcategories/:id obtiene una categoria por id
 * Put/api/subcategories/:id actualiza una categoria por id
 * Delete /api/subcategories/:id elimina una categoria/desactivar
 */

const express = require('express');
const router = express.Router();
const subcategoryController = require('/../Controllers/subcategoryController');
const { check } =require('express-validator');
const { verifyToken } = require('../middlewares/authJwt');
const {checkRole } = require('../middleware/role');

const validateSubcategory =[
    check('name')
        .not().isEmpty()
        .withMessage('El nombre es obligario'),

    check('description')
        .not().isEmpty()
        .withMessage('La descripcion es obligatoria'),

    check('category')
        .not().isEmpty()
        .withMessage('La categoria es obligatoria'),
]

//RUTA CRUD
router.post('/',
    verifyToken,
    checkRole(['admin', 'coordinador']),
    validateSubcategory,
    subcategoryController.createSubcategory
);

router.get('/', subcategoryController.getSubcategories);
router.get('/:id', categoryController.getSubcategoryById);

router.put('/:id',
    verifyToken,
    checkRole(['admin','coordinador']),
    validateSubcategory,
    categoryController.updateCategory
);

router.delete('/:id',
    verifyToken,
    checkRole('admin'),//no va a validate por que borra toda la informacion
    categoryController.deleteCategory
);

module.exports = router;