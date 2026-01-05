const Producto = require('../models/Producto');

exports.getProductos = async (req, res) => {
    try {
        console.log('Buscando productos en la base de datos...');
        
        // Buscar TODOS los productos sin filtros
        const productos = await Producto.find({});
        
        console.log(`Encontrados ${productos.length} productos`);
        
        res.json({
            success: true,
            count: productos.length,
            data: productos
        });
    } catch (error) {
        console.error('Error buscando productos:', error);
        res.status(500).json({ 
            success: false,
            message: error.message 
        });
    }
};

exports.getProductoById = async (req, res) => {
    try {
        const producto = await Producto.findById(req.params.id);
        if (!producto) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }
        res.json(producto);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Crear producto con validación mejorada
exports.createProducto = async (req, res) => {
    try {
        const productoData = {
            nombre: req.body.nombre || 'Producto sin nombre',
            precio: req.body.precio || 0,
            stock: req.body.stock || 0,
            categoria: req.body.categoria || 'General',
            talla: req.body.talla || 'Única',
            marca: req.body.marca || 'Sin marca',
            color: req.body.color || 'Varios',
            datos_originales: req.body // Guardar todos los datos originales
        };

        const producto = new Producto(productoData);
        await producto.save();
        
        res.status(201).json({
            success: true,
            data: producto
        });
    } catch (error) {
        res.status(400).json({ 
            success: false,
            message: error.message 
        });
    }
};

exports.updateProducto = async (req, res) => {
    try {
        const producto = await Producto.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!producto) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }
        res.json(producto);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.deleteProducto = async (req, res) => {
    try {
        const producto = await Producto.findByIdAndDelete(req.params.id);
        if (!producto) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }
        res.json({ message: 'Producto eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};