// Cliente Amadeus preconfigurado
let amadeus = null;

try {
  const Amadeus = require('amadeus');
  
  const clientId = process.env.AMADEUS_CLIENT_ID;
  const clientSecret = process.env.AMADEUS_CLIENT_SECRET;
  
  if (!clientId || !clientSecret) {
    console.warn('⚠️  AMADEUS_CLIENT_ID o AMADEUS_CLIENT_SECRET no están configurados en .env');
  }
  
  amadeus = new Amadeus({
    clientId: clientId || 'test',
    clientSecret: clientSecret || 'test',
    // Por defecto usa el entorno de sandbox si no se especifica
    hostname: process.env.AMADEUS_HOSTNAME || 'test'
  });
  
  console.log('✅ Cliente Amadeus inicializado correctamente');
} catch (error) {
  console.error('❌ Error al inicializar cliente Amadeus:', error.message);
  console.error('Asegúrate de ejecutar: npm install amadeus');
}

module.exports = amadeus;

