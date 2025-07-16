const WhatsAppJokesBot = require('./src/bot');
const readline = require('readline');

class GroupFinder {
    constructor() {
        this.bot = new WhatsAppJokesBot();
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
    }

    async start() {
        console.log('🔍 WhatsApp Group ID Finder');
        console.log('========================');
        console.log('Este script te ayudará a encontrar el ID de tu grupo de WhatsApp');
        console.log('');

        try {
            // Setup event handlers for this specific use case
            this.bot.whatsappClient.onReady(async () => {
                console.log('✅ Conectado a WhatsApp!');
                await this.showMenu();
            });

            await this.bot.whatsappClient.initialize();
        } catch (error) {
            console.error('❌ Error iniciando WhatsApp:', error.message);
            process.exit(1);
        }
    }

    async showMenu() {
        console.log('\n📋 ¿Qué quieres hacer?');
        console.log('1. Ver todos los grupos');
        console.log('2. Buscar grupo por nombre');
        console.log('3. Ver todos los chats (grupos + contactos)');
        console.log('4. Salir');
        
        this.rl.question('\nElige una opción (1-4): ', async (choice) => {
            switch (choice) {
                case '1':
                    await this.showGroups();
                    break;
                case '2':
                    await this.searchGroup();
                    break;
                case '3':
                    await this.bot.whatsappClient.listChats();
                    await this.showMenu();
                    break;
                case '4':
                    await this.exit();
                    break;
                default:
                    console.log('❌ Opción inválida');
                    await this.showMenu();
            }
        });
    }

    async showGroups() {
        try {
            const chats = await this.bot.whatsappClient.getChats();
            const groups = chats.filter(chat => chat.isGroup);
            
            console.log('\n👥 GRUPOS DISPONIBLES:');
            console.log('=' * 30);
            
            groups.forEach((group, index) => {
                console.log(`${index + 1}. ${group.name}`);
                console.log(`   🆔 ID: ${group.id._serialized}`);
                console.log(`   👤 Participantes: ${group.groupMetadata ? group.groupMetadata.participants.length : 'Unknown'}`);
                console.log('');
            });
            
            console.log('💡 Copia el ID del grupo que quieres usar para los chistes');
            await this.showMenu();
        } catch (error) {
            console.error('❌ Error obteniendo grupos:', error.message);
            await this.showMenu();
        }
    }

    async searchGroup() {
        this.rl.question('\n🔍 Escribe parte del nombre del grupo: ', async (groupName) => {
            if (groupName.trim() === '') {
                console.log('❌ Por favor escribe algo');
                await this.searchGroup();
                return;
            }

            const groups = await this.bot.whatsappClient.findGroupByName(groupName);
            await this.showMenu();
        });
    }

    async exit() {
        console.log('\n👋 Cerrando...');
        await this.bot.stop();
        this.rl.close();
        process.exit(0);
    }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n🛑 Saliendo...');
    process.exit(0);
});

const finder = new GroupFinder();
finder.start().catch(console.error);
