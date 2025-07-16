const sendJoke = require('./send-joke');

// Endpoint para probar el envío manual de chistes
module.exports = async function handler(req, res) {
  console.log('🧪 Ejecutando prueba manual de chiste...');
  
  // Reutilizar la lógica del send-joke
  return await sendJoke(req, res);
};
