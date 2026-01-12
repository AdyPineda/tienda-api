// routes/carrito.js
const express = require('express');
const router = express.Router();
const carritoController = require('../controllers/carritoController');
const auth = require('../middleware/auth');

// Aplicar middleware de autenticación a todas las rutas
router.use(auth);

/**
 * @swagger
 * /api/carrito/{userId}:
 *   get:
 *     summary: Obtener carrito del usuario
 *     tags: [Carrito]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Carrito obtenido exitosamente
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.get('/:userId', carritoController.getCart);

/**
 * @swagger
 * /api/carrito/{userId}:
 *   put:
 *     summary: Actualizar carrito del usuario
 *     tags: [Carrito]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       200:
 *         description: Carrito actualizado
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.put('/:userId', carritoController.updateCart);

/**
 * @swagger
 * /api/carrito/{userId}:
 *   delete:
 *     summary: Limpiar carrito del usuario
 *     tags: [Carrito]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *     responses:
 *       200:
 *         description: Carrito limpiado
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.delete('/:userId', carritoController.clearCart);

/**
 * @swagger
 * /api/carrito/{userId}/migrate:
 *   post:
 *     summary: Migrar carrito de visitante a usuario
 *     tags: [Carrito]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               items:
 *                 type: array
 *     responses:
 *       200:
 *         description: Carrito migrado exitosamente
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.post('/:userId/migrate', carritoController.migrateCart);

module.exports = router;