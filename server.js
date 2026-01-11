const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const { swaggerUi, specs } = require('./swagger');
require('dotenv').config();

const app = express();

// Conectar a la base de datos
connectDB();

app.use(cors());
app.use(express.json());

//Documentación
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }'
}));

// Importar rutas
const productosRoutes = require('./routes/productos');
const clientesRoutes = require('./routes/clientes');
const ventasRoutes = require('./routes/ventas');
const authRoutes = require('./routes/authRoutes');

// Usar rutas
app.use('/api/productos', productosRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/ventas', ventasRoutes);
app.use('/api/auth', authRoutes);
app.use(cors());

// Ruta principal
app.get('/', (req, res) => {
  res.json({ 
    message: 'API de Tienda GU-SHOP funcionando',
    version: '1.0.0',
    endpoints: {
      home: '/',
      documentation: '/api-docs',
      productos: '/api/productos',
      clientes: '/api/clientes', 
      ventas: '/api/ventas',
      status: '/api/status'
    }
  });
});

// Ruta de estado de la API y base de datos
app.get('/api/status', (req, res) => {
    const mongoose = require('mongoose');
    const dbStatus = mongoose.connection.readyState;
    
    let statusDB = 'Desconocido';
    switch(dbStatus) {
        case 0: statusDB = 'Desconectado'; break;
        case 1: statusDB = 'Conectado'; break;
        case 2: statusDB = 'Conectando'; break;
        case 3: statusDB = 'Desconectando'; break;
    }
    
    res.json({ 
        message: 'API funcionando correctamente',
        database: statusDB,
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Ruta de salud simple
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK',
        message: 'La API está funcionando correctamente',
        time: new Date().toLocaleString()
    });
});

// Manejo de rutas no encontradas
app.use('*', (req, res) => {
    res.status(404).json({ 
        message: 'Ruta no encontrada',
        path: req.originalUrl,
        availableEndpoints: {
            home: '/',
            status: '/api/status', 
            health: '/api/health',
            productos: '/api/productos',
            clientes: '/api/clientes',
            ventas: '/api/ventas'
        }
    });
});

// Manejo de errores global
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(500).json({ 
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong!'
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
    console.log(`Entorno: ${process.env.NODE_ENV || 'development'}`);
});

// Ruta temporal para diagnosticar productos
app.get('/api/debug/productos', async (req, res) => {
    try {
        const mongoose = require('mongoose');
        const db = mongoose.connection.db;
        
        // Obtener datos directamente de la colección
        const productosRaw = await db.collection('productos').find({}).toArray();
        
        res.json({
            message: 'Datos RAW de la colección productos',
            count: productosRaw.length,
            data: productosRaw
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// En server.js, después de las otras rutas:

