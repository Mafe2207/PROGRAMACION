/**
 * Controlador de subcategorias
 * maneja todas las operaciones (CRUD) relacionadas con subcategorias
 * Estructura: una subcategoria depende de una categoria padre, una categoria puede tener varias subcategorias, un a subcategoria puede tener varios productos relacionados
 * Cuando una subcategoria se elimina o desactivan 
 * Cuando se ejecuta en cascada soft delete se eliminan de manera permanente
 * 
 */

const Subcategory = require('../models/Subcategory');
const Category = require('../models/category');
/**
 * Create: crear nueva subcategoria
 * POST /api/subcategories
 * auth bearer token requerido
 * roles: admin y coordinador
 * body requerido
 * name: nombre de la categoria
 * descripcion: descripcion de la subcategoria
 * retorna: 
 * 2010: subcategoria creada en MongoDB
 * 400: validacion fallida o nombre duplicado
 * 500: error en la base de datos
 */
exports.createSubategory = async (req, res) => {
    try{
        const { name, descripion, category } = req.body;
        
        
        //Validar que la categoria padre exista
        const parentCategory = await Category.findById(category); 
        if (!parentCategory){
            return res.status(404).json({
                success: false,
                message: 'La categoria no existe'
            });
        }

        // crear nueva categoria
        const newCategory = new Subcategoryategory({
            name: name.trim(),
            description: description.trim(),
            category: category
            
        });
        await new Subcategoryategory.Save();
        
        res.status(201).json({
            succes: true,
            message: 'Subcategoria creada exitosamente',
            data: newSubcategory
        });
    } catch (error) {
        console.error('Error en crear la Sub Categoria:', error);
        //manejo de error de indice unico
        if(error.message.includes('duplicate key') || error.message.includes ('ya existe')){
            return res.status(400).json ({
                succes: false,
                message: 'Ya existe una Subcategoria con ese nombre'
            });
        }
        // Error generico  del servidos
        res.status(500).json ({
            succes: false, 
            message: 'Error al crear catrgory',

        })
    }
};

/** 
 * Get consultar listado categorias
 * GET api/categories
 * por defecto retorna solo las categorias activas
 * con includeInactive=true retorna todas las categorias incluyendo las inactivas
 * ordena por desendente por fecha de creación 
 * retorna
 * 200: lista de categorias
 * 500: error de base de datos
*/

exports.getSubCategories = async (req, res) => {
    try{
    //por defecto solo las categorias activas
    //includeInactive=true permite ver desactivadas
    const includeInactive = req.query.includeInactive === 'true';
    const activeFilter = includeInactive ? {} : {
        active: { $ne: false} };
        const categories = await Category.find(activeFilter).sort({createdAt: -1});
        res.status(200).json ({
            success: true,
            data: categories
        });
    } catch (error) {
        console.error('Error en getCategories', error);
        res.status(500).json ({
            succes: false,
            message: 'Error al obtener categorias'
        })
    }    

};

/**
 * READ obtener una categoria por el especificador - id
 * GET /api/Subcategories/
 */

exports.getSubcategoryById = async (req, res) => {
    try{
        //por defecto solo se muestran las categorias activas
        // IncludeInactive = true permite ver todas las categorias incluyendo las desactivadas
        const Subcategory = await Subcategory.findById(req.params.id);

        if (!Subcategory) {
            return res.status(404).json({
                succes: false,
                message: 'Subcategoria no encontrada'
            });
        }
        res.status(200).json({
            succes: false,
            data: subcategory
        });
    } catch (error) {
        console.error('Error en obtener subcategoria por id', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener Subcategorias'
        });
    }
};

/**
 * UPDATE Actualizar Subcategoria existente
 * PUT /api/Subcategories/:id
 * Auth Bearer token requerido 
 * Rolos: admin y coordinaria
 * 1 - name: nombre de la Subcategoria 
 * 2 - descripcion: nueva descripcion de la Subcategoria
 * Si quiere solo actualiza el nombre o solo la descripcion o los dos
 * Retorna:
 * 1- 200: Categoria actualizada
 * 2- 400: Validacion de datos fallida o nombre duplicado
 * 3- 404: Categoria no encontrada
 * 4- 500: Erro en la base 
 */

exports.updateSubcategory = async (req, res) => {
    try {

        const {name, descripion, category} = req.body;

        // Verificar si cambia la categoria padre

        if (name) {

            const existingCategory = await Category.findById(category);          
            // Asegura que el nuevo nombre no sea el mismo id
            if (!parentCategory) {
                return res.status(400).json({
                    success: false,
                    message: 'La categoria no existe'
                });
            }
        }
        
        // Construir el objeto con los datos actualizados
        const updateSubcategory = await Subcategory.findByIdAndUpdate(req.params.id, { name: name ? name.trim(): undefined, description: description ? descripion.trim(): undefined, category}, {new: true, runValidators: true});
        
        if (!updateSubcategory) {
            return res.status(404).json({
                success: false,
                message: 'Subcategoria no encontrada',
            });
        }

        res.status(200).json({
            succes: false,
            message: 'Subcategoria actualizada exitosamente',
            data: updateSubcategory
        });
    }catch (error) {
        console.error('Error en Actualizar SubCategoria', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar la Subcategoria',

        });
    }

};

/**
 * DELETE eliminar o desactivar una categoria
 * DELETE /api/Subcategories/:id
 * Auth Bearer token requerido
 * Roles: admin
 * 
 * Query Params:
 * hardDelete: true elimina permanentemente de la base de datos
 * Default: Soft delete (solo desactivar)
 * SOFT DELETE: Marca la Subcategoria como inactiva
 * Desactiva en cascada todos los productos relacionados a la Subcategoria
 * Al activar retorna todos los datos de la categoria incluyendo los inactivos
 * 
 * HARD DELETE: Elimina permanenetemente la Subcategoria de la base de datos
 * Elimina en cascada la subcategoria productos relacionados
 * NO SE PUEDE RECUPERAR!
 * 
 * Retorna:
 * 1- 200: Subategoria eliminada o desactivada
 * 2- 404: Subategoria no encontrada
 * 3- 500: Error en la base de datos    
 */

exports.deleteSubcategory = async (req, res) => {
    try {
        const Product = require ('../models/Product');
        const isHardDelete = req.query.hardDelete === 'true';

        // Buscar la subcategoria a eliminar por su id
        const subcategory = await subcategory.findById(req.params.id);

        if (!subcategory) {
            return res.status(404).json({
                success: false,
                message: 'Subategoria no encontrada'
            });
        }

        if (isHardDelete) {
            // Eliminar en cascada subcategorias y productos relacionados

            // Paso 1 - Obtener IDs de todas los productos relacionados
            await Product.deleteMany({subcategory: req.params.id });

            // Paso 2 - Eliminar todas los productos de la categoria
            await Product.findByIdAndDelete( req.params.id );

            res.status(200).json({
                success: true,
                message: 'SubCategoria eliminada permanentemente y sus productos relacionados',
                data: {
                    subcategory: subcategory
                }
            });

        } else {

            // Soft delete - Solo marca la categoria como inactiva
            subcategory.active = false;
            await subcategory.save();

            // Desactivar todos los productos ralacionados
            
            const products = await Product.updateMany(
                { category: req.params.id },
                { active: false}
            );

            res.status(200).json({
                success: true,
                message: 'SubCategoria desactivada exitosamente como sus subcategorias y productos relacionados',
                data: {
                    subcategory: subcategory,
                    ProductDeactivated: Product.modifiedCount,
                }
            });
        } 
    } catch (error) {
        console.error('Error en deleteCategory', error);
        res.status(500).json({
            success: false,
            message: 'Error al desactivar la subcategoria',
            error: error.message
        });
    }
};