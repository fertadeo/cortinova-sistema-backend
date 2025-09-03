const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkDatabase() {
  console.log('🔍 Verificando conexión a la base de datos...');
  
  // Configuración de conexión
  const config = {
    host: process.env.DB_HOST_DEV || 'localhost',
    port: 3306,
    user: process.env.DB_USER_DEV || 'root',
    password: process.env.DB_PASSWORD_DEV || '',
    database: process.env.DB_NAME_DEV || 'cortinova_db'
  };

  console.log('📋 Configuración de conexión:');
  console.log(`   Host: ${config.host}`);
  console.log(`   Puerto: ${config.port}`);
  console.log(`   Usuario: ${config.user}`);
  console.log(`   Base de datos: ${config.database}`);

  let connection;

  try {
    // Intentar conectar
    connection = await mysql.createConnection(config);
    console.log('✅ Conexión a la base de datos establecida correctamente');

    // Verificar si las tablas de notificaciones existen
    console.log('\n🔍 Verificando tablas de notificaciones...');
    
    const [tables] = await connection.execute(`
      SELECT TABLE_NAME, TABLE_ROWS, CREATE_TIME, UPDATE_TIME
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = ? 
      AND TABLE_NAME IN ('notifications', 'notification_settings', 'push_subscriptions')
    `, [config.database]);

    if (tables.length === 0) {
      console.log('❌ No se encontraron las tablas de notificaciones');
      console.log('💡 Ejecute el script: scripts/check-notifications-tables.sql');
      return false;
    }

    console.log('✅ Tablas encontradas:');
    tables.forEach(table => {
      console.log(`   - ${table.TABLE_NAME} (${table.TABLE_ROWS} filas)`);
    });

    // Verificar datos en las tablas
    console.log('\n📊 Verificando datos...');
    
    const [notificationCount] = await connection.execute('SELECT COUNT(*) as count FROM notifications');
    const [settingsCount] = await connection.execute('SELECT COUNT(*) as count FROM notification_settings');
    const [subscriptionCount] = await connection.execute('SELECT COUNT(*) as count FROM push_subscriptions');

    console.log(`   - Notificaciones: ${notificationCount[0].count}`);
    console.log(`   - Configuraciones: ${settingsCount[0].count}`);
    console.log(`   - Suscripciones push: ${subscriptionCount[0].count}`);

    // Verificar estructura de la tabla notifications
    console.log('\n🏗️ Verificando estructura de la tabla notifications...');
    
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
      FROM information_schema.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'notifications'
      ORDER BY ORDINAL_POSITION
    `, [config.database]);

    console.log('   Columnas de la tabla notifications:');
    columns.forEach(col => {
      console.log(`     - ${col.COLUMN_NAME}: ${col.DATA_TYPE} ${col.IS_NULLABLE === 'YES' ? '(NULL)' : '(NOT NULL)'}`);
    });

    console.log('\n✅ Verificación completada exitosamente');
    return true;

  } catch (error) {
    console.error('❌ Error durante la verificación:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Asegúrese de que MySQL esté ejecutándose');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('💡 Verifique las credenciales de la base de datos');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.log('💡 La base de datos no existe. Créela primero');
    }
    
    return false;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Ejecutar la verificación
checkDatabase()
  .then(success => {
    if (success) {
      console.log('\n🎉 La base de datos está lista para usar');
      process.exit(0);
    } else {
      console.log('\n⚠️ Hay problemas con la base de datos');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('💥 Error inesperado:', error);
    process.exit(1);
  });

