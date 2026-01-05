const mongoose = require('mongoose');

const productoSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre es requerido'],
        trim: true
    },
    categoria: {
        type: String,
        default: 'General'
    },
    talla: {
        type: String,
        default: 'Única'
    },
    precio: {
        type: Number,
        required: [true, 'El precio es requerido'],
        min: 0,
        default: 0
    },
    stock: {
        type: Number,
        default: 0,
        min: 0
    },
    marca: {
        type: String,
        default: 'Sin marca'
    },
    color: {
        type: String,
        default: 'Varios'
    },
    
    descripcion: String,
    imagen: String,
    activo: {
        type: Boolean,
        default: true
    },
    
    datos_originales: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    }
}, {
    timestamps: true,
    strict: false 
});

module.exports = mongoose.model('Producto', productoSchema);