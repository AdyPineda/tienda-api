const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const jwt = require('jsonwebtoken');
const { swaggerUi, specs } = require('./swagger');
require('dotenv').config();

const app = express();

// Conectar a la base de datos
connectDB();

// Configuración CORS más permisiva
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Manejar preflight OPTIONS
app.options('*', cors());

app.use(express.json());

// Documentación Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }'
}));

// Importar rutas
const productosRoutes = require('./routes/productos');
const clientesRoutes = require('./routes/clientes');
const ventasRoutes = require('./routes/ventas');

// Usar rutas
app.use('/api/productos', productosRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/ventas', ventasRoutes);

// ============================================
// RUTAS DE AUTENTICACIÓN DIRECTAS
// ============================================

// Ruta de prueba para autenticación
app.get('/api/auth/test', (req, res) => {
  res.json({
    success: true,
    message: 'API de autenticación GU-SHOP funcionando ✓',
    timestamp: new Date().toISOString()
  });
});

// REGISTRO DE USUARIO
app.post('/api/auth/register', async (req, res) => {
  console.log('📝 [AUTH] Registro recibido:', req.body.email);

  try {
    const { nombre, email, password, telefono } = req.body;

    // Validaciones básicas
    if (!nombre || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Nombre, email y contraseña son requeridos'
      });
    }

    // Importar modelo Cliente (NO User)
    const Cliente = require('./models/Cliente');

    // Verificar si el usuario ya existe
    const clienteExistente = await Cliente.findOne({ email: email.toLowerCase().trim() });

    if (clienteExistente) {
      return res.status(400).json({
        success: false,
        message: 'El email ya está registrado'
      });
    }

    // Crear nuevo cliente (NO usuario)
    const nuevoCliente = new Cliente({
      nombre: nombre.trim(),
      email: email.toLowerCase().trim(),
      password: password, // En producción usar bcrypt
      telefono: telefono ? telefono.trim() : '',
      fechaRegistro: new Date(),
      direccion: {
        calle: '',
        ciudad: '',
        estado: '',
        codigoPostal: '',
        pais: 'México'
      }
    });

    // Guardar en la colección clientes
    await nuevoCliente.save();
    console.log('✅ [AUTH] Cliente creado en MongoDB:', nuevoCliente.email);

    // Generar token JWT
    const token = jwt.sign(
      {
        id: nuevoCliente._id,
        email: nuevoCliente.email,
        nombre: nuevoCliente.nombre
      },
      process.env.JWT_SECRET || 'gushop-secreto-temporal-2024',
      { expiresIn: '30d' }
    );

    // Responder con éxito
    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      data: {
        _id: nuevoCliente._id,
        nombre: nuevoCliente.nombre,
        email: nuevoCliente.email,
        telefono: nuevoCliente.telefono,
        token: token
      }
    });

  } catch (error) {
    console.error('❌ [AUTH] Error en registro:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al registrar usuario',
      error: error.message // Mostrar error para debugging
    });
  }
});

// LOGIN DE USUARIO
app.post('/api/auth/login', async (req, res) => {
  console.log('🔐 [AUTH] Login recibido:', req.body.email);

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email y contraseña son requeridos'
      });
    }

    // Importar modelo Cliente
    const Cliente = require('./models/Cliente');

    // Buscar cliente en colección clientes
    const cliente = await Cliente.findOne({ email: email.toLowerCase().trim() });

    if (!cliente) {
      console.log('⚠️ [AUTH] Cliente no encontrado:', email);
      return res.status(401).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Verificar contraseña
    if (password !== cliente.password) {
      console.log('⚠️ [AUTH] Contraseña incorrecta para:', email);
      return res.status(401).json({
        success: false,
        message: 'Contraseña incorrecta'
      });
    }

    // Generar token JWT
    const token = jwt.sign(
      {
        id: cliente._id,
        email: cliente.email,
        nombre: cliente.nombre
      },
      process.env.JWT_SECRET || 'gushop-secreto-temporal-2024',
      { expiresIn: '30d' }
    );

    console.log('✅ [AUTH] Login exitoso:', cliente.email);

    // Responder con éxito
    res.json({
      success: true,
      message: 'Login exitoso',
      data: {
        _id: cliente._id,
        nombre: cliente.nombre,
        email: cliente.email,
        telefono: cliente.telefono,
        token: token
      }
    });

  } catch (error) {
    console.error('❌ [AUTH] Error en login:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al iniciar sesión',
      error: error.message
    });
  }
});

// VERIFICAR TOKEN
app.post('/api/auth/verify', async (req, res) => {
  console.log('🔍 [AUTH] Verificando token...');

  try {
    const token = req.body.token || req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token no proporcionado'
      });
    }

    // Verificar token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'gushop-secreto-temporal-2024'
    );

    // Importar modelo Cliente
    const Cliente = require('./models/Cliente');

    // Buscar usuario
    const cliente = await Cliente.findById(decoded.id).select('-password');

    if (!cliente) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    console.log('✅ [AUTH] Token válido para:', cliente.email);

    res.json({
      success: true,
      data: cliente
    });

  } catch (error) {
    console.error('❌ [AUTH] Error verificando token:', error.message);

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token inválido'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expirado'
      });
    }

    res.status(401).json({
      success: false,
      message: 'Error al verificar token'
    });
  }
});

// OBTENER PERFIL
app.post('/api/auth/profile', async (req, res) => {
  try {
    const token = req.body.token || req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token no proporcionado'
      });
    }

    // Verificar token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'gushop-secreto-temporal-2024'
    );

    // Importar modelo Cliente
    const Cliente = require('./models/Cliente');

    // Buscar usuario
    const cliente = await Cliente.findById(decoded.id).select('-password');

    if (!cliente) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    res.json({
      success: true,
      data: cliente
    });

  } catch (error) {
    console.error('❌ Error obteniendo perfil:', error);
    res.status(401).json({
      success: false,
      message: 'Token inválido o expirado'
    });
  }
});



// ============================================
// RUTAS PARA CARRITO (CON MONGODB)
// ============================================

// Middleware para validar token
const validarTokenCarrito = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token no proporcionado'
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'gushop-secreto-temporal-2024'
    );

    req.userId = decoded.id;
    next();
  } catch (error) {
    console.error('❌ Error validando token para carrito:', error.message);
    return res.status(401).json({
      success: false,
      message: 'Token inválido o expirado'
    });
  }
};

// OBTENER CARRITO DE USUARIO
app.get('/api/carrito/:userId', validarTokenCarrito, async (req, res) => {
  try {
    const { userId } = req.params;

    // Verificar que el userId del token coincida con el de la ruta
    if (req.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'No autorizado para acceder a este carrito'
      });
    }

    // Importar modelo CarritoTemp si existe, sino usar objeto temporal
    let CarritoTemp;
    try {
      CarritoTemp = require('./models/CarritoTemp');
    } catch (e) {
      // Si no existe el modelo, usar objeto temporal
      console.log('⚠️ Modelo CarritoTemp no encontrado, usando almacenamiento temporal');
      CarritoTemp = null;
    }

    if (CarritoTemp) {
      // Usar MongoDB
      let cart = await CarritoTemp.findOne({ userId });

      if (!cart) {
        cart = await CarritoTemp.create({ userId, items: [] });
      }

      res.json({
        success: true,
        data: cart
      });
    } else {
      // Usar objeto temporal en memoria (solo para desarrollo)
      if (!app.locals.carritosTemporales) {
        app.locals.carritosTemporales = {};
      }

      if (!app.locals.carritosTemporales[userId]) {
        app.locals.carritosTemporales[userId] = {
          items: [],
          createdAt: new Date(),
          updatedAt: new Date()
        };
      }

      res.json({
        success: true,
        data: app.locals.carritosTemporales[userId]
      });
    }
  } catch (error) {
    console.error('❌ Error obteniendo carrito:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo carrito'
    });
  }
});

// ACTUALIZAR CARRITO
app.put('/api/carrito/:userId', validarTokenCarrito, async (req, res) => {
  try {
    const { userId } = req.params;
    const { items } = req.body;

    if (req.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'No autorizado para modificar este carrito'
      });
    }

    // Validar items
    if (!Array.isArray(items)) {
      return res.status(400).json({
        success: false,
        message: 'Los items deben ser un arreglo'
      });
    }

    // Importar modelo CarritoTemp si existe
    let CarritoTemp;
    try {
      CarritoTemp = require('./models/CarritoTemp');
    } catch (e) {
      CarritoTemp = null;
    }

    if (CarritoTemp) {
      // Usar MongoDB
      let cart = await CarritoTemp.findOne({ userId });

      if (!cart) {
        cart = await CarritoTemp.create({ userId, items });
      } else {
        cart.items = items;
        cart.updatedAt = Date.now();
        await cart.save();
      }

      res.json({
        success: true,
        data: cart,
        message: 'Carrito actualizado exitosamente'
      });
    } else {
      // Usar objeto temporal en memoria
      if (!app.locals.carritosTemporales) {
        app.locals.carritosTemporales = {};
      }

      app.locals.carritosTemporales[userId] = {
        items: items,
        createdAt: app.locals.carritosTemporales[userId]?.createdAt || new Date(),
        updatedAt: new Date()
      };

      res.json({
        success: true,
        data: app.locals.carritosTemporales[userId],
        message: 'Carrito actualizado exitosamente'
      });
    }
  } catch (error) {
    console.error('❌ Error actualizando carrito:', error);
    res.status(500).json({
      success: false,
      message: 'Error actualizando carrito'
    });
  }
});

// LIMPIAR CARRITO
app.delete('/api/carrito/:userId', validarTokenCarrito, async (req, res) => {
  try {
    const { userId } = req.params;

    if (req.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'No autorizado para limpiar este carrito'
      });
    }

    // Importar modelo CarritoTemp si existe
    let CarritoTemp;
    try {
      CarritoTemp = require('./models/CarritoTemp');
    } catch (e) {
      CarritoTemp = null;
    }

    if (CarritoTemp) {
      // Usar MongoDB
      await CarritoTemp.findOneAndDelete({ userId });
    } else {
      // Usar objeto temporal en memoria
      if (app.locals.carritosTemporales && app.locals.carritosTemporales[userId]) {
        delete app.locals.carritosTemporales[userId];
      }
    }

    res.json({
      success: true,
      message: 'Carrito limpiado exitosamente'
    });
  } catch (error) {
    console.error('❌ Error limpiando carrito:', error);
    res.status(500).json({
      success: false,
      message: 'Error limpiando carrito'
    });
  }
});

// MIGRAR CARRITO DE VISITANTE A USUARIO
app.post('/api/carrito/:userId/migrate', validarTokenCarrito, async (req, res) => {
  try {
    const { userId } = req.params;
    const { items: guestItems } = req.body;

    if (req.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'No autorizado para esta operación'
      });
    }

    // Validar items de visitante
    if (!Array.isArray(guestItems)) {
      return res.status(400).json({
        success: false,
        message: 'Los items del visitante deben ser un arreglo'
      });
    }

    // Importar modelo CarritoTemp si existe
    let CarritoTemp;
    try {
      CarritoTemp = require('./models/CarritoTemp');
    } catch (e) {
      CarritoTemp = null;
    }

    if (CarritoTemp) {
      // Usar MongoDB
      let cart = await CarritoTemp.findOne({ userId });

      if (!cart) {
        cart = await CarritoTemp.create({ userId, items: guestItems });
      } else {
        // Combinar items
        const existingItems = [...cart.items];

        guestItems.forEach(guestItem => {
          const existingIndex = existingItems.findIndex(item =>
            item.id_producto.toString() === guestItem.id_producto.toString()
          );

          if (existingIndex >= 0) {
            existingItems[existingIndex].cantidad += guestItem.cantidad;
          } else {
            existingItems.push(guestItem);
          }
        });

        cart.items = existingItems;
        cart.updatedAt = Date.now();
        await cart.save();
      }

      res.json({
        success: true,
        data: cart,
        message: 'Carrito migrado exitosamente'
      });
    } else {
      // Usar objeto temporal en memoria
      if (!app.locals.carritosTemporales) {
        app.locals.carritosTemporales = {};
      }

      let userCart = app.locals.carritosTemporales[userId]?.items || [];

      // Combinar items
      guestItems.forEach(guestItem => {
        const existingIndex = userCart.findIndex(item =>
          item.id_producto === guestItem.id_producto
        );

        if (existingIndex >= 0) {
          userCart[existingIndex].cantidad += guestItem.cantidad;
        } else {
          userCart.push(guestItem);
        }
      });

      app.locals.carritosTemporales[userId] = {
        items: userCart,
        createdAt: app.locals.carritosTemporales[userId]?.createdAt || new Date(),
        updatedAt: new Date()
      };

      res.json({
        success: true,
        data: app.locals.carritosTemporales[userId],
        message: 'Carrito migrado exitosamente'
      });
    }
  } catch (error) {
    console.error('❌ Error migrando carrito:', error);
    res.status(500).json({
      success: false,
      message: 'Error migrando carrito'
    });
  }
});

// ============================================
// RUTAS PRINCIPALES DE LA API
// ============================================

// Ruta principal
app.get('/', (req, res) => {
  res.json({
    message: 'API de Tienda GU-SHOP funcionando',
    version: '2.0.0',
    endpoints: {
      home: '/',
      documentation: '/api-docs',
      auth_test: '/api/auth/test',
      auth_register: 'POST /api/auth/register',
      auth_login: 'POST /api/auth/login',
      auth_profile: 'POST /api/auth/profile',
      productos: '/api/productos',
      clientes: '/api/clientes',
      ventas: '/api/ventas',
      carrito: '/api/carrito/:userId',
      status: '/api/status',
      health: '/api/health'
    }
  });
});

// Ruta de estado de la API y base de datos
app.get('/api/status', (req, res) => {
  const mongoose = require('mongoose');
  const dbStatus = mongoose.connection.readyState;

  let statusDB = 'Desconocido';
  switch (dbStatus) {
    case 0: statusDB = 'Desconectado'; break;
    case 1: statusDB = 'Conectado'; break;
    case 2: statusDB = 'Conectando'; break;
    case 3: statusDB = 'Desconectando'; break;
  }

  // Verificar carritos temporales
  const carritosCount = app.locals.carritosTemporales
    ? Object.keys(app.locals.carritosTemporales).length
    : 0;

  res.json({
    message: 'API funcionando correctamente',
    database: statusDB,
    carritos: {
      temporales: carritosCount,
      modelo: 'CarritoTemp disponible'
    },
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    auth: 'Disponible',
    features: {
      carrito: true,
      autenticacion: true,
      productos: true,
      ventas: true
    }
  });
});

// Ruta de salud simple
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'La API está funcionando correctamente',
    time: new Date().toLocaleString(),
    auth: 'Operativo',
    carrito: 'Disponible'
  });
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

// DIAGNÓSTICO DE CARRITOS (solo desarrollo)
if (process.env.NODE_ENV === 'development') {
  app.get('/api/debug/carritos', (req, res) => {
    const carritos = app.locals.carritosTemporales || {};

    res.json({
      success: true,
      count: Object.keys(carritos).length,
      data: carritos
    });
  });
}

// Ruta para ver clientes (solo desarrollo)
if (process.env.NODE_ENV === 'development') {
  app.get('/api/debug/clientes', async (req, res) => {
    try {
      const Cliente = require('./models/Cliente');
      const clientes = await Cliente.find({}).select('-password');
      res.json({
        success: true,
        count: clientes.length,
        data: clientes
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
}

// Manejo de rutas no encontradas
app.use('*', (req, res) => {
  console.log('⚠️ Ruta no encontrada:', req.originalUrl);
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada',
    path: req.originalUrl,
    availableEndpoints: {
      home: '/',
      status: '/api/status',
      health: '/api/health',
      auth: {
        test: 'GET /api/auth/test',
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        verify: 'POST /api/auth/verify',
        profile: 'POST /api/auth/profile'
      },
      productos: '/api/productos',
      clientes: '/api/clientes',
      ventas: '/api/ventas',
      carrito: {
        get: 'GET /api/carrito/:userId',
        update: 'PUT /api/carrito/:userId',
        delete: 'DELETE /api/carrito/:userId',
        migrate: 'POST /api/carrito/:userId/migrate'
      }
    }
  });
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error('❌ Error global:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Contacta al administrador'
  });
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log('='.repeat(60));
  console.log(`🚀 Servidor GU-SHOP v2.0 corriendo en puerto ${PORT}`);
  console.log(`🌐 Entorno: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📊 MongoDB: ${process.env.MONGODB_URI ? 'Conectado' : 'No configurado'}`);
  console.log(`🔐 Autenticación: DISPONIBLE`);
  console.log(`🛒 Carrito: DISPONIBLE (${process.env.NODE_ENV === 'development' ? 'Temporal en memoria' : 'MongoDB'})`);
  console.log(`📚 Documentación: http://localhost:${PORT}/api-docs`);
  console.log(`🧪 Test Auth: http://localhost:${PORT}/api/auth/test`);
  console.log(`🛒 Test Carrito: http://localhost:${PORT}/api/status`);
  console.log('='.repeat(60));
});