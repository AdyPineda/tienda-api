// routes/clientes.js
const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/clienteController');

// Estas rutas son para administración, no para autenticación
router.get('/', clienteController.getClientes);
router.get('/:id', clienteController.getClienteById);
router.put('/:id', clienteController.updateCliente);
router.delete('/:id', clienteController.deleteCliente);

module.exports = router;