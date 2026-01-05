const express = require('express');
const router = express.Router();
const productoController = require('../controllers/productoController');

/**
 * @swagger
 * components:
 *   schemas:
 *     Producto:
 *       type: object
 *       required:
 *         - nombre
 *         - precio
 *         - stock
 *       properties:
 *         _id:
 *           type: string
 *           description: ID autogenerado del producto
 *         nombre:
 *           type: string
 *           description: Nombre del producto
 *         categoria:
 *           type: string
 *           description: Categoría del producto
 *         talla:
 *           type: string
 *           description: Talla del producto
 *         precio:
 *           type: number
 *           description: Precio del producto
 *         stock:
 *           type: number
 *           description: Cantidad en inventario
 *         marca:
 *           type: string
 *           description: Marca del producto
 *         color:
 *           type: string
 *           description: Color del producto
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *       example:
 *         _id: 507f1f77bcf86cd799439011
 *         nombre: "Camiseta Básica"
 *         categoria: "Ropa"
 *         talla: "M"
 *         precio: 25.99
 *         stock: 50
 *         marca: "GuShop"
 *         color: "Negro"
 *         createdAt: "2024-01-01T00:00:00.000Z"
 *         updatedAt: "2024-01-01T00:00:00.000Z"
 */

/**
 * @swagger
 * /api/productos:
 *   get:
 *     summary: Obtener todos los productos
 *     tags: [Productos]
 *     responses:
 *       200:
 *         description: Lista de productos obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Producto'
 *       500:
 *         description: Error del servidor
 */
router.get('/', productoController.getProductos);

/**
 * @swagger
 * /api/productos/{id}:
 *   get:
 *     summary: Obtener un producto por ID
 *     tags: [Productos]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del producto
 *     responses:
 *       200:
 *         description: Producto encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Producto'
 *       404:
 *         description: Producto no encontrado
 *       500:
 *         description: Error del servidor
 */
router.get('/:id', productoController.getProductoById);

/**
 * @swagger
 * /api/productos:
 *   post:
 *     summary: Crear un nuevo producto
 *     tags: [Productos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - precio
 *               - stock
 *             properties:
 *               nombre:
 *                 type: string
 *               categoria:
 *                 type: string
 *               talla:
 *                 type: string
 *               precio:
 *                 type: number
 *               stock:
 *                 type: number
 *               marca:
 *                 type: string
 *               color:
 *                 type: string
 *             example:
 *               nombre: "Laptop Gaming"
 *               categoria: "Electrónicos"
 *               talla: "15 pulgadas"
 *               precio: 1299.99
 *               stock: 10
 *               marca: "GamerTech"
 *               color: "Negro"
 *     responses:
 *       201:
 *         description: Producto creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Producto'
 *       400:
 *         description: Datos de entrada inválidos
 *       500:
 *         description: Error del servidor
 */
router.post('/', productoController.createProducto);

/**
 * @swagger
 * /api/productos/{id}:
 *   put:
 *     summary: Actualizar un producto existente
 *     tags: [Productos]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del producto a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               categoria:
 *                 type: string
 *               precio:
 *                 type: number
 *               stock:
 *                 type: number
 *             example:
 *               precio: 1199.99
 *               stock: 8
 *     responses:
 *       200:
 *         description: Producto actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Producto'
 *       404:
 *         description: Producto no encontrado
 *       400:
 *         description: Datos de entrada inválidos
 */
router.put('/:id', productoController.updateProducto);

/**
 * @swagger
 * /api/productos/{id}:
 *   delete:
 *     summary: Eliminar un producto
 *     tags: [Productos]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del producto a eliminar
 *     responses:
 *       200:
 *         description: Producto eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Producto eliminado correctamente"
 *       404:
 *         description: Producto no encontrado
 *       500:
 *         description: Error del servidor
 */
router.delete('/:id', productoController.deleteProducto);

module.exports = router;