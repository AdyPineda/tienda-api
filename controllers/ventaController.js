// controllers/ventaController.js - VERSIÓN COMPLETA
const Venta = require('../models/Venta');
const Producto = require('../models/Producto');
const Cliente = require('../models/Cliente');

// Obtener todas las ventas
exports.getVentas = async (req, res) => {
  try {
    const ventas = await Venta.find()
      .populate('cliente', 'nombre email telefono')
      .populate('productos.producto', 'nombre imagen precio')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: ventas.length,
      data: ventas
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error obteniendo ventas',
      error: error.message
    });
  }
};

// Obtener venta por ID
exports.getVentaById = async (req, res) => {
  try {
    const venta = await Venta.findById(req.params.id)
      .populate('cliente')
      .populate('productos.producto');
    
    if (!venta) {
      return res.status(404).json({
        success: false,
        message: 'Venta no encontrada'
      });
    }
    
    res.json({
      success: true,
      data: venta
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error obteniendo venta',
      error: error.message
    });
  }
};

// Obtener ventas de un cliente
exports.getVentasByCliente = async (req, res) => {
  try {
    const ventas = await Venta.find({ cliente: req.params.clienteId })
      .populate('productos.producto', 'nombre imagen')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: ventas.length,
      data: ventas
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error obteniendo ventas del cliente',
      error: error.message
    });
  }
};

// Crear nueva venta
exports.createVenta = async (req, res) => {
  try {
    const {
      cliente,
      productos,
      metodoPago,
      direccionEnvio,
      envio = 0,
      notas = ''
    } = req.body;

    // Validaciones básicas
    if (!cliente || !productos || !Array.isArray(productos) || productos.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cliente y productos son requeridos'
      });
    }

    // Verificar que el cliente existe
    const clienteExiste = await Cliente.findById(cliente);
    if (!clienteExiste) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado'
      });
    }

    // Preparar productos con información completa
    const productosConDetalles = [];
    
    for (const item of productos) {
      // Buscar producto en la base de datos
      const productoDB = await Producto.findById(item.producto);
      
      if (!productoDB) {
        return res.status(404).json({
          success: false,
          message: `Producto ${item.producto} no encontrado`
        });
      }

      // Verificar stock si está disponible
      if (productoDB.stock !== undefined && productoDB.stock < item.cantidad) {
        return res.status(400).json({
          success: false,
          message: `Stock insuficiente para ${productoDB.nombre}`
        });
      }

      productosConDetalles.push({
        producto: item.producto,
        nombre: productoDB.nombre,
        precio: productoDB.precio,
        cantidad: item.cantidad,
        subtotal: productoDB.precio * item.cantidad
      });
    }

    // Crear la venta
    const nuevaVenta = new Venta({
      cliente,
      productos: productosConDetalles,
      metodoPago: metodoPago || 'tarjeta_credito',
      direccionEnvio: direccionEnvio || clienteExiste.direccion || {},
      envio: parseFloat(envio) || 0,
      notas,
      estado: 'pendiente'
    });

    // Guardar la venta
    await nuevaVenta.save();

    // Actualizar stock de productos (simulado)
    // En una app real, aquí actualizarías el stock
    console.log('📦 Venta creada - Stock actualizado simulado');

    // Obtener venta con datos poblados para respuesta
    const ventaCreada = await Venta.findById(nuevaVenta._id)
      .populate('cliente', 'nombre email')
      .populate('productos.producto', 'nombre');

    res.status(201).json({
      success: true,
      message: 'Venta creada exitosamente',
      data: ventaCreada
    });

  } catch (error) {
    console.error('❌ Error creando venta:', error);
    res.status(500).json({
      success: false,
      message: 'Error creando venta',
      error: error.message
    });
  }
};

// Actualizar estado de venta
exports.updateEstado = async (req, res) => {
  try {
    const { estado } = req.body;
    
    const estadosPermitidos = ['pendiente', 'procesando', 'enviado', 'entregado', 'cancelado'];
    
    if (!estadosPermitidos.includes(estado)) {
      return res.status(400).json({
        success: false,
        message: 'Estado no válido'
      });
    }

    const venta = await Venta.findByIdAndUpdate(
      req.params.id,
      { estado },
      { new: true, runValidators: true }
    ).populate('cliente', 'nombre email');

    if (!venta) {
      return res.status(404).json({
        success: false,
        message: 'Venta no encontrada'
      });
    }

    res.json({
      success: true,
      message: `Estado de venta actualizado a: ${estado}`,
      data: venta
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error actualizando estado',
      error: error.message
    });
  }
};

// Estadísticas de ventas
exports.getEstadisticas = async (req, res) => {
  try {
    const totalVentas = await Venta.countDocuments();
    const ventasCompletadas = await Venta.countDocuments({ estado: 'entregado' });
    const totalIngresos = await Venta.aggregate([
      { $match: { estado: 'entregado' } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);
    
    // Ventas por mes (últimos 6 meses)
    const seisMesesAtras = new Date();
    seisMesesAtras.setMonth(seisMesesAtras.getMonth() - 6);
    
    const ventasPorMes = await Venta.aggregate([
      { $match: { createdAt: { $gte: seisMesesAtras } } },
      {
        $group: {
          _id: { 
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          totalVentas: { $sum: 1 },
          totalIngresos: { $sum: '$total' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.json({
      success: true,
      data: {
        totalVentas,
        ventasCompletadas,
        totalIngresos: totalIngresos[0]?.total || 0,
        ventasPorMes
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error obteniendo estadísticas',
      error: error.message
    });
  }
};