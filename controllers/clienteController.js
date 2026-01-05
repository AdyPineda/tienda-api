const Cliente = require('../models/Cliente');

exports.getClientes = async (req, res) => {
    try {
        const clientes = await Cliente.find().sort({ fecha_registro: -1 });
        res.json(clientes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getClienteById = async (req, res) => {
    try {
        const cliente = await Cliente.findById(req.params.id);
        if (!cliente) {
            return res.status(404).json({ message: 'Cliente no encontrado' });
        }
        res.json(cliente);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createCliente = async (req, res) => {
    try {
        const cliente = new Cliente(req.body);
        await cliente.save();
        res.status(201).json(cliente);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.updateCliente = async (req, res) => {
    try {
        const cliente = await Cliente.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!cliente) {
            return res.status(404).json({ message: 'Cliente no encontrado' });
        }
        res.json(cliente);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};