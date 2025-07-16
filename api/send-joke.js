const { Client, LocalAuth } = require('whatsapp-web.js');
const JokeService = require('../src/jokeService');
const JokeCounter = require('../src/jokeCounterVercel');

// Configuración manual para Vercel (sin dotenv)
const Config = {
  openaiApiKey: process.env.OPENAI_API_KEY,
  targetChatId: process.env.TARGET_CHAT_ID,
  useContextualJokes: process.env.USE_CONTEXTUAL_JOKES?.toLowerCase() === 'true',
  chatHistoryLimit: parseInt(process.env.CHAT_HISTORY_LIMIT) || 300,
  debugMode: process.env.DEBUG_MODE?.toLowerCase() === 'true',
  genericJokesBeforeContextual: parseInt(process.env.GENERIC_JOKES_BEFORE_CONTEXTUAL) || 2
};

// Esta función se ejecutará cada 2 horas via cron
module.exports = async function handler(req, res) {
  // Solo permitir POST y GET
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Verificar variables de entorno
  if (!Config.openaiApiKey || !Config.targetChatId) {
    return res.status(500).json({ 
      error: 'Missing required environment variables: OPENAI_API_KEY or TARGET_CHAT_ID' 
    });
  }

  try {
    console.log('🎭 Iniciando proceso de chiste programado en Vercel...');
    
    // Crear cliente temporal de WhatsApp
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

    // Timeout para la inicialización
    const initPromise = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('WhatsApp initialization timeout'));
      }, 25000); // 25 segundos timeout

      client.on('ready', () => {
        clearTimeout(timeout);
        console.log('✅ WhatsApp client ready');
        resolve();
      });

      client.on('auth_failure', (msg) => {
        clearTimeout(timeout);
        reject(new Error(`WhatsApp auth failed: ${msg}`));
      });

      client.on('qr', (qr) => {
        console.log('⚠️ QR Code needed - WhatsApp not authenticated');
        console.log('QR:', qr);
      });
    });

    // Inicializar cliente
    await client.initialize();
    await initPromise;

    // Crear servicio de chistes con el cliente
    const jokeService = new JokeService(client);
    
    // Crear contador de chistes (usando storage temporal)
    const jokeCounter = new JokeCounter();
    
    // Determinar tipo de chiste basado en contador
    let chatHistory = null;
    let jokeType = 'Genérico';
    let forceContextual = false;

    if (Config.useContextualJokes) {
      forceContextual = jokeCounter.shouldSendContextualJoke(Config.genericJokesBeforeContextual);
      
      if (forceContextual) {
        console.log(`🎯 Enviando chiste contextual (después de ${Config.genericJokesBeforeContextual} chistes genéricos)`);
      } else {
        const status = jokeCounter.getStatus();
        console.log(`📝 Enviando chiste genérico (${status.genericCount + 1}/${Config.genericJokesBeforeContextual})`);
      }
    }

    // Obtener historial solo si necesitamos chiste contextual
    if (forceContextual) {
      try {
        const chat = await client.getChatById(Config.targetChatId);
        const messages = await chat.fetchMessages({ limit: Config.chatHistoryLimit });
        
        chatHistory = messages
          .filter(msg => !msg.isStatus && msg.body && msg.body.trim().length > 0)
          .reverse()
          .map(msg => ({
            author: msg.author || msg.from,
            body: msg.body,
            timestamp: msg.timestamp
          }));

        if (chatHistory.length > 0) {
          jokeType = 'Contextual';
        } else {
          console.log('⚠️ No hay suficiente historial, enviando chiste genérico');
          forceContextual = false;
        }
      } catch (historyError) {
        console.log('⚠️ Error obteniendo historial, enviando chiste genérico:', historyError.message);
        forceContextual = false;
      }
    }

    // Generar chiste
    const joke = await jokeService.generateJoke(chatHistory, Config.targetChatId);
    
    // Crear mensaje
    const message = `🎭 ¡Hora del Chiste ${jokeType}! 🎭\n\n${joke}\n\n😄 ¡Espero que te haya hecho reír!`;
    
    // Enviar chiste (solo si no está en modo debug)
    if (!Config.debugMode) {
      await client.sendMessage(Config.targetChatId, message);
      console.log(`✅ Chiste ${jokeType.toLowerCase()} enviado exitosamente`);
    } else {
      console.log('🚫 MODO DEBUG - No se envió el mensaje');
      console.log('📝 Mensaje que se enviaría:', message);
    }

    // Actualizar contador
    jokeCounter.incrementJoke(forceContextual && chatHistory && chatHistory.length > 0);
    
    // Limpiar cliente
    await client.destroy();
    
    const responseData = {
      success: true,
      type: jokeType,
      joke: joke,
      debug: Config.debugMode,
      timestamp: new Date().toISOString()
    };

    console.log('✅ Proceso completado exitosamente');
    res.status(200).json(responseData);
    
  } catch (error) {
    console.error('❌ Error en send-joke:', error.message);
    res.status(500).json({ 
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};
