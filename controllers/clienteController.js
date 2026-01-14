// controllers/clienteController.js - VERSIÓN COMPLETA
const Cliente = require('../models/Cliente');

// Obtener todos los clientes (sin contraseñas)
exports.getClientes = async (req, res) => {
  try {
    const clientes = await Cliente.find().select('-password');
    res.json({
      success: true,
      count: clientes.length,
      data: clientes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error obteniendo clientes',
      error: error.message
    });
  }
};

// Obtener un cliente por ID
exports.getClienteById = async (req, res) => {
  try {
    const cliente = await Cliente.findById(req.params.id).select('-password');
    
    if (!cliente) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado'
      });
    }
    
    res.json({
      success: true,
      data: cliente
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error obteniendo cliente',
      error: error.message
    });
  }
};

// Actualizar un cliente
exports.updateCliente = async (req, res) => {
  try {
    const { nombre, telefono, direccion } = req.body;
    
    const cliente = await Cliente.findById(req.params.id);
    
    if (!cliente) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado'
      });
    }
    
    // Actualizar solo los campos permitidos
    if (nombre) cliente.nombre = nombre;
    if (telefono) cliente.telefono = telefono;
    if (direccion) cliente.direccion = { ...cliente.direccion, ...direccion };
    
    await cliente.save();
    
    // Devolver sin contraseña
    const clienteActualizado = await Cliente.findById(req.params.id).select('-password');
    
    res.json({
      success: true,
      message: 'Cliente actualizado exitosamente',
      data: clienteActualizado
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error actualizando cliente',
      error: error.message
    });
  }
};

// Eliminar un cliente
exports.deleteCliente = async (req, res) => {
  try {
    const cliente = await Cliente.findById(req.params.id);
    
    if (!cliente) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado'
      });
    }
    
    await Cliente.findByIdAndDelete(req.params.id);
    
    res.json({
      success: true,
      message: 'Cliente eliminado exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error eliminando cliente',
      error: error.message
    });
  }
};