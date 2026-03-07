/**
 * 
 * Rutas de usuarios
 * Define endponits para gestionar de usuarios en el sistema 
 * POST api/users
 * GET api/users
 * GET api/users/:id
 * PuT api/users/:id
 * DELETE api/users/:id
 */

const express= require('express');
const router =express.Router();
const userController = require('../controllers/userControllers');
const { verifyToken, checkRole } = require('../middlewares');

// revisión de problemas de autenticación y autorización

router.use((req, res, next) => {
    console.log('\n== DIAGNOSTICO DE RUTA ==');
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    console.log('Headers', {
        'authorization': req.headers.authorization ?
            '***' + req.headers.authorization.slice(8) : null,
        'x-access-token': req.headers['x-access-token'] ?
            '***' + req.headers['x-access-token'].slice(8) : null,
        'user-agent': req.headers['user-agent']
    });
    next();
})

// rutas de usurios 

router.post('/',
    verifyToken,
    checkRole(['admin', 'coordinador']),
    userController.createUser
);

router.get('/',
        verifyToken,
        checkRole(['admin', 'coordinador', 'auxiliar']),
        userController.getAllUsers
    );

    router.put('/:id',
        verifyToken,
        checkRole(['admin','coordinador']),
        userController.updateUser
    );

    router.delete('/:id',
        verifyToken,
        checkRole('admin'),//no va a validate por que borra toda la informacion
        userController.deleteUser
    );
module.exports = router