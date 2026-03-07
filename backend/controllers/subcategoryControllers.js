/**
 * Controlador de subcategorias
 * maneja todas las operaciones (CRUD) relacionadas con subcategorias
 * Estructura: una subcategoria depende de una categoria padre, una categoria puede tener varias subcategorias, un a subcategoria puede tener varios productos relacionados
 * Cuando una subcategoria se elimina o desactivan 
 * Cuando se ejecuta en cascada soft delete se eliminan de manera permanente
 * 
 */

const Subcategory = require('../models/Subcategory');
const Category = require('../models/Category');
/**
 * Create: crear nueva subcategoria
 * POST /api/subcategories
 * auth bearer token requerido
 * roles: admin y coordinador
 * body requerido
 * - 1name: nombre de la categoria
 * 2- descripcion: descripcion de la subcategoria
 * retorna: 
 * 1- 2010: subcategoria creada en MongoDB
 * 2- 400: validacion fallida o nombre duplicado
 * 3- 404: Categoria padre no existe 
 * 4- 500: error en la base de datos
 */
exports.createSubcategory = async (req, res) => {
    try{
        const { name, description, category } = req.body;
        
        //Validar que la categoria padre exista
        const parentCategory = await Category.findById(category); 

        if (!parentCategory){
            return res.status(404).json({
                success: false,
                message: 'La categoria no existe'
            });
        }

        // crear nueva Subcategoria
        const newSubcategory = new Subcategory({
            name: name.trim(),
            description: description.trim(),
            category: category
        });
        await newSubcategory.save();
        
        res.status(201).json({
            success: true,
            message: 'Subcategoria creada exitosamente',
            data: newSubcategory
        });
    } catch (error) {
        console.error('Error en crear la Sub Categoria:', error);

        if(error.message.includes('duplicate key') || error.message.includes('ya existe')){
            return res.status(400).json ({
                success: false,
                message: 'Ya existe una Subcategoria con ese nombre'
            });
        }
        res.status(500).json ({
            success: false, 
            message: 'Error al crear categoria',
        });
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

exports.getSubcategories = async (req, res) => {
    try{
        const includeInactive = req.query.includeInactive === 'true';
        const activeFilter = includeInactive ? {} : { active: { $ne: false }};
        
        const subcategories = await Subcategory.find(activeFilter).populate('category', 'name');
        res.status(200).json ({
            success: true,
            data: subcategories
        });

    } catch (error) {
        console.error('Error en subcategorias', error);
        res.status(500).json ({
            success: false,
            message: 'Error al obtener categorias'
        });
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
        const subcategory = await Subcategory.findById(req.params.id).populate('category', 'name');

        if (!Subcategory) {
            return res.status(404).json({
                succes: false,
                message: 'Subcategoria no encontrada'
            });
        }

        res.status(200).json({
            succes: true,
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
 * Roles: admin y coordinador
 * Body:
 * 1 - name: nombre de la Subcategoria 
 * 2 - descripcion: nueva descripcion de la Subcategoria
 * 3- category: nuevo id de la categoria
 * VALIDACIONES:
 * - Si se cambia la categoria, verifica que exista
 * - Si quiere solo actualiza el nombre o solo la descripcion o los dos
 * Retorna:
 * 1- 200: subCategoria actualizada
 * 2- 404: subcategoria no encontrada
 * 3- 500: Error en la base de datos
 */

exports.updateSubcategory = async (req, res) => {
    try {

        const {name, description, category} = req.body;

        // Verificar si cambia la categoria padre

        if (name) {

            const parentCategory = await Category.findById(category);          
            // Asegura que el nuevo nombre no sea el mismo id
            if (!parentCategory) {
                return res.status(400).json({
                    success: false,
                    message: 'La categoria no existe'
                });
            }
        }
        
        // Construir el objeto de actualizacion solo con campos enviados
        const updateSubcategory = await Subcategory.findByIdAndUpdate(req.params.id, { name: name ? name.trim(): undefined, description: description ? descripion.trim(): undefined, category}, { new: true, runValidators: true});
        
        if (!updateSubcategory) {
            return res.status(404).json({
                success: false,
                message: 'Subcategoria no encontrada',
            });
        }

        res.status(200).json({
            succes: true,
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
 * DELETE eliminar o desactivar una subcategoria
 * DELETE /api/Subcategories/:id
 * Auth Bearer token requerido
 * Roles: admin
 * 
 * Query Params:
 * hardDelete: true elimina permanentemente de la base de datos
 * Default: Soft delete (solo desactivar)
 * SOFT DELETE: Marca la Subcategoria como inactiva
 * Desactiva en cascada todos los productos relacionados a la Subcategoria
 * Al activar retorna todos los datos de la subcategoria incluyendo los inactivos
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
        const subcategory = await Subcategory.findById(req.params.id);

        if (!subcategory) {
            return res.status(404).json({
                success: false,
                message: 'Subcategoria no encontrada'
            });
        }

        if (isHardDelete) {
            // Eliminar en cascada subcategorias y productos relacionados

            // Paso 1 - Obtener IDs de todas los productos relacionados
            await Product.deleteMany({ subcategory: req.params.id });

            // Paso 2 - Eliminar todas los productos de la categoria
            await Subcategory.findByIdAndDelete( req.params.id );

            res.status(200).json({
                success: true,
                message: 'Subcategoria eliminada permanentemente y sus productos relacionados',
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
                { subcategory: req.params.id },
                { active: false}
            );

            res.status(200).json({
                success: true,
                message: 'Subcategoria desactivada exitosamente como sus subcategorias y productos relacionados',
                data: {
                    subcategory: subcategory,
                    productsDeactivated: Product.modifiedCount,
                }
            });
        } 
    } catch (error) {
        console.error('Error al desactivasr la subcategoria', error);
        res.status(500).json({
            success: false,
            message: 'Error al desactivar la subcategoria',
            error: error.message
        });
    }
};