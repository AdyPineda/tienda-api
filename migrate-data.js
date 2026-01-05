const mongoose = require('mongoose');
const Producto = require('./models/Producto');
require('dotenv').config();

const migrateData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Conectado a MongoDB');

        const db = mongoose.connection.db;
        
        // Obtener datos originales
        const productosOriginales = await db.collection('productos').find({}).toArray();
        console.log(`Encontrados ${productosOriginales.length} productos en la colección original`);

        // Mostrar estructura del primer producto
        if (productosOriginales.length > 0) {
            console.log('Estructura del primer producto:');
            console.log(JSON.stringify(productosOriginales[0], null, 2));
        }

        // Migrar cada producto
        let migrados = 0;
        for (let original of productosOriginales) {
            try {
                // Buscar si ya existe
                const existe = await Producto.findOne({ _id: original._id });
                
                if (!existe) {
                    // Crear nuevo producto manteniendo todos los datos originales
                    const productoMigrado = new Producto({
                        _id: original._id,
                        nombre: original.nombre || original.Nombre || 'Producto sin nombre',
                        categoria: original.categoria || original.Categoria || 'General',
                        talla: original.talla || original.Talla || 'Única',
                        precio: original.precio || original.Precio || 0,
                        stock: original.stock || original.Stock || 0,
                        marca: original.marca || original.Marca || 'Sin marca',
                        color: original.color || original.Color || 'Varios',
                        datos_originales: original // Guardar datos completos originales
                    });
                    
                    await productoMigrado.save();
                    migrados++;
                    console.log(`Migrado: ${productoMigrado.nombre}`);
                }
            } catch (error) {
                console.log(`Error migrando producto ${original._id}:`, error.message);
            }
        }

        console.log(`Migración completada: ${migrados} productos migrados`);
        
        // Verificar productos en el nuevo modelo
        const productosFinal = await Producto.find({});
        console.log(`Total de productos en el modelo: ${productosFinal.length}`);

        process.exit(0);
    } catch (error) {
        console.error('Error en migración:', error);
        process.exit(1);
    }
};

migrateData();