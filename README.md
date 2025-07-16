# WhatsApp Jokes Bot 🎭

Un bot simple de Node.js que envía automáticamente chistes generados por IA a un chat de WhatsApp cada 2 horas usando la API de OpenAI.

*A simple Node.js bot that automatically sends AI-generated jokes to a WhatsApp chat every 2 hours using OpenAI's API.*

## Características / Features

- 🤖 Genera chistes originales usando los modelos GPT de OpenAI / Generates original jokes using OpenAI's GPT models
- 🧠 **NUEVO: Chistes contextuales** basados en el historial del chat / **NEW: Contextual jokes** based on recent chat history
- 🇪🇸 **Chistes en español** con humor cultural hispano / **Spanish jokes** with Hispanic cultural humor
- 📱 Envía chistes a contactos o grupos de WhatsApp automáticamente / Sends jokes to WhatsApp contacts or groups automatically
- ⏰ Intervalo configurable (por defecto: cada 2 horas) / Configurable interval (default: every 2 hours)
- 🔐 Autenticación persistente (no necesitas escanear código QR cada vez) / Persistent authentication (no need to scan QR code every time)
- 🎯 Solicitudes manuales de chistes / Manual joke requests 
- 🛡️ Manejo de errores con recuperación elegante / Error handling with graceful failure recovery
- 📋 Descubrimiento fácil de chats para encontrar tu grupo/contacto objetivo / Easy chat discovery to find your target group/contact

## Prerrequisitos / Prerequisites

- Node.js (v18 o superior / v18 or higher)
- Cuenta de WhatsApp / WhatsApp account
- Clave API de OpenAI / OpenAI API key

## Configuración / Setup

1. **Instalar dependencias / Install dependencies:**
   ```bash
   npm install
   ```

2. **Obtener tu clave API de OpenAI / Get your OpenAI API key:**
   - Ve a https://platform.openai.com/
   - Crea una cuenta o inicia sesión / Create account or log in
   - Navega a la sección API Keys
   - Crea una nueva clave API / Create new API key

3. **Configurar variables de entorno / Configure environment variables:**
   - Copia el archivo `.env` y actualízalo con tus valores:
   ```env
   OPENAI_API_KEY=tu_clave_api_openai_aqui
   TARGET_CHAT_ID=tu_id_de_chat_objetivo_aqui
   JOKE_INTERVAL=7200000
   USE_CONTEXTUAL_JOKES=true
   CHAT_HISTORY_LIMIT=ALL
   ```

   **Método 3 - Ejecutar el bot y ver la lista:**
   - Run the bot for the first time: `npm start`
   - Scan the QR code with your WhatsApp
   - The bot will list your chats with their IDsnAI's GPT models
- 🧠 **NEW: Contextual jokes** based on recent chat history
- 📱 Sends jokes to WhatsApp contacts or groups automatically
- ⏰ Configurable interval (default: every 2 hours)
- 🔐 Persistent authentication (no need to scan QR code every time)
- 🎯 Manual joke requests (send "!joke" for random jokes, "!contextjoke" for contextual ones)
- 🛡️ Error handling with graceful failure recovery
- 📋 Easy chat discovery to find your target group/contactkes Bot 🎭

A simple Node.js bot that automatically sends AI-generated jokes to a WhatsApp chat every 2 hours using OpenAI's API.

## Features

- 🤖 Generates original jokes using OpenAI's GPT-3.5-turbo
- 📱 Sends jokes to WhatsApp contacts or groups automatically
- ⏰ Configurable interval (default: every 2 hours)
- 🔐 Persistent authentication (no need to scan QR code every time)
- 🎯 Manual joke requests (send "!joke" to get an immediate joke)
- 🛡️ Error handling with fallback jokes
- 📋 Easy chat discovery to find your target group/contact

## Prerequisites

- Node.js (v18 or higher)
- WhatsApp account
- OpenAI API key

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Get your OpenAI API key:**
   - Go to [OpenAI Platform](https://platform.openai.com/)
   - Create an account or log in
   - Navigate to API Keys section
   - Create a new API key

3. **Configure environment variables:**
   - Copy the `.env` file and update it with your values:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   TARGET_CHAT_ID=your_target_chat_id_here
   JOKE_INTERVAL=7200000
   USE_CONTEXTUAL_JOKES=true
   CHAT_HISTORY_LIMIT=ALL
   ```

4. **Find your target chat ID:**
   - Run the bot for the first time: `npm start`
   - Scan the QR code with your WhatsApp
   - The bot will list available chats with their IDs
   - Copy the ID of your target chat and update the `.env` file

## Usage

1. **Start the bot:**
   ```bash
   npm start
   ```

2. **First time setup:**
   - Scan the QR code displayed in the terminal with your WhatsApp
   - The bot will show available chats - copy the ID you want to send jokes to
   - Update your `.env` file with the correct `TARGET_CHAT_ID`
   - Restart the bot

3. **The bot will:**
   - Send the first joke 5 seconds after connecting
   - Then send jokes every 2 hours (or your configured interval)
   - Respond to manual "!joke" messages

## Configuration

### Environment Variables

- `OPENAI_API_KEY`: Your OpenAI API key (required)
- `TARGET_CHAT_ID`: WhatsApp chat ID to send jokes to (required)
- `JOKE_INTERVAL`: Interval between jokes in milliseconds (default: 7200000 = 2 hours)
- `USE_CONTEXTUAL_JOKES`: Enable jokes based on chat history (true/false, default: false)
- `CHAT_HISTORY_LIMIT`: Number of recent messages to analyze for context, or "ALL" for entire history (default: 20)

### Chat ID Format Examples

- **Contact:** `+1234567890@c.us`
- **Group:** `1234567890-1234567890@g.us`

## Manual Commands

Send these messages to the bot in WhatsApp:

**Comandos en Español:**
- `!chiste` - Obtener un chiste aleatorio inmediato
- `!chiste-contextual` - Obtener un chiste basado en el historial del chat
- `!chatid` o `!id` - Obtener el ID del chat actual (útil para configuración)
- `!buscargrupo nombre` - Buscar grupos que contengan "nombre"

**English Commands (also work):**
- `!joke` - Get an immediate random joke
- `!contextjoke` - Get a joke based on recent chat history
- `!chatid` - Get the current chat's ID (useful for setup)
- `!findgroup nombre` - Search for groups containing "nombre"

## Project Structure

```
whatsapp-jokes-bot/
├── src/
│   ├── bot.js              # Main bot orchestrator
│   ├── config.js           # Configuration management
│   ├── whatsappClient.js   # WhatsApp Web client wrapper
│   ├── jokeService.js      # OpenAI joke generation
│   ├── messageHandler.js   # Message processing logic
│   └── scheduler.js        # Joke scheduling logic
├── index.js                # Application entry point
├── package.json            # Node.js dependencies
├── .env                    # Environment variables (create this)
├── .env.example            # Example configuration
└── README.md              # This file
```

## How It Works

The bot follows a modular architecture with clear separation of concerns:

1. **Config (`src/config.js`)**: Manages environment variables and validation
2. **WhatsAppClient (`src/whatsappClient.js`)**: Handles WhatsApp Web connection and messaging
3. **JokeService (`src/jokeService.js`)**: Generates jokes using OpenAI API with fallbacks
4. **MessageHandler (`src/messageHandler.js`)**: Processes incoming/outgoing messages
5. **Scheduler (`src/scheduler.js`)**: Manages joke timing and intervals
6. **Bot (`src/bot.js`)**: Orchestrates all components and handles application lifecycle

### Flow:
1. **Initialization**: Bot loads config, initializes WhatsApp client and services
2. **Authentication**: WhatsApp client handles QR code scanning and session persistence
3. **Scheduling**: Scheduler starts sending jokes at configured intervals
4. **Message Processing**: Handler manages both automated and manual joke requests
5. **Error Handling**: Each service has proper error handling with fallbacks

## Troubleshooting

### Common Issues

1. **"Authentication failed"**
   - Delete the `.wwebjs_auth` folder and restart
   - Make sure you're scanning the QR code quickly

2. **"OPENAI_API_KEY not found"**
   - Make sure your `.env` file exists and has the correct API key
   - Check that the `.env` file is in the same directory as `index.js`

3. **"Error sending joke"**
   - Verify your `TARGET_CHAT_ID` is correct
   - Make sure the chat/group still exists
   - Check that your WhatsApp is connected

4. **Bot doesn't start**
   - Make sure you have Node.js v18 or higher
   - Run `npm install` to install dependencies
   - Check the console for error messages

### Getting Help

If you encounter issues:
1. Check the console output for error messages
2. Verify all environment variables are set correctly
3. Make sure your OpenAI API key has credits
4. Ensure your WhatsApp account isn't restricted

## Security Notes

- Keep your `.env` file private and never commit it to version control
- Your OpenAI API key should be kept secret
- The bot stores WhatsApp session data locally in `.wwebjs_auth/` folder

## Limitations

- WhatsApp may detect this as a bot and could restrict your account
- This is for educational/personal use only
- OpenAI API calls cost money (but jokes are cheap!)
- Requires keeping your computer running to maintain the schedule

## License

MIT License - feel free to modify and use as needed!
