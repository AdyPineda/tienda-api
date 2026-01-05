const mongoose = require('mongoose');
require('dotenv').config();

const checkAtlasAdy = async () => {
    try {
        console.log('Conectando a tu cluster de Atlas...');
        console.log('Cluster: adys0');
        console.log('URL: adys0.ny15lpq.mongodb.net');
        console.log('Base de datos: GU-SHOP');
        console.log('Usuario: admin');
        
        // Mostrar connection string
        const connStr = process.env.MONGODB_URI;
        const safeConnStr = connStr ? connStr.replace(/:(.*)@/, ':********@') : 'No configurado';
        console.log('Connection string:', safeConnStr);
        
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('¡Conectado exitosamente a tu cluster adys0!');

        const db = mongoose.connection.db;
        
        // Verificar que estamos en la base de datos correcta
        console.log(`\nBase de datos actual: ${db.databaseName}`);
        
        // Verificar colecciones
        console.log('\nColecciones en GU-SHOP:');
        const collections = await db.listCollections().toArray();
        
        if (collections.length === 0) {
            console.log('No se encontraron colecciones');
        } else {
            collections.forEach(collection => {
                console.log(`   - ${collection.name}`);
            });
        }

        // Verificar datos específicamente en productos, clientes, ventas
        console.log('\n🔍 Verificando tus datos:');
        const targetCollections = ['productos', 'clientes', 'ventas'];
        
        for (let colName of targetCollections) {
            try {
                const count = await db.collection(colName).countDocuments();
                console.log(`   ${colName}: ${count} documentos`);
                
                if (count > 0) {
                    const sample = await db.collection(colName).findOne({});
                    console.log(`Campos: ${Object.keys(sample).join(', ')}`);
                }
            } catch (error) {
                console.log(`   ${colName}: No existe o error - ${error.message}`);
            }
        }

        console.log('\n¡Conexión a tu cluster adys0 exitosa!');
        process.exit(0);

    } catch (error) {
        console.error('\nError conectando a Atlas:', error.message);
        
        // Mensajes específicos según el error
        if (error.message.includes('authentication failed')) {
            console.log('\nPROBLEMA DE AUTENTICACIÓN:');
            console.log('   1. Verifica que el usuario "ady" exista en Atlas');
            console.log('   2. Verifica la contraseña en el archivo .env');
            console.log('   3. Ve a MongoDB Atlas → Database Access → verifica tu usuario');
        } else if (error.message.includes('getaddrinfo')) {
            console.log('\nPROBLEMA DE CONEXIÓN:');
            console.log('   1. Verifica tu conexión a internet');
            console.log('   2. Revisa si hay firewall bloqueando la conexión');
        } else if (error.message.includes('bad auth')) {
            console.log('\nCREDENCIALES INCORRECTAS:');
            console.log('   1. La contraseña puede ser incorrecta');
            console.log('   2. Ve a Atlas → Database Access → reset password si es necesario');
        }
        
        process.exit(1);
    }
};

checkAtlasAdy();