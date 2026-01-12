
const CarritoTemp = require('../models/CarritoTemp');

exports.getCart = async (req, res) => {
  try {
    const { userId } = req.params;
    let cart = await CarritoTemp.findOne({ userId });
    
    if (!cart) {
      cart = await CarritoTemp.create({ userId, items: [] });
    }
    
    res.json({ success: true, data: cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateCart = async (req, res) => {
  try {
    const { userId } = req.params;
    const { items } = req.body;
    
    let cart = await CarritoTemp.findOne({ userId });
    
    if (!cart) {
      cart = await CarritoTemp.create({ userId, items });
    } else {
      cart.items = items;
      cart.updatedAt = Date.now();
      await cart.save();
    }
    
    res.json({ success: true, data: cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.clearCart = async (req, res) => {
  try {
    const { userId } = req.params;
    
    await CarritoTemp.findOneAndDelete({ userId });
    
    res.json({ success: true, message: 'Carrito limpiado' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.migrateCart = async (req, res) => {
  try {
    const { userId } = req.params;
    const { items: guestItems } = req.body;
    
    let cart = await CarritoTemp.findOne({ userId });
    
    if (!cart) {
      cart = await CarritoTemp.create({ userId, items: guestItems });
    } else {
      // Combinar items, sumando cantidades si existen
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
    
    res.json({ success: true, data: cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};