const mongoose = require('mongoose');

const ventaSchema = new mongoose.Schema({
    id_cliente: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cliente',
        required: true
    },
    fecha: {
        type: Date,
        default: Date.now
    },
    productos: [{
        id_producto: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Producto',
            required: true
        },
        cantidad: {
            type: Number,
            required: true,
            min: 1
        },
        subtotal: {
            type: Number,
            required: true,
            min: 0
        }
    }],
    total: {
        type: Number,
        required: true,
        min: 0
    },
    metodo_pago: {
        type: String,
        required: true,
        enum: ['efectivo', 'tarjeta', 'transferencia', 'paypal']
    }
}, {
    timestamps: true
});

ventaSchema.pre('save', function(next) {
    this.total = this.productos.reduce((sum, producto) => sum + producto.subtotal, 0);
    next();
});

module.exports = mongoose.model('Venta', ventaSchema);