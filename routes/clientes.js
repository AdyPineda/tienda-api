const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/clienteController');

/**
 * @swagger
 * components:
 *   schemas:
 *     Cliente:
 *       type: object
 *       required:
 *         - nombre
 *         - correo
 *         - telefono
 *       properties:
 *         _id:
 *           type: string
 *         nombre:
 *           type: string
 *         correo:
 *           type: string
 *         telefono:
 *           type: string
 *         direccion:
 *           type: object
 *           properties:
 *             calle:
 *               type: string
 *             ciudad:
 *               type: string
 *             estado:
 *               type: string
 *             cp:
 *               type: string
 *         fecha_registro:
 *           type: string
 *           format: date-time
 *       example:
 *         _id: 507f1f77bcf86cd799439012
 *         nombre: "Juan Pérez"
 *         correo: "juan@example.com"
 *         telefono: "555-1234"
 *         direccion:
 *           calle: "Av. Principal 123"
 *           ciudad: "Ciudad de México"
 *           estado: "CDMX"
 *           cp: "01000"
 *         fecha_registro: "2024-01-01T00:00:00.000Z"
 */

/**
 * @swagger
 * /api/clientes:
 *   get:
 *     summary: Obtener todos los clientes
 *     tags: [Clientes]
 *     responses:
 *       200:
 *         description: Lista de clientes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Cliente'
 */
router.get('/', clienteController.getClientes);

/**
 * @swagger
 * /api/clientes/{id}:
 *   get:
 *     summary: Obtener un cliente por ID
 *     tags: [Clientes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Cliente encontrado
 *       404:
 *         description: Cliente no encontrado
 */
router.get('/:id', clienteController.getClienteById);

/**
 * @swagger
 * /api/clientes:
 *   post:
 *     summary: Crear un nuevo cliente
 *     tags: [Clientes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Cliente'
 *     responses:
 *       201:
 *         description: Cliente creado exitosamente
 */
router.post('/', clienteController.createCliente);

/**
 * @swagger
 * /api/clientes/{id}:
 *   put:
 *     summary: Actualizar un cliente
 *     tags: [Clientes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Cliente'
 *     responses:
 *       200:
 *         description: Cliente actualizado
 *       404:
 *         description: Cliente no encontrado
 */
router.put('/:id', clienteController.updateCliente);

module.exports = router;