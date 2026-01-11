const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Ruta de prueba
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'API de autenticación funcionando',
    endpoints: {
      register: 'POST /api/auth/register',
      login: 'POST /api/auth/login',
      verify: 'POST /api/auth/verify'
    }
  });
});

// Rutas principales
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/verify', authController.verifyToken);

module.exports = router;