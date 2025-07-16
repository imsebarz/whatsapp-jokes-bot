class MessageHandler {
    constructor(whatsappClient, jokeService, targetChatId) {
        this.whatsappClient = whatsappClient;
        this.jokeService = jokeService;
        this.targetChatId = targetChatId;
        this.Config = require('./config');
        this.JokeCounter = require('./jokeCounter');
        this.jokeCounter = new this.JokeCounter();
    }

    async sendJoke() {
        if (!this.targetChatId) {
            console.error('❌ No target chat ID specified. Please set TARGET_CHAT_ID in your .env file');
            return;
        }

        try {
            let chatHistory = null;
            let jokeType = 'Diario';
            let forceContextual = false;
            
            // Determine if we should send contextual joke based on counter
            if (this.Config.useContextualJokes) {
                forceContextual = this.jokeCounter.shouldSendContextualJoke(this.Config.genericJokesBeforeContextual);
                
                if (forceContextual) {
                    console.log(`🎯 Enviando chiste contextual (después de ${this.Config.genericJokesBeforeContextual} chistes genéricos)`);
                } else {
                    const status = this.jokeCounter.getStatus();
                    console.log(`📝 Enviando chiste genérico (${status.genericCount + 1}/${this.Config.genericJokesBeforeContextual})`);
                }
            }
            
            // Only fetch chat history if we're forcing a contextual joke
            if (forceContextual) {
                chatHistory = await this.whatsappClient.getChatHistory(
                    this.targetChatId, 
                    this.Config.chatHistoryLimit
                );
                
                if (chatHistory.length > 0) {
                    jokeType = 'Contextual';
                } else {
                    // If no chat history available, force a generic joke instead
                    console.log('⚠️ No hay suficiente historial para chiste contextual, enviando genérico');
                    forceContextual = false;
                }
            }
            
            // Generate joke with or without context
            const joke = await this.jokeService.generateJoke(chatHistory, this.targetChatId);
            
            const message = `🎭 ¡Hora del Chiste ${jokeType}! 🎭\n\n${joke}\n\n😄 ¡Espero que te haya hecho reír!`;
            
            // Check if debug mode is enabled
            if (this.Config.debugMode) {
                console.log('🚫 MODO DEBUG ACTIVADO - No se enviará el mensaje');
                console.log('📝 Mensaje que se enviaría:');
                console.log('----------------------------');
                console.log(message);
                console.log('----------------------------');
                console.log(`✅ Chiste ${jokeType.toLowerCase()} generado exitosamente (modo debug)`);
            } else {
                await this.whatsappClient.sendMessage(this.targetChatId, message);
                console.log(`✅ Chiste ${jokeType.toLowerCase()} enviado exitosamente!`);
            }
            
            // Update counter after successful joke generation/sending
            // Use the forceContextual flag to determine if it was actually contextual
            this.jokeCounter.incrementJoke(forceContextual && chatHistory && chatHistory.length > 0);
            
        } catch (error) {
            console.error('❌ Error generando o enviando chiste:', error.message);
            console.log('⏭️ Saltando este intento de chiste - intentaré de nuevo en el próximo horario programado');
        }
    }

    handleIncomingMessage(msg) {
        if (msg.body === '!chiste' || msg.body === '!joke') {
            console.log('🎭 Solicitud manual de chiste recibida');
            this.sendJoke();
        } else if (msg.body === '!chiste-contextual' || msg.body === '!contextjoke') {
            console.log('🎭 Solicitud manual de chiste contextual recibida');
            this.sendContextualJoke();
        } else if (msg.body === '!contador' || msg.body === '!counter') {
            console.log('📊 Solicitud de estado del contador');
            this.sendCounterStatus(msg);
        } else if (msg.body === '!reset-contador' || msg.body === '!reset-counter') {
            console.log('🔄 Solicitud de reset del contador');
            this.resetCounter(msg);
        } else if (msg.body === '!chatid' || msg.body === '!id') {
            console.log('📱 Solicitud de Chat ID recibida');
            this.sendChatId(msg);
        } else if (msg.body.startsWith('!buscargrupo ') || msg.body.startsWith('!findgroup ')) {
            const groupName = msg.body.replace('!buscargrupo ', '').replace('!findgroup ', '');
            console.log(`🔍 Solicitud de búsqueda de grupo para: "${groupName}"`);
            this.findGroup(groupName, msg);
        }
    }

    async sendContextualJoke() {
        if (!this.targetChatId) {
            console.error('❌ No target chat ID specified. Please set TARGET_CHAT_ID in your .env file');
            return;
        }

        try {
            // Always fetch chat history for manual contextual jokes
            const chatHistory = await this.whatsappClient.getChatHistory(
                this.targetChatId, 
                this.Config.chatHistoryLimit
            );
            
            if (chatHistory.length === 0) {
                const message = "🤷‍♂️ ¡No hay suficiente historial del chat para crear un chiste contextual! Intenta de nuevo después de más conversación.";
                if (this.Config.debugMode) {
                    console.log('🚫 MODO DEBUG ACTIVADO - No se enviará el mensaje de error');
                    console.log('📝 Mensaje de error que se enviaría:', message);
                } else {
                    await this.whatsappClient.sendMessage(this.targetChatId, message);
                }
                return;
            }
            
            const joke = await this.jokeService.generateJoke(chatHistory, this.targetChatId);
            const message = `🎭 ¡Hora del Chiste Contextual! 🎭\n\n${joke}\n\n😄 ¡Espero que te haya hecho reír!`;
            
            if (this.Config.debugMode) {
                console.log('🚫 MODO DEBUG ACTIVADO - No se enviará el chiste contextual');
                console.log('📝 Chiste contextual que se enviaría:');
                console.log('----------------------------');
                console.log(message);
                console.log('----------------------------');
                console.log('✅ Chiste contextual manual generado exitosamente (modo debug)');
            } else {
                await this.whatsappClient.sendMessage(this.targetChatId, message);
                console.log('✅ Chiste contextual manual enviado exitosamente!');
            }
        } catch (error) {
            console.error('❌ Error generando o enviando chiste contextual:', error.message);
        }
    }

    async sendChatId(msg) {
        try {
            const chatId = msg.from;
            const chat = await this.whatsappClient.client.getChatById(chatId);
            const chatType = chat.isGroup ? 'Grupo' : 'Contacto';
            
            const message = `📱 Información del Chat:\n\n` +
                          `🏷️ Nombre: ${chat.name}\n` +
                          `📋 Tipo: ${chatType}\n` +
                          `🆔 ID: ${chatId}\n\n` +
                          `💡 Copia este ID y ponlo en tu archivo .env como TARGET_CHAT_ID`;
            
            await this.whatsappClient.sendMessage(chatId, message);
            console.log(`✅ Chat ID enviado: ${chatId}`);
        } catch (error) {
            console.error('❌ Error obteniendo Chat ID:', error.message);
        }
    }

    async findGroup(groupName, msg) {
        try {
            const groups = await this.whatsappClient.findGroupByName(groupName);
            
            if (!groups || groups.length === 0) {
                const message = `❌ No encontré ningún grupo con "${groupName}".\n\n` +
                              `💡 Intenta con parte del nombre del grupo.\n` +
                              `💡 Usa !chatid en el grupo que quieres para obtener su ID directamente.`;
                await this.whatsappClient.sendMessage(msg.from, message);
                return;
            }
            
            let message = `🔍 Encontré ${groups.length} grupo(s) con "${groupName}":\n\n`;
            groups.forEach((group, index) => {
                message += `${index + 1}. ${group.name}\n`;
                message += `   🆔 ID: ${group.id._serialized}\n`;
                message += `   👥 Participantes: ${group.groupMetadata ? group.groupMetadata.participants.length : 'Desconocido'}\n\n`;
            });
            
            message += `💡 Copia el ID del grupo que quieres y ponlo en tu .env como TARGET_CHAT_ID`;
            
            await this.whatsappClient.sendMessage(msg.from, message);
            console.log(`✅ Resultados de búsqueda de grupo enviados para: "${groupName}"`);
        } catch (error) {
            console.error('❌ Error buscando grupos:', error.message);
        }
    }

    async sendCounterStatus(msg) {
        try {
            const status = this.jokeCounter.getStatus();
            const pattern = `${this.Config.genericJokesBeforeContextual} genéricos → 1 contextual`;
            const message = `📊 Estado del Contador de Chistes:\n\n` +
                          `🔢 Patrón configurado: ${pattern}\n` +
                          `📝 Chistes genéricos enviados: ${status.genericCount}/${this.Config.genericJokesBeforeContextual}\n` +
                          `🎯 Total de chistes enviados: ${status.totalCount}\n` +
                          `⏭️ Próximo chiste: ${status.genericCount >= this.Config.genericJokesBeforeContextual ? 'Contextual' : 'Genérico'}`;
            
            await this.whatsappClient.sendMessage(msg.from, message);
            console.log('✅ Estado del contador enviado');
        } catch (error) {
            console.error('❌ Error enviando estado del contador:', error.message);
        }
    }

    async resetCounter(msg) {
        try {
            this.jokeCounter.reset();
            const message = `🔄 Contador de chistes reseteado!\n\n` +
                          `📊 Se reinició el patrón: ${this.Config.genericJokesBeforeContextual} genéricos → 1 contextual\n` +
                          `⏭️ Próximo chiste: Genérico`;
            
            await this.whatsappClient.sendMessage(msg.from, message);
            console.log('✅ Contador reseteado y confirmación enviada');
        } catch (error) {
            console.error('❌ Error reseteando contador:', error.message);
        }
    }
}

module.exports = MessageHandler;
