class Scheduler {
    constructor(messageHandler, interval) {
        this.messageHandler = messageHandler;
        this.interval = interval;
        this.intervalId = null;
    }

    start() {
        console.log(`⏰ Starting joke scheduler (every ${this.interval / 1000 / 60 / 60} hours)`);
        
        // Send the first joke after a short delay
        setTimeout(() => {
            this.messageHandler.sendJoke();
        }, 5000); // Wait 5 seconds after ready
        
        // Then schedule regular jokes
        this.intervalId = setInterval(() => {
            this.messageHandler.sendJoke();
        }, this.interval);

        console.log(`📅 Next joke in ${this.interval / 1000 / 60 / 60} hours`);
    }

    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
            console.log('⏹️ Joke scheduler stopped');
        }
    }

    isRunning() {
        return this.intervalId !== null;
    }
}

module.exports = Scheduler;
