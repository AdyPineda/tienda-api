// Crea: backend/scripts/migrate-images.js
const mongoose = require('mongoose');
const cloudinary = require('../config/cloudinary');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI);
const Product = require('../models/Product');

// Mapeo de categorías a imágenes por defecto
const defaultImages = {
  'tenis': 'https://res.cloudinary.com/dsdsikein/image/upload/v1712345678/gu-shop/categories/shoes-default.jpg',
  'camisas': 'https://res.cloudinary.com/dsdsikein/image/upload/v1712345678/gu-shop/categories/shirts-default.jpg',
  'pantalones': 'https://res.cloudinary.com/dsdsikein/image/upload/v1712345678/gu-shop/categories/pants-default.jpg',
  'chamarras': 'https://res.cloudinary.com/dsdsikein/image/upload/v1712345678/gu-shop/categories/jackets-default.jpg',
  'shorts': 'https://res.cloudinary.com/dsdsikein/image/upload/v1712345678/gu-shop/categories/shorts-default.jpg'
};

const migrateImages = async () => {
  const products = await Product.find({});
  
  console.log(`Migrando ${products.length} productos...`);
  
  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    
    // Si ya tiene imagen, saltar
    if (product.imagen && product.imagen.includes('cloudinary.com')) {
      console.log(`✅ ${i+1}/${products.length}: ${product.nombre} ya tiene imagen Cloudinary`);
      continue;
    }
    
    // Asignar imagen por defecto basada en categoría
    const category = product.categoria?.toLowerCase();
    const defaultImage = defaultImages[category] || defaultImages.tenis;
    
    product.imagen = defaultImage;
    await product.save();
    
    console.log(`✅ ${i+1}/${products.length}: ${product.nombre} -> ${defaultImage}`);
    
    // Esperar para no sobrecargar
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log('🎉 Migración completada!');
  mongoose.disconnect();
};

migrateImages().catch(console.error);