require('dotenv').config();

class Config {
    static get openaiApiKey() {
        return process.env.OPENAI_API_KEY;
    }

    static get targetChatId() {
        return process.env.TARGET_CHAT_ID;
    }

    static get jokeInterval() {
        return parseInt(process.env.JOKE_INTERVAL) || 7200000; // Default 2 hours
    }

    static get useContextualJokes() {
        return process.env.USE_CONTEXTUAL_JOKES?.toLowerCase() === 'true';
    }

    static get chatHistoryLimit() {
        const limit = process.env.CHAT_HISTORY_LIMIT;
        if (limit === 'ALL' || limit === 'all') {
            return null; // null means fetch all available history
        }
        return parseInt(limit) || 20;
    }

    static get debugMode() {
        return process.env.DEBUG_MODE?.toLowerCase() === 'true';
    }

    static get genericJokesBeforeContextual() {
        return parseInt(process.env.GENERIC_JOKES_BEFORE_CONTEXTUAL) || 2;
    }

    static validate() {
        const errors = [];

        if (!this.openaiApiKey) {
            errors.push('OPENAI_API_KEY not found in environment variables');
        }

        if (errors.length > 0) {
            throw new Error(`Configuration errors:\n${errors.join('\n')}`);
        }
    }
}

module.exports = Config;
