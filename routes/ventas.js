const express = require('express');
const router = express.Router();
const ventaController = require('../controllers/ventaController');

/**
 * @swagger
 * components:
 *   schemas:
 *     Venta:
 *       type: object
 *       required:
 *         - id_cliente
 *         - productos
 *         - total
 *         - metodo_pago
 *       properties:
 *         _id:
 *           type: string
 *           description: ID autogenerado de la venta
 *         id_cliente:
 *           type: string
 *           description: ID del cliente que realiza la compra
 *         fecha:
 *           type: string
 *           format: date-time
 *           description: Fecha de la venta
 *         productos:
 *           type: array
 *           description: Lista de productos en la venta
 *           items:
 *             type: object
 *             properties:
 *               id_producto:
 *                 type: string
 *                 description: ID del producto
 *               cantidad:
 *                 type: number
 *                 description: Cantidad comprada
 *                 minimum: 1
 *               subtotal:
 *                 type: number
 *                 description: Subtotal del producto (precio * cantidad)
 *                 minimum: 0
 *         total:
 *           type: number
 *           description: Total de la venta
 *           minimum: 0
 *         metodo_pago:
 *           type: string
 *           description: Método de pago utilizado
 *           enum: [efectivo, tarjeta, transferencia, paypal]
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *       example:
 *         _id: 507f1f77bcf86cd799439013
 *         id_cliente: 507f1f77bcf86cd799439012
 *         fecha: "2024-01-01T15:30:00.000Z"
 *         productos:
 *           - id_producto: 507f1f77bcf86cd799439011
 *             cantidad: 2
 *             subtotal: 51.98
 *           - id_producto: 507f1f77bcf86cd799439014
 *             cantidad: 1
 *             subtotal: 29.99
 *         total: 81.97
 *         metodo_pago: "tarjeta"
 *         createdAt: "2024-01-01T15:30:00.000Z"
 *         updatedAt: "2024-01-01T15:30:00.000Z"
 * 
 *     VentaInput:
 *       type: object
 *       required:
 *         - id_cliente
 *         - productos
 *         - total
 *         - metodo_pago
 *       properties:
 *         id_cliente:
 *           type: string
 *           description: ID del cliente
 *         productos:
 *           type: array
 *           items:
 *             type: object
 *             required:
 *               - id_producto
 *               - cantidad
 *               - subtotal
 *             properties:
 *               id_producto:
 *                 type: string
 *               cantidad:
 *                 type: number
 *                 minimum: 1
 *               subtotal:
 *                 type: number
 *                 minimum: 0
 *         total:
 *           type: number
 *           minimum: 0
 *         metodo_pago:
 *           type: string
 *           enum: [efectivo, tarjeta, transferencia, paypal]
 *       example:
 *         id_cliente: "507f1f77bcf86cd799439012"
 *         productos:
 *           - id_producto: "507f1f77bcf86cd799439011"
 *             cantidad: 2
 *             subtotal: 51.98
 *           - id_producto: "507f1f77bcf86cd799439014"
 *             cantidad: 1
 *             subtotal: 29.99
 *         total: 81.97
 *         metodo_pago: "tarjeta"
 * 
 *     VentaConDetalles:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         id_cliente:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             nombre:
 *               type: string
 *             correo:
 *               type: string
 *         fecha:
 *           type: string
 *           format: date-time
 *         productos:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id_producto:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   nombre:
 *                     type: string
 *                   precio:
 *                     type: number
 *                   marca:
 *                     type: string
 *               cantidad:
 *                 type: number
 *               subtotal:
 *                 type: number
 *         total:
 *           type: number
 *         metodo_pago:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *       example:
 *         _id: "507f1f77bcf86cd799439013"
 *         id_cliente:
 *           _id: "507f1f77bcf86cd799439012"
 *           nombre: "Juan Pérez"
 *           correo: "juan@example.com"
 *         fecha: "2024-01-01T15:30:00.000Z"
 *         productos:
 *           - id_producto:
 *               _id: "507f1f77bcf86cd799439011"
 *               nombre: "Camiseta Básica"
 *               precio: 25.99
 *               marca: "GuShop"
 *             cantidad: 2
 *             subtotal: 51.98
 *         total: 51.98
 *         metodo_pago: "tarjeta"
 *         createdAt: "2024-01-01T15:30:00.000Z"
 */

/**
 * @swagger
 * /api/ventas:
 *   get:
 *     summary: Obtener todas las ventas con detalles
 *     tags: [Ventas]
 *     description: Retorna todas las ventas con información de clientes y productos poblada
 *     responses:
 *       200:
 *         description: Lista de ventas obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: integer
 *                   description: Número total de ventas
 *                   example: 4
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/VentaConDetalles'
 *       500:
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Error al obtener las ventas"
 */
router.get('/', ventaController.getVentas);

/**
 * @swagger
 * /api/ventas/{id}:
 *   get:
 *     summary: Obtener una venta específica por ID
 *     tags: [Ventas]
 *     description: Retorna una venta específica con todos sus detalles poblados
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la venta a buscar
 *         example: "507f1f77bcf86cd799439013"
 *     responses:
 *       200:
 *         description: Venta encontrada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VentaConDetalles'
 *       404:
 *         description: Venta no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Venta no encontrada"
 *       500:
 *         description: Error del servidor
 */
router.get('/:id', ventaController.getVentaById);

/**
 * @swagger
 * /api/ventas:
 *   post:
 *     summary: Crear una nueva venta
 *     tags: [Ventas]
 *     description: Crea una nueva venta en el sistema
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VentaInput'
 *           examples:
 *             ejemploVenta:
 *               summary: Ejemplo de venta
 *               value:
 *                 id_cliente: "507f1f77bcf86cd799439012"
 *                 productos:
 *                   - id_producto: "507f1f77bcf86cd799439011"
 *                     cantidad: 2
 *                     subtotal: 51.98
 *                   - id_producto: "507f1f77bcf86cd799439014"
 *                     cantidad: 1
 *                     subtotal: 29.99
 *                 total: 81.97
 *                 metodo_pago: "tarjeta"
 *     responses:
 *       201:
 *         description: Venta creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/VentaConDetalles'
 *       400:
 *         description: Datos de entrada inválidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Datos de venta inválidos"
 *       500:
 *         description: Error del servidor
 */
router.post('/', ventaController.createVenta);

module.exports = router;