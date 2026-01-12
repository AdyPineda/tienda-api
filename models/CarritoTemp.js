// models/CarritoTemp.js
const mongoose = require('mongoose');

const carritoTempSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cliente',
    required: true,
    unique: true
  },
  items: [{
    id_producto: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Producto',
      required: true
    },
    nombre: String,
    precio: Number,
    imagen: String,
    cantidad: {
      type: Number,
      required: true,
      min: 1,
      default: 1
    },
    talla: String,
    color: String
  }]
}, {
  timestamps: true
});

// TTL Index: eliminar después de 30 días
carritoTempSchema.index({ updatedAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

module.exports = mongoose.model('CarritoTemp', carritoTempSchema);