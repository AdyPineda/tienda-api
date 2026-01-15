// models/Venta.js - VERSIÓN MEJORADA
const mongoose = require('mongoose');

const ventaSchema = new mongoose.Schema({
  cliente: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cliente',
    required: true
  },
  productos: [{
    producto: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Producto',
      required: true
    },
    nombre: {
      type: String,
      required: true
    },
    precio: {
      type: Number,
      required: true,
      min: 0
    },
    cantidad: {
      type: Number,
      required: true,
      min: 1,
      default: 1
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0
    }
  }],
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  envio: {
    type: Number,
    default: 0,
    min: 0
  },
  total: {
    type: Number,
    required: true,
    min: 0
  },
  estado: {
    type: String,
    required: true,
    enum: ['pendiente', 'procesando', 'enviado', 'entregado', 'cancelado'],
    default: 'pendiente'
  },
  metodoPago: {
    type: String,
    required: true,
    enum: ['efectivo', 'tarjeta_credito', 'tarjeta_debito', 'paypal', 'transferencia']
  },
  direccionEnvio: {
    calle: String,
    ciudad: String,
    estado: String,
    codigoPostal: String,
    pais: {
      type: String,
      default: 'México'
    }
  },
  notas: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Calcular subtotal y total antes de guardar
ventaSchema.pre('save', function(next) {
  // Calcular subtotal de productos
  this.subtotal = this.productos.reduce((sum, producto) => {
    return sum + (producto.precio * producto.cantidad);
  }, 0);
  
  // Calcular total (subtotal + envio)
  this.total = this.subtotal + this.envio;
  
  next();
});

// Virtual para información del cliente
ventaSchema.virtual('clienteInfo').get(function() {
  return `${this.cliente?.nombre || 'Cliente'} - ${this.cliente?.email || ''}`;
});

module.exports = mongoose.model('Venta', ventaSchema);