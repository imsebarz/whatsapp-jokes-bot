const WhatsAppJokesBot = require('./src/bot');

// Handle graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n🛑 Received SIGINT, shutting down gracefully...');
    if (bot) {
        await bot.stop();
    }
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
    if (bot) {
        await bot.stop();
    }
    process.exit(0);
});

// Start the bot
const bot = new WhatsAppJokesBot();
bot.start().catch(console.error);
