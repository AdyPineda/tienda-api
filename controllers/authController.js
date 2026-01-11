const Cliente = require('../models/Cliente');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// REGISTRO
exports.register = async (req, res) => {
  try {
    console.log('📝 Recibiendo registro:', req.body);
    
    const { nombre, email, password, telefono } = req.body;

    // Validaciones
    if (!nombre || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Faltan campos requeridos'
      });
    }

    // Verificar si ya existe
    const existingClient = await Cliente.findOne({ email });
    if (existingClient) {
      return res.status(400).json({
        success: false,
        message: 'El email ya está registrado'
      });
    }

    // Crear cliente
    const cliente = new Cliente({
      nombre,
      email,
      password, // Se hasheará en el modelo
      telefono: telefono || '',
      fechaRegistro: new Date()
    });

    await cliente.save();

    // Generar token simple
    const token = jwt.sign(
      { id: cliente._id, email: cliente.email },
      process.env.JWT_SECRET || 'secret-key-gushop',
      { expiresIn: '30d' }
    );

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      data: {
        _id: cliente._id,
        nombre: cliente.nombre,
        email: cliente.email,
        telefono: cliente.telefono,
        token: token
      }
    });

  } catch (error) {
    console.error('❌ Error en registro:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// LOGIN
exports.login = async (req, res) => {
  try {
    console.log('🔐 Recibiendo login:', req.body.email);
    
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email y contraseña son requeridos'
      });
    }

    // Buscar cliente
    const cliente = await Cliente.findOne({ email });
    
    if (!cliente) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales incorrectas'
      });
    }

    // Verificar contraseña (comparar directamente si no hay bcrypt)
    // Si usas bcrypt en el modelo, descomenta esto:
    // const isMatch = await cliente.comparePassword(password);
    const isMatch = password === cliente.password; // TEMPORAL - solo para prueba

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales incorrectas'
      });
    }

    // Generar token
    const token = jwt.sign(
      { id: cliente._id, email: cliente.email },
      process.env.JWT_SECRET || 'secret-key-gushop',
      { expiresIn: '30d' }
    );

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
    console.error('❌ Error en login:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// VERIFICAR TOKEN
exports.verifyToken = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1] || req.body.token;
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token no proporcionado'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret-key-gushop');
    
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
    console.error('❌ Error verificando token:', error);
    res.status(401).json({
      success: false,
      message: 'Token inválido o expirado'
    });
  }
};