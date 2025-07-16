const Config = require('./config');
const WhatsAppClient = require('./whatsappClient');
const JokeService = require('./jokeService');
const MessageHandler = require('./messageHandler');
const Scheduler = require('./scheduler');

class WhatsAppJokesBot {
    constructor() {
        this.config = Config;
        this.whatsappClient = new WhatsAppClient();
        this.jokeService = new JokeService(this.whatsappClient);
        this.messageHandler = new MessageHandler(
            this.whatsappClient, 
            this.jokeService, 
            Config.targetChatId
        );
        this.scheduler = new Scheduler(this.messageHandler, Config.jokeInterval);

        this.setupEventHandlers();
    }

    setupEventHandlers() {
        // Handle WhatsApp client ready event
        this.whatsappClient.onReady(() => {
            this.scheduler.start();
            this.whatsappClient.listChats();
        });

        // Handle incoming messages
        this.whatsappClient.onMessage((msg) => {
            this.messageHandler.handleIncomingMessage(msg);
        });

        // Handle disconnection
        this.whatsappClient.onDisconnected((reason) => {
            this.scheduler.stop();
        });
    }

    async start() {
        console.log('🚀 Starting WhatsApp Jokes Bot...');
        console.log('📋 Configuration:');
        console.log(`   - Joke interval: ${Config.jokeInterval / 1000 / 60 / 60} hours`);
        console.log(`   - Target chat: ${Config.targetChatId || 'Not set'}`);
        console.log(`   - Contextual jokes: ${Config.useContextualJokes ? 'Enabled' : 'Disabled'}`);
        console.log(`   - Chat history limit: ${Config.chatHistoryLimit === null ? 'ALL (entire history)' : Config.chatHistoryLimit + ' messages'}`);
        console.log('');

        try {
            Config.validate();
            await this.whatsappClient.initialize();
        } catch (error) {
            console.error('❌ Failed to start bot:', error.message);
            process.exit(1);
        }
    }

    async stop() {
        console.log('🛑 Stopping bot...');
        this.scheduler.stop();
        await this.whatsappClient.destroy();
        console.log('👋 Bot stopped successfully');
    }
}

module.exports = WhatsAppJokesBot;
