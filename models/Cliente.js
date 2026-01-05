const mongoose = require('mongoose');

const clienteSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        trim: true
    },
    correo: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    telefono: {
        type: String,
        required: true
    },
    direccion: {
        calle: {
            type: String,
            required: true
        },
        ciudad: {
            type: String,
            required: true
        },
        estado: {
            type: String,
            required: true
        },
        cp: {
            type: String,
            required: true
        }
    },
    fecha_registro: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Cliente', clienteSchema);