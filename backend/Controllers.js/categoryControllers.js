/**
 * Controlador de categorias
 * maneja todas las operaciones (CRUD) relacionadas con categorias 
 * 
 */


const category = require('../models/category');
/**
 * Create: Crear nueva categoria
 * POST /api/categories
 * Aith Bearer token requerido 
 * Roles: admin y coordinador 
 * body requerido: 
 * name nombre de la categoria
 * descripcion: descripcion de la categoria
 * retorna:
 * 2010: categroia creada en MongoDB
 * 400: validacion fallida o nombre duplicado
 * 500: error en bese de datos 
 * 
 **/

exports.createCategory =async (req , res) => {
    try {
        const {name,descrpcion} = req.body;

        //validación de los campos de entrada
        if (!name || typeof name !== 'string' || name.trim()){
            return res.status(400).json({
                success: false,
                message: 'El nombre es obligatorio y debe ser texto valido'
            });
        }
        //limpia espacios en blanco
        const trimmedName = name.trim();
        const trimmedDesc = descripcion.trim();

        //verificar si ya existe uan categoria con el mismo nombre 
        const existingCategory = await Category.findOne
        ({name: trimmedName});
        if (existingCategory){
            return res.status(400).json({
                success: false,
                messge: 'ya existe una categoria con ese nombre'
            });
    }
    //crear nueva categoria 
    const newCategory =  new Category({
        name: trimmedName,
        descripcion: trimmedDesc
    });
    await newCategory.save();

        res.status(201).json({
            success: false,
            message: 'categoria creada exitosamente',
            data: newCategory
        });
    }catch (error) {
        console.error('Error en createCategory:', error);
        //manejode error de indice unico 
        if(error.code=== 11000){
            return res.status(400).json({
                success: false,
                message: 'ya existe una categoria con ese nombre'
            });
        }
        // Error generico del servidor
        res.status(500).json({
            success: false,
            message: 'Error al crear la categoria',
            error: error.message
        });
    }
};

/**
 * GET consulta listadp de categprias 
 * GET /api/categories
 * por defecto retorna sola las categorias activas
 * con includeInactive=true retorna todas las categorias incluyendo las inactivas
 * Ordena por desendente por fecha de ceracion 
 * retorna:
 * 200: lista de categorias
 * 500: error de base de datos 
 */

exports.getCategories = async (req, res) => {
    try {
    //por defecto solo las categorias acctivas 
    // InvludeInactive =req.query.includeInactive
    const includeInactive = req.query.includeInactive === 'true';
    const activefilter = includeInactive ?{} : {active: { $ne: false }};
        
        const categories = await Category.find(activeFilter).sort ({createdAt: -1});
        res.status(200).json({
            Success: true,
            data: categories
        });
    } catch (error) {
        console.error('Error en getcategorias', error);
        res.tatus(500).json({
            success: false,
            message: 'Error al obtener categorias',
            error: error.message
        });
    }    
    };

/**
 * READ Obtener una categoria especifica po id 
 * GET /api/Categories/:id
 * 
 */

exports.getCategoryById = async (req, res) => {
    try {
    //por defecto solo las categorias acctivas 
    // InvludeInactive =req.query.includeInactive
        const category = await Category.findById(req.params.id);
        if (!category)
        res.status(200).json({
            Success: true,
            data: category
        });
    } catch (error) {
        console.error('Error en getcategorias', error);
        res.tatus(500).json({
            success: false,
            message: 'Error al obtener categorias',
            error: error.message
        });
    }    
    };

    /**
     * UPDATE Actualizar categoria existente
     * PUT/api/categories/:id
     * Auth barer token requerido
     * roles: admin y coorinador
     * body
     * name: Nuevo nombre de la categoria 
     * descrpcion: nueva descripcion
     * validaciones
     * si quiere solo actualizar el nombre sola la decripcion o los dos
     * Retorna: 
     * 200: categoria actualizada
     * 400: Nombre duplicado
     * 500: error de base de datos 
     * 
     */
exports.updateCtegory = async (req, res)=> {
    try{
        const { name, descripcion} = req.body;
        const updateData = {};

        //solo actualizar campos que fueron envidos

        if (name) {
            updateData.name = name.trim();

            //Verificar si el nuevo nombre ya existe en otra categoria 
            const existing = await Category.findOne({name: upDate.Data.name, _id: {$ne: req.parms.id}});
            //asegura que el nombre no sea el mismo id
            if (existing) {
                return res.status (400).json({
                    success: false,
                    message: 'Este nombre ya existe'
                });
            }
        }

        if (descripcion) {
            updateData.descripcion = decripcion.trim();
        }

        //Actualizar la categoria en la base de datos 
        const updateCategory = await Category.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true});

        if (!updateCategory) {
            return res.status(404).json({
                success: false,
                message: 'Categoria actualizada exitosamente',
                data: updateCategory
            });
        }

        res.status (200).json({
            success: false,
            message: 'categoria actualizada exitosamente',
            data: updateCategory
        });

    } catch (error){
        console.error('Error en updatecategory',error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar la categoria',
            error: error.message
        });
    }
};

/**
 * Delete eliminar o desactovar una categoria
 * DELETE /api/categries/:id
 * Auth Bearer token requerido
 * roles: admin}
 * query param:
 * hardDelete=true elimina permanentemente de la base de datos 
 * Default: Soft delete (solo desactivar)
 * SOFT Delete: marca la categoria como inactiva
 * Desactiva en cascada todas la subcatgorias, productos relacionados
 * al activar retorna todos los datos incluyendo los incativos
 * 
 * HARD Delete: elimina permanentemente la categoria de la base de datos 
 * elimina en cascada la categoria, subcategoria y productos relacionados
 * NO se puede recuperar
 * 
 * Rerorna:
 * 200: Categoria eliminadao desactivada 
 * 404: Categoria no encontrada
 * 500: Error de base de datos 
 */

exports.deleteCategory = async (req, res) => {
    try {
        const SubCategory = require('../models/Product');
        const isHardDelete = req.query.hardFlete === true;
        
        //Buscar la categoria a eliminar 
        const category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(400).json({
                success: false,
                message: 'Categoria no encontrada'
            });
        }
        if (isHardDelete) {
            // Eliminar en cascada subcategoria y productos relacionados 



            //paso 1 obtener ids de todas la subcategorias relacionada a la subcategoria 
            const subUds = (await SubCategory.find({category: req.params.id})).map(s => s._id);
                //paso 2 eliminar todos los productos de categoria
                await Product.deleteMany({ category: req. params.id });
                //paso 3 eliminar todos los productos de lassubcategoria de esta categoria 
                await SubCategory.deleteMany({ Subcategory: {$in: subIds} });
                // paso 4 eliminar todas las subcategorias de esta categoria 
                await SubCategory.deleteMany({ category: req.params.id});
                //paso 5 eliminar las categoria misma 
                await Category.findByIdAndDelete(req.params.id);
                
                res.status(200).json({
                    success: true,
                    message: 'Categoria eliminada permanentemente y sus subcategorias y productos relacionados',
                    data: {
                        category: category
                    }
                });
            } else {

                //Soft delete - solo mrac la categoria como incativa 
                category.active = false;
                await category.save();

                //Desactivar todas las subcategorias relacionadas
                const subcatgories = await Subcategory.updateMany(
                    { category: req.params.id }, 
                    {active: false}
                );

                //deactivar todos los prodcutos relacionados por la categoria y subcategoria 
                const products = await Product.updateMany(
                    {category: req.params.id},
                    { active: false} 
                );

                res.status(200).josn({
                    success: true,
                    message: 'Categoria desactivada y sus subcategorias y productos asociados',
                    data: {
                        category: category,
                        subcategoriesDeactivated:
                        subcategories.modifiedCount,
                        productsDeactivated: products.mofiedCount
                    }
                });
            }     
        }catch (error){
            console.error('Error en la deleteCategory:', error);
            res.status(500).json({
                success: false,
                message: 'Error al desactivar la categoria',
                error: error.message
            });
        }
    };