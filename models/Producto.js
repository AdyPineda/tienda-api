const mongoose = require('mongoose');

const productoSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    categoria: { type: String, required: true },
    talla: { type: String },
    precio: { type: Number, required: true },
    stock: { type: Number, default: 0 },
    marca: { type: String },
    color: { type: String },
    genero: { type: String },
    imagen: {
        type: String,
        default: 'https://res.cloudinary.com/dsdsikein/image/upload/v1712345678/gu-shop/default-product.jpg'
    },
    activo: { type: Boolean, default: true }
}, { timestamps: true });
module.exports = mongoose.model('Producto', productoSchema);