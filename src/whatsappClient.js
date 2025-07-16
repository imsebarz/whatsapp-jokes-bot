const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { getPuppeteerConfig } = require('./puppeteerConfig');

class WhatsAppClient {
    constructor() {
        this.client = null;
        this.isInitialized = false;
    }

    async initialize() {
        if (this.isInitialized) return this.client;

        console.log('🔧 Getting Puppeteer configuration...');
        const puppeteerConfig = await getPuppeteerConfig();
        console.log('✅ Puppeteer configuration obtained');
        
        console.log('🤖 Creating WhatsApp client...');
        this.client = new Client({
            authStrategy: new LocalAuth(),
            puppeteer: puppeteerConfig
        });
        console.log('✅ WhatsApp client created');

        console.log('📡 Setting up event listeners...');
        this.setupEventListeners();
        console.log('✅ Event listeners configured');
        
        this.isInitialized = true;
        
        console.log('🚀 Initializing WhatsApp client...');
        await this.client.initialize();
        console.log('🎉 WhatsApp client fully initialized!');
        return this.client;
    }

    setupEventListeners() {
        // Display QR code for authentication
        this.client.on('qr', (qr) => {
            console.log('🔍 Please scan the QR code below with your WhatsApp:');
            qrcode.generate(qr, { small: true });
        });

        // Authentication events
        this.client.on('authenticated', () => {
            console.log('🔐 Authentication successful!');
        });

        this.client.on('auth_failure', (msg) => {
            console.error('❌ Authentication failed:', msg);
        });

        // Connection events
        this.client.on('ready', () => {
            console.log('✅ WhatsApp client is ready!');
            console.log('📱 Connected to WhatsApp Web');
        });

        this.client.on('disconnected', (reason) => {
            console.log('📴 Client was disconnected:', reason);
        });
    }

    async destroy() {
        if (this.client) {
            return this.client.destroy();
        }
    }

    async sendMessage(chatId, message) {
        if (!this.client) await this.initialize();
        if (!chatId) {
            throw new Error('No target chat ID specified');
        }
        return this.client.sendMessage(chatId, message);
    }

    async getChats() {
        if (!this.client) await this.initialize();
        return this.client.getChats();
    }

    async getChatHistory(chatId, limit = 20) {
        try {
            if (!this.client) await this.initialize();
            const chat = await this.client.getChatById(chatId);
            
            let messages;
            if (limit === null) {
                // Fetch all available messages
                console.log('📚 Fetching all available chat history...');
                messages = await chat.fetchMessages({ limit: 999999 }); // Very large number to get all
            } else {
                messages = await chat.fetchMessages({ limit });
            }
            
            // Filter out system messages and format for context
            const contextMessages = messages
                .filter(msg => !msg.isStatus && msg.body && msg.body.trim().length > 0)
                .reverse() // Show chronological order
                .map(msg => ({
                    author: msg.author || msg.from,
                    body: msg.body,
                    timestamp: msg.timestamp
                }));
            
            console.log(`📖 Retrieved ${contextMessages.length} messages for context`);
            return contextMessages;
        } catch (error) {
            console.error('❌ Error fetching chat history:', error.message);
            return [];
        }
    }

    async getContactName(phoneNumber) {
        try {
            if (!this.client) await this.initialize();
            // Try to get contact info
            const contact = await this.client.getContactById(phoneNumber);
            if (contact && contact.name && contact.name !== contact.number) {
                return contact.name;
            }
            
            // If no contact name, try to get from chat participant
            const chat = await this.client.getChatById(phoneNumber);
            if (chat && chat.name && chat.name !== phoneNumber) {
                return chat.name;
            }
            
            return null; // No name found
        } catch (error) {
            return null; // Contact not found or error
        }
    }

    async getGroupParticipantName(groupId, phoneNumber) {
        try {
            if (!this.client) await this.initialize();
            const chat = await this.client.getChatById(groupId);
            if (chat.isGroup && chat.groupMetadata) {
                const participant = chat.groupMetadata.participants.find(p => 
                    p.id._serialized === phoneNumber || p.id.user === phoneNumber.replace('@c.us', '')
                );
                
                if (participant) {
                    // Try to get contact name first
                    const contactName = await this.getContactName(participant.id._serialized);
                    if (contactName) {
                        return contactName;
                    }
                    
                    // If no contact name, use participant's push name or phone number
                    return participant.pushname || phoneNumber;
                }
            }
            return null;
        } catch (error) {
            return null;
        }
    }

    async replacePhoneNumbersWithNames(text, groupId = null) {
        // Regular expression to find phone numbers in WhatsApp format
        const phoneRegex = /@(\d{10,15})/g;
        let result = text;
        const matches = [...text.matchAll(phoneRegex)];
        
        for (const match of matches) {
            const phoneNumber = match[1] + '@c.us';
            let name = null;
            
            // Try to get name from group participants first if we have a group
            if (groupId) {
                name = await this.getGroupParticipantName(groupId, phoneNumber);
            }
            
            // If no group name found, try direct contact lookup
            if (!name) {
                name = await this.getContactName(phoneNumber);
            }
            
            // Replace if we found a name
            if (name) {
                result = result.replace(match[0], `@${name}`);
                console.log(`📱 Mapped ${match[0]} → @${name}`);
            }
        }
        
        return result;
    }

    async listChats() {
        try {
            const chats = await this.getChats();
            console.log('\n📋 Available chats:');
            console.log('='.repeat(50));
            console.log('Copy the ID of your target chat and update your .env file\n');
            
            // Separate groups and contacts
            const groups = chats.filter(chat => chat.isGroup);
            const contacts = chats.filter(chat => !chat.isGroup);
            
            console.log('👥 GROUPS:');
            groups.slice(0, 15).forEach((chat, index) => {
                console.log(`${index + 1}. ${chat.name}`);
                console.log(`   📱 ID: ${chat.id._serialized}`);
                console.log(`   👤 Participants: ${chat.groupMetadata ? chat.groupMetadata.participants.length : 'Unknown'}`);
                console.log('');
            });
            
            console.log('👤 CONTACTS:');
            contacts.slice(0, 10).forEach((chat, index) => {
                console.log(`${index + 1}. ${chat.name}`);
                console.log(`   📱 ID: ${chat.id._serialized}`);
                console.log('');
            });
            
            console.log('💡 TIP: For groups, look for the group name you want to send jokes to!');
            console.log('💡 Group IDs end with "@g.us" and contact IDs end with "@c.us"');
            
        } catch (error) {
            console.error('❌ Error listing chats:', error.message);
        }
    }

    async findGroupByName(groupName) {
        try {
            const chats = await this.getChats();
            const groups = chats.filter(chat => chat.isGroup);
            
            const matchingGroups = groups.filter(group => 
                group.name.toLowerCase().includes(groupName.toLowerCase())
            );
            
            if (matchingGroups.length === 0) {
                console.log(`❌ No groups found containing "${groupName}"`);
                return null;
            }
            
            console.log(`\n🔍 Found ${matchingGroups.length} group(s) matching "${groupName}":`);
            matchingGroups.forEach((group, index) => {
                console.log(`${index + 1}. ${group.name}`);
                console.log(`   📱 ID: ${group.id._serialized}`);
                console.log(`   👤 Participants: ${group.groupMetadata ? group.groupMetadata.participants.length : 'Unknown'}`);
                console.log('');
            });
            
            return matchingGroups;
        } catch (error) {
            console.error('❌ Error searching for groups:', error.message);
            return null;
        }
    }

    onMessage(callback) {
        if (this.client) {
            this.client.on('message', callback);
        }
    }

    onReady(callback) {
        if (this.client) {
            this.client.on('ready', callback);
        }
    }

    onDisconnected(callback) {
        if (this.client) {
            this.client.on('disconnected', callback);
        }
    }
}

module.exports = WhatsAppClient;
