const fs = require('fs');
const path = require('path');

class JokeCounter {
    constructor() {
        this.counterFile = path.join(__dirname, '..', 'joke-counter.json');
        this.loadCounter();
    }

    loadCounter() {
        try {
            if (fs.existsSync(this.counterFile)) {
                const data = fs.readFileSync(this.counterFile, 'utf8');
                this.counter = JSON.parse(data);
            } else {
                this.counter = {
                    genericCount: 0,
                    totalCount: 0
                };
                this.saveCounter();
            }
        } catch (error) {
            console.error('❌ Error loading joke counter:', error.message);
            this.counter = {
                genericCount: 0,
                totalCount: 0
            };
        }
    }

    saveCounter() {
        try {
            fs.writeFileSync(this.counterFile, JSON.stringify(this.counter, null, 2));
        } catch (error) {
            console.error('❌ Error saving joke counter:', error.message);
        }
    }

    shouldSendContextualJoke(genericJokesBeforeContextual) {
        // If we've sent the required number of generic jokes, send contextual
        return this.counter.genericCount >= genericJokesBeforeContextual;
    }

    incrementJoke(isContextual) {
        this.counter.totalCount++;
        
        if (isContextual) {
            // Reset generic counter after sending contextual joke
            this.counter.genericCount = 0;
            console.log(`📊 Chiste contextual enviado. Contador reseteado. Total: ${this.counter.totalCount}`);
        } else {
            this.counter.genericCount++;
            console.log(`📊 Chiste genérico enviado. Genéricos consecutivos: ${this.counter.genericCount}. Total: ${this.counter.totalCount}`);
        }
        
        this.saveCounter();
    }

    getStatus() {
        return {
            genericCount: this.counter.genericCount,
            totalCount: this.counter.totalCount
        };
    }

    reset() {
        this.counter = {
            genericCount: 0,
            totalCount: 0
        };
        this.saveCounter();
        console.log('🔄 Contador de chistes reseteado');
    }
}

module.exports = JokeCounter;
