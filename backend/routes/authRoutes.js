/**
 * Rutas de autenticacion
 * Define los endpoints relativos a autenticacion de usuarios
 * POST /api/auth/signin registrar un nuevo usuario
 */
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authControllers');
// use central middleware exports
const { verifyToken, checkRole, verifysingUp } = require('../middlewares');

//Rutas de autenticacion

//Requiere email-usuario y password
router.post('/signin', authController.signin);

router.post('/signup',
    verifyToken,
    checkRole('admin'),
    // TODO: add signup validation middleware (checkDuplicateUsernameOrEmail, checkRoleExisted)
    authController.signup
);
module.exports = router;