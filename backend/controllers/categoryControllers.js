/**
 * Controlador de categorias
 * maneja todas las operaciones (CRUD) relacionadas con categorias 
 * 
 */


const Category = require('../models/Category');
/**
 * Create: Crear nueva categoria
 * POST /api/categories
 * Auth Bearer token requerido 
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

exports.createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;

        //validación de los campos de entrada
        if (!name || typeof name !== 'string' || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: 'El nombre es obligatorio y debe ser texto válido'
            });
        }
        if (!description || typeof description !== 'string' || !description.trim()) {
            return res.status(400).json({
                success: false,
                message: 'La descripción es obligatoria y debe ser texto válido'
            });
        }

        //limpia espacios en blanco
        const trimmedName = name.trim();
        const trimmedDesc = description.trim();

        //verificar si ya existe una categoria con el mismo nombre 
        const existingCategory = await Category.findOne({ name: trimmedName });
        
        if (existingCategory) {
            return res.status(400).json({
                success: false,
                message: 'Ya existe una categoría con ese nombre'
            });
        }

        //crear nueva categoria 
        const newCategory = new Category({
            name: trimmedName, //Guardar el nombre sin espacios en blanco al crear la categoría 
            description: trimmedDesc //Guardar la descripción sin espacios en blanco al crear la categoría 
        });

    await newCategory.save();

        res.status(201).json({
            success: true,
            message: 'Categoria creada exitosamente',
            data: newCategory
        });

    } catch (error) {
        console.error('Error en createCategory:', error);

        //manejo de error de indice unico 
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'ya existe una categoría con ese nombre'
            });
        }
        // Error genérico del servidor
        res.status(500).json({
            success: false,
            message: 'Error al crear la categoría',
            error: error.message
        });
    }
};

/**
 * GET consulta listado de categprias 
 * GET /api/categories
 * por defecto retorna solo las categorias activas
 * con includeInactive=true retorna todas las categorias incluyendo las inactivas
 * Ordena por fecha de creacion descendente
 * retorna:
 * 1- 200: lista de categorias
 * 2- 500: Error de base de datos 
 */

exports.getCategories = async (req, res) => {
    try {
        //por defecto solo muestra las categorias activas 
        // IncludeInactive = true permite ver todas las categorias incluyendo las desactivadas
        const includeInactive = req.query.includeInactive === 'true';
        const activeFilter = includeInactive ? {} : { active: { $ne: false } };
        
        const categories = await Category.find(activeFilter).sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            data: categories
        });
    } catch (error) {
        console.error('Error en getCategories', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener categorías',
            error: error.message
        });
    }
};

/**
 * READ Obtener una categoria por el especificador - id 
 * GET /api/Categories/:id
 * 
 */

exports.getCategoryById = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Categoría no encontrada'
            });
        }

        res.status(200).json({
            success: true,
            data: category
        });

    } catch (error) {
        console.error('Error en getCategoryById', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener categoría',
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
     * name: Nombre de la categoria 
     * descrpcion: nueva descripcion
     * validaciones
     * si quiere solo actualizar el nombre sola la decripcion o los dos
     * Retorna: 
     * 200: categoria actualizada
     * 400: Nombre duplicado
     * 500: error de base de datos 
     * 
     */
exports.updateCategory = async (req, res) => {
    try {
        const { name, description } = req.body;
        const updateData = {};

        //solo actualizar campos que fueron enviados

        if (name) {
            updateData.name = name.trim();

            //Verificar si el nuevo nombre ya existe en otra categoria 
            const existingCategory = await Category.findOne({ name: updateData.name, _id: {$ne: req.params.id}});
            
            //Asegura que el nombre no sea el mismo id
            if (existingCategory) {
                return res.status (400).json({
                    success: false,
                    message: 'Este nombre ya existe'
                });
            }
        }

        if (description) {
            updateData.description = description.trim();
        }

        //Actualizar la categoria en la base de datos 
        const updateCategory = await Category.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true});

        if (!updateCategory) {
            return res.status(404).json({
                success: false,
                message: 'Categoria no encontrada',
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
 * Delete eliminar o desactivar una categoria
 * DELETE /api/categries/:id
 * Auth Bearer token requerido
 * roles: admin
 * 
 * query params:
 * hardDelete: true elimina permanentemente de la base de datos 
 * Default: Soft delete (solo desactivar)
 * SOFT Delete: marca la categoria como inactiva
 * Desactiva en cascada todas la subcatgorias, productos relacionados
 * al activar retorna todos los datos incluyendo los incativos
 * 
 * HARD Delete: elimina permanentemente la categoria de la base de datos 
 * elimina en cascada la categoria, subcategoria y productos relacionados
 * NO SE PUEDE RECUPERAR!
 * 
 * Rerorna:
 * 200: Categoria eliminadao desactivada 
 * 404: Categoria no encontrada
 * 500: Error de base de datos 
 */

exports.deleteCategory = async (req, res) => {
    try {
        const Subcategory = require('../models/Subcategory');
        const Product = require('../models/Product');
        const isHardDelete = req.query.hardDelete === 'true';
        
        //Buscar la categoria a eliminar 
        const category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(400).json({
                success: false,
                message: 'Categoria no encontrada'
            });
        }

        if (isHardDelete) {
            // Eliminar en cascada subcategorías y productos relacionados 

            // paso 1 - obtener ids de todas las subcategorías de esta categoría
            const subIds = (await Subcategory.find({ category: req.params.id })).map(s => s._id);

            // paso 2 - eliminar todos los productos que pertenecen a la categoría
            await Product.deleteMany({ category: req.params.id });

            // paso 3 - eliminar los productos de las subcategorías de esta categoría
            await Product.deleteMany({ subcategory: { $in: subIds } });

            // paso 4 - eliminar todas las subcategorías de esta categoría
            await Subcategory.deleteMany({ category: req.params.id });

            // paso 5 - eliminar la propia categoría
            await Category.findByIdAndDelete(req.params.id);

            res.status(200).json({
                success: true,
                message: 'Categoría eliminada permanentemente y sus subcategorías y productos relacionados',
                data: {
                    category: category
                }
            });

        } else {

                //Soft delete - solo mrac la categoria como incativa 
                category.active = false;
                await category.save();

                //Desactivar todas las subcategorias relacionadas
                const subcategories = await Subcategory.updateMany(
                    { category: req.params.id }, 
                    { active: false }
                );

                //deactivar todos los prodcutos relacionados por la categoria y subcategoria 
                const products = await Product.updateMany(
                    {category: req.params.id},
                    { active: false} 
                );

                res.status(200).json({
                    success: true,
                    message: 'Categoría desactivada y sus subcategorías y productos asociados',
                    data: {
                        category: category,
                        subcategoriesDeactivated: subcategories.modifiedCount,
                        productsDeactivated: products.modifiedCount
                    }
                });
            }     
        } catch (error) {
            console.error('Error en la deleteCategory:', error);
            res.status(500).json({
                success: false,
                message: 'Error al eliminar la categoria',
                error: error.message
            });
        }
    };