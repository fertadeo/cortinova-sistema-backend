const webpush = require('web-push');

console.log('🔑 Generando claves VAPID para Push Notifications...\n');

// Generar nuevas claves VAPID
const vapidKeys = webpush.generateVAPIDKeys();

console.log('✅ Claves VAPID generadas exitosamente!\n');

console.log('📋 Agrega estas variables a tu archivo .env:\n');
console.log(`VAPID_PUBLIC_KEY=${vapidKeys.publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${vapidKeys.privateKey}`);
console.log('VAPID_EMAIL=notifications@cortinova.com\n');

console.log('🔒 IMPORTANTE:');
console.log('- Guarda estas claves de forma segura');
console.log('- No las compartas en repositorios públicos');
console.log('- Usa diferentes claves para desarrollo y producción');
console.log('- La clave pública se puede compartir con el frontend');
console.log('- La clave privada debe mantenerse secreta en el servidor\n');

console.log('📱 Para usar en el frontend (PWA):');
console.log(`const vapidPublicKey = '${vapidKeys.publicKey}';`);
