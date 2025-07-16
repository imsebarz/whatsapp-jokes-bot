const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');

// Endpoint para obtener QR y configurar WhatsApp inicialmente
module.exports = async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🔐 Iniciando proceso de autenticación WhatsApp...');
    
    const client = new Client({
      authStrategy: new LocalAuth({
        dataPath: '/tmp/whatsapp-session'
      }),
      puppeteer: {
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ]
      }
    });

    let qrCodeData = null;
    let authStatus = 'waiting';

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

    // Inicializar cliente
    await client.initialize();

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
        await client.destroy();
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
