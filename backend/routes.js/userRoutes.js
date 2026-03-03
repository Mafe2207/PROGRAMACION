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
const userconttroller = require('../controllers/usercontrollers');
const {verifyToken } = require('../middlewares/authJwt');
const { checkRole } = require('../middlewares/role');

// revision de problemas de autenticacion y autorizacion 

router.use((req, res, next) => {
    console.log('\n== DIAGNOSTICO FR RUTA ==');
    console.log(`[${new Date().toISOString()}]) ${req.methop} ${req.originalUrl}`);
    console.log('Headers', {
        'Autorizacion': req.headers.authorization ?
        '***' + req.headers.authorization.slice(8):  
        null,
        'x-access-token': req.headers
        [x-access-Token] ? '***' + req.headers
        [x-access-token].slice(8) : null,
        'user.agent': req.heraderss['user-agent']
    });
})

// rutas de usurios 

router.post('/',
    verifyToken,
    checkRole(['admin', 'coordinador']),
    userController.createUser
);

    router.get('/',
        verifyToken,
        checkRole('admin', 'cordinador', 'auxiliar'),
        userController.getAllUsers
    );

    router.put('/:id',
        verifyToken,
        checkRole(['admin','coordinador']),
        validateuserRole,
        userController.updateUser
    );

    router.delete('/:id',
        verifyToken,
        checkRole('admin'),//no va a validate por que borra toda la informacion
        userController.deleteUser
    );
module.exports = routers