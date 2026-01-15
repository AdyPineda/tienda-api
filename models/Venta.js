// models/Venta.js - Verifica esta estructura
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
            required: true
        },
        cantidad: {
            type: Number,
            required: true,
            min: 1
        },
        subtotal: {
            type: Number,
            required: true
        }
    }],
    subtotal: {
        type: Number,
        required: true
    },
    envio: {
        type: Number,
        default: 0
    },
    total: {
        type: Number,
        required: true
    },
    metodoPago: {
        type: String,
        enum: ['tarjeta_credito', 'paypal', 'efectivo', 'transferencia'],
        default: 'tarjeta_credito'
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
    estado: {
        type: String,
        enum: ['pendiente', 'procesando', 'enviado', 'entregado', 'cancelado'],
        default: 'pendiente'
    },
    notas: String
}, {
    timestamps: true
});

// Middleware para calcular total antes de guardar
ventaSchema.pre('save', function (next) {
    // Si ya tenemos subtotal y envío, calcular total
    if (this.subtotal !== undefined && this.envio !== undefined) {
        this.total = this.subtotal + this.envio;
    }

    // Calcular subtotal de productos si no existe
    if (this.productos && this.productos.length > 0 && !this.subtotal) {
        this.subtotal = this.productos.reduce((sum, item) => {
            return sum + (item.precio * item.cantidad);
        }, 0);
        this.total = this.subtotal + (this.envio || 0);
    }

    next();
});

module.exports = mongoose.model('Venta', ventaSchema);