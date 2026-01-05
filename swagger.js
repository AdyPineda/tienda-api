const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API GU-SHOP - Tienda Online',
      version: '1.0.0',
      description: 'API RESTful para gestión de tienda online con MongoDB',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor de desarrollo'
      },
    ],
    tags: [
      {
        name: 'Productos',
        description: 'Operaciones con productos'
      },
      {
        name: 'Clientes', 
        description: 'Gestión de clientes'
      },
      {
        name: 'Ventas',
        description: 'Gestión de ventas'
      }
    ]
  },
  apis: ['./routes/*.js'], // archivos que contienen la documentación
};

const specs = swaggerJsdoc(options);

module.exports = { swaggerUi, specs };