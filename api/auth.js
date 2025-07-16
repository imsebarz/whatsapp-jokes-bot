const WhatsAppClient = require('../src/whatsappClient');
const qrcode = require('qrcode');

// Endpoint para obtener QR y configurar WhatsApp inicialmente
module.exports = async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🔐 Iniciando proceso de autenticación WhatsApp...');
    
    const whatsappClient = new WhatsAppClient();

    let qrCodeData = null;
    let authStatus = 'waiting';

    // Inicializar cliente y configurar eventos
    const client = await whatsappClient.initialize();

    // Configurar eventos
    client.on('qr', async (qr) => {
      console.log('📱 QR Code generado');
      try {
        qrCodeData = await qrcode.toDataURL(qr);
        authStatus = 'qr_ready';
      } catch (qrError) {
        console.error('Error generando QR:', qrError);
        qrCodeData = qr; // Fallback a texto plano
      }
    });

    client.on('authenticated', () => {
      console.log('✅ WhatsApp autenticado');
      authStatus = 'authenticated';
    });

    client.on('ready', () => {
      console.log('🚀 WhatsApp listo');
      authStatus = 'ready';
    });

    client.on('auth_failure', (msg) => {
      console.log('❌ Fallo de autenticación:', msg);
      authStatus = 'auth_failed';
    });

    // Esperar hasta obtener QR o estar listo
    const startTime = Date.now();
    const timeout = 30000; // 30 segundos

    while (authStatus === 'waiting' && (Date.now() - startTime) < timeout) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Preparar respuesta
    let response = {
      status: authStatus,
      timestamp: new Date().toISOString()
    };

    if (authStatus === 'qr_ready' && qrCodeData) {
      response.qrCode = qrCodeData;
      response.message = 'Escanea este QR con WhatsApp Web';
    } else if (authStatus === 'ready') {
      response.message = 'WhatsApp ya está autenticado y listo';
    } else if (authStatus === 'authenticated') {
      response.message = 'WhatsApp autenticado, inicializando...';
    } else {
      response.message = 'Timeout o error en la autenticación';
    }

    // Limpiar cliente
    setTimeout(async () => {
      try {
        await whatsappClient.destroy();
      } catch (e) {
        console.log('Error limpiando cliente:', e.message);
      }
    }, 5000);

    res.status(200).json(response);

  } catch (error) {
    console.error('❌ Error en auth:', error.message);
    res.status(500).json({ 
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};
