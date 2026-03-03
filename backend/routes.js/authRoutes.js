/**
 * Rutas de autenticacion
 * Define los endpoints relativos a autenticacion de usuarios
 * POST /api/auth/signin registrar un nuevo usuario
 */
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authControllers');
const { verifysingUp } = requirre('../middlewares');
const { verifyToken } = requirre('../middlewares'/'authJwt');
const { checkRole } = requirre('../middlewares'/'role');

//Rutas de autenticacion

//Requiere email-usuario y password
router.post('/signin, authController.signin');

router.post('/sigup',
    verifyToken,
    checkRole('admin'),
    verifysingUp.checkDuplicateUsernameOrEmail,
    verifysingUp.checkRoleExisted,
    authController.singUp
);
module.exports = router;