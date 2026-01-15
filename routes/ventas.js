// routes/ventas.js - VERSIÓN COMPLETA
const express = require('express');
const router = express.Router();
const ventaController = require('../controllers/ventaController');

/**
 * @swagger
 * /api/ventas:
 *   get:
 *     summary: Obtener todas las ventas
 *     tags: [Ventas]
 *     responses:
 *       200:
 *         description: Lista de ventas
 */
router.get('/', ventaController.getVentas);

/**
 * @swagger
 * /api/ventas/estadisticas:
 *   get:
 *     summary: Obtener estadísticas de ventas
 *     tags: [Ventas]
 *     responses:
 *       200:
 *         description: Estadísticas de ventas
 */
router.get('/estadisticas', ventaController.getEstadisticas);

/**
 * @swagger
 * /api/ventas/cliente/{clienteId}:
 *   get:
 *     summary: Obtener ventas de un cliente
 *     tags: [Ventas]
 *     parameters:
 *       - in: path
 *         name: clienteId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Ventas del cliente
 */
router.get('/cliente/:clienteId', ventaController.getVentasByCliente);

/**
 * @swagger
 * /api/ventas/{id}:
 *   get:
 *     summary: Obtener una venta por ID
 *     tags: [Ventas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Venta encontrada
 */
router.get('/:id', ventaController.getVentaById);

/**
 * @swagger
 * /api/ventas:
 *   post:
 *     summary: Crear una nueva venta
 *     tags: [Ventas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - cliente
 *               - productos
 *               - metodoPago
 *             properties:
 *               cliente:
 *                 type: string
 *               productos:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     producto:
 *                       type: string
 *                     cantidad:
 *                       type: number
 *               metodoPago:
 *                 type: string
 *               direccionEnvio:
 *                 type: object
 *               envio:
 *                 type: number
 *               notas:
 *                 type: string
 *     responses:
 *       201:
 *         description: Venta creada
 */
router.post('/', ventaController.createVenta);

/**
 * @swagger
 * /api/ventas/{id}/estado:
 *   patch:
 *     summary: Actualizar estado de venta
 *     tags: [Ventas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               estado:
 *                 type: string
 *     responses:
 *       200:
 *         description: Estado actualizado
 */
router.patch('/:id/estado', ventaController.updateEstado);

module.exports = router;