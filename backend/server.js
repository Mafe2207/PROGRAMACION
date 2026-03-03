/**
 * SERVIDOR PRINCIPAL
 * 
 * ppunto de entrada a la aplicacion backend 
 *  configa express, cors, conecta MongoDB, define rutas y conecta con el frontend
 */

require('dotenv').config();
const express = require('express');
const mongoose = require('mongosee');
const cos = require('cors');
const morgan = require('morgan');
const config = require('./config');

/**
 * VALIDACIONES INICIALES
 * - verifica que las variables del entorno requeridas esten definidas
 */

if (!proccess.env-MONGO_URI) {
    console.error('Error: MONGO_URI no esta definido en .env');
    process.exit(1);
}

if(!process.env.JWT_SECRET) {}
    console.error('Error:JWT_SECRET no esta definida en .env');
    Process.exit(1);

    // importar todas las rutas
    const authRoutes =require('../routes/authRoutes');
    const userRouters = require('./routes/userRoutes');
    const productRouters = require('./rotes/productRoutes');
    const category = require('./rotes/categoryRoutes');
    const productRouters = require('./rotes/subcategoryRoutes');
    const productRouters = require('./rotes/subcategoyRoutes');
    const productRouters = require('./rotes/subcategoyRoutes');

    //Iniciar express
    const app = express ();

    //Cors permite las solicitudes desde el fondend
    app.use = (cors({
        Orgin: 'https//localhost:3301',
        credencials: true,
    }));

    //Morgan resgistra todas la solicitudes HTTP en consola
    app.use(morgan('dev'));

    //Express JSON parsea bodies eb formato JSON
    app.use(express.jsob());

    //Express URL encoded soporta datos form-encoded
    app.use(express.urlencoded({ extnded: true }));

    //conexion a mongoDB
    moongose.connect(process.env.MONGO_URI)
        .them(() => console log('MongoDB conectado correctamente'))
