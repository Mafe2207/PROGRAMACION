/**
 * controlador de productos 
 * maneja todas la operaciones (CRUD) relacionadas con productos
 * Estructira: una subcategoria puede tener varios productos relacionados
 * cuando una subcategoria se elimina los productos relacionados se desactivan
 * cuando se ejecuta en cascada soft delete se eliminan de manera permanente 
 * Incluye soft delete (marcar como incativo)
 * y hard delete (eliminación permanente)   
 */
 // trae esquemas de productos
const Product = require('../models/Product');
const Category = require('../models/Category');
const Subcategory = require('../ models/Subcategory');

/**
 * /**
 * CREATE: crear nuevo producto
 * POST / api/products
 * Body: { name, descripcion,price stock, category, subcatgory } 
 * Auth Bearer token requerido
 * Roles: admmin y coordinador
 * body requerido:
 * 201: producto creado en MongoDB
 * 400: Validación faliida o nombre duplicado
 * 404: categoria padre no existe
 * 500: Error en base de datos
 * */

exports.createProduct = async (req, res) => { // esta funcion exporta la peticion y la respuesta de http 
    try { 

        const { name, description, price, stock, category, subcategory} = req.body; //estructura de los campo de peticion 
        
        //=== VALIDACIONES === 
        
        //Verificar que todos los campos requeridos esten presentes
        if (!name|| !description || !price || !stock || !category ||!subcategory) {
            return res.status(400).json({
            success: false,
            message: 'todos los campos obligatorios',
            requiredFields: ['name', 'description', 'price', 'stock','category', 'subcategory']
        }); 
        }

        // validar que la categoria existe
            const categoryExist = await Category.findById(category); //busca si una categoria existe 
            if (!categoryExist) { //si elfindBYID esta nulo dice que la categioria no existe y retorna: 
                return res.status(404).json({
                    success: false,
                    message: 'la subcategoria no existe o no pertenece a la categoria especificada',
                    categoryId: category
                });
            }

         // Validar que la categoria existe y pertenece a la subcategoria especificada
            const subcategoryExists = await Subcategory.findOne({
                _id: subcategory,
                category: category
            });

            if (!subcategoryExists) {
                return res. status(400).json({
                    success: false,
                    message: 'la subcategoria no existe o no pertenece a la categoria especificada'
            });
        }

//===== CREAR PRODUCTO =====
    const product = new Product({
        name,
        descripcion,
        price,
        stock,
        category,
        subcategory,
    });

    // si hay usuarios autenticado, registrar quien creo el producto
    if (req.user && req.user._id) { // va a verificar si el usuario existe en el sistema y esta verificado en el sistema
    product.createBy = req.user._id; //asigna el id del producto
}

// Guardar en base de datos
const savedProduct = await product.save();

//Obtener producto poblado con datos de relaciones (populate)
const productWithDetails = await Product.findById(savedProduct._id) // trae las referencias y datos que se van a solicitar a traves del prodcuto creado y solicitado
    .populate('category', 'name')
    .populate('subcategory', 'name')
    .populate('createdBy', 'username email');

    return res.status(201).json({ //lugo retorna el estado y dice que fue creado correctamente 
        success: true,
        message: 'Producto creado exitosamente',
        date: productWithDetails
    });

} catch (error) {
    console.error('Error en createproduct: ', error);

    //manejar error de duplicado (campo unico)
    if (error.code === 11000) {
        return res.status(400).json({
            success: false,
            message: 'Ya existe un producto con ese nombre'
        });
    }

    res.status(500).json({ //error de conexion al servidor 
        success: false,
        message: 'Error al crear producto',
        error: error.message
        });
    }
};

/**
 * READ: Obtener productos (con filtros de ativos/inactivos)
 * GET /api/products 
 * Query params:
 * -IcnludeInactive = true : Mostrar productos descativados
 * - Default: Solo productos activos (active = true)
 * Retorna: 
 * 1- 200: Array de productos poblados con categoria y subcategoria
 * 2- 500: Error en el servidor
 */

exports.getProducts = async (req, res) => { // reliza una consulta del http 
    try {
        // Determinar si incluir productos inactivos 
        const includeInactive = req.query.includeInactive === 'true';
        const activeFilter = includeInactive ? {} : { active: { $ne: false} };

        //Obtener productos con datos relacionados
        const products = await product.find(activeFilter)
            .populate('category', 'name')
            .populate('subcategory', 'name')
            .sort({ createdAt: -1});
        //si el usuario es auxiliar, no mostrar información de quien lo creó
        if (req.user &&req.user.role === 'auxiliar') {
        //ocultar campo cerateBy para usuarios auxiliares

        products.forEach(product => {
            product.createdBy = undefined;
        });
    }

        res.status(200).json({
            success: true, 
            count:products.length,
            data: products
        });

    } catch (error) {
        console.error('Error en getProducts: ', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener producto',
            error: error.message
        });
    };
};

/**
 * READ: Obtener un producto especifico por ID
 * 
 * GET /api/products/:id
 * 
 * Retorna: Producto poblado con categoria y subactegoria
 */

exports.getPorductById = async (req, res) => {
    try {
        //Obtener el producto por ID con datos relacionados (populate)
        const product = await Product.findById(req.params.id)
            .populate('category', 'name descripcion')
            .populate('subcategory', 'name description');

        if (!product) {
            return res.status(400).json({
                success: false,
                message: 'Producto no encontrado'
            });
        }

        // Ocultar createdBy para usuarios auxiliares 
        if (req.user && req.user.role === 'auxiliar') {
            product.createdBy = undefined;
        }

        res.status(200).json({ //todo funciono correctaamente
            success: true,
            data: product
        });

    } catch (error) {
        console.error('Error en getproductById: ', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener producto',
            error: error.message
    });
}
};

/**
 * UPDATE: Actualizar un producto
 * PUT /api/products/:id
 * body: { cualquier campo a actualizar}
 * 
 * - Solo actualiza campos enviados 
 * - Valida relaciones si se envian category o subcategory
 * - Retorna: producto actiualizado
 */

exports.updateProduct = async (req, res) => {
    try{
        const { name, description, price, stock, category, subcategory } = req.body;
        const updateData = {};

        // Agregar solo lois campos que fueronb enviados 
        if (name) updateData.name = name;
        if(description) updateData.descripcion = descripcion;
        if (price) updateData.price = price;
        if (stock) updateData.stock = stock;
        if (category) updateData.category = category;
        if (subcategory) updateData.subcategory = subcategory;

        // validar relaciones si se actualizan 
        if (category || subcategory) {
            if (category) {
                const categoryExists = await Category.findById(category);
                if (!categoryExists) {
                    return res.status(400).josn({
                        success: false,
                        message: 'la categoria solicitada no existe'
                    });

                }
            }
            if (subcategory) {
                const subcategoryExists = await subcategory.findOne({
                    _id: subcategory,
                    category: category || updateData.category
                });

                if (!subcategoryExists) {
                    return res.status(404).josn({
                        success: false,
                        message: 'La subcategoria no existe o no pertenece a la categoria'
                    });
                }
            }
        }
        //  Validar en producto en BD
        const updateProduct = await Product.findByIdAndupdate(req.params.id, updateData,{
            new: true,
            runvalidators: true
        }).populate('category', 'name')
            .populate('subcategory', 'name')
            .populate('createdBy', 'username email');
    
        if (!updateProduct) {
            return res.status(400).json({
                success: false,
                message: 'Producto no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            message: 'producto actualizado exitosamente',
            data: updateProduct
        });

    } catch (error) {
        console.error('Error en updateProduct: ', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar producto',
            error: error.message
        });
    }
};

/**
 * DELETE: Eliminar o desactivar un producto
 * DELETE /api/products/:id
 * query params:
 * - hardDelete=true : Eliminar permanentemente de la BD
 * - -Default: soft delete (marcar como incativo)
 * SOFT DELETE: Solo marca actie: false
 * HARD DELETE: Elimina permanentemente el documento 
 */
exports.deleteProduct = async (req, res) => {
    try {
        const isHardDelete = req.query.hardDelete === 'true';
        const product = await Product.findById(req.params.id);

        if(!product) {
            return res.status(404).json({
                success: false,
                message: 'Producto no encontrado',
            });
        }

        if (isHardDelete) {
            // ===HARD DELETE: Eliminar permanentemente de la BD
            await Product.findByIdAndDelete(req.params.id);
            res.status(200).json({
                success:true,
                message: 'producto eliminado permanentemente de la base de datos',
                data: product
            });
            
        } else {
            // === SOFT DELETE:Solo marcar como inactivo ====
            product.active = false;
            await product.save();
            res.status(200).json({
                success: true,
                message: 'Producto desactivado exitosamente (soft delete)',
                data: product
            });
        }

    } catch (error) {
        console.error('Error en deleteProduct: ', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar producto',
            error: error.message
        });
    }
};