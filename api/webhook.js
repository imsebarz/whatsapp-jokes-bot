const sendJoke = require('./send-joke');

// Endpoint webhook para servicios externos que quieran activar chistes
module.exports = async function handler(req, res) {
  // Verificar que sea POST y que tenga un token simple de seguridad
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Token simple de seguridad (opcional)
  const authHeader = req.headers.authorization;
  const expectedToken = process.env.WEBHOOK_TOKEN; // Configurar en Vercel
  
  if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  console.log('🔗 Webhook activado para enviar chiste...');
  
  // Reutilizar la lógica del send-joke
  return await sendJoke(req, res);
};
