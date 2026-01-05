const Venta = require('../models/Venta');
const Producto = require('../models/Producto');

exports.getVentas = async (req, res) => {
    try {
        const ventas = await Venta.find()
            .populate('id_cliente', 'nombre correo')
            .populate('productos.id_producto', 'nombre precio')
            .sort({ fecha: -1 });
        res.json(ventas);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getVentaById = async (req, res) => {
    try {
        const venta = await Venta.findById(req.params.id)
            .populate('id_cliente')
            .populate('productos.id_producto');
        
        if (!venta) {
            return res.status(404).json({ message: 'Venta no encontrada' });
        }
        res.json(venta);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createVenta = async (req, res) => {
    try {
        const venta = new Venta(req.body);
        await venta.save();
        res.status(201).json(venta);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};