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
const subcategoryController = require('../controllers/subcategoryControllers');
const { verifyToken, checkRole } = require('../middlewares');

//RUTA CRUD
router.post('/',
    verifyToken,
    checkRole(['admin', 'coordinador']),
    subcategoryController.createSubcategory
);

router.get('/', subcategoryController.getSubcategories);
router.get('/:id', subcategoryController.getSubcategoryById);

router.put('/:id',
    verifyToken,
    checkRole(['admin','coordinador']),
    subcategoryController.updateSubcategory
);

router.delete('/:id',
    verifyToken,
    checkRole('admin'),//no va a validate por que borra toda la informacion
    subcategoryController.deleteSubcategory
);

module.exports = router;