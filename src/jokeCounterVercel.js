// JokeCounter simplificado para Vercel
// Como Vercel es serverless, no podemos mantener estado entre ejecuciones
// Esta es una versión simplificada que usa un patrón determinístico

class JokeCounter {
    constructor() {
        // En Vercel, usaremos el timestamp para determinar el patrón
        // No es perfecto, pero funciona para un patrón simple
        this.counter = {
            genericCount: 0,
            totalCount: 0
        };
        
        // Simulamos estado basado en la fecha/hora
        this.initializeFromTimestamp();
    }

    initializeFromTimestamp() {
        // Usamos la hora actual para determinar qué tipo de chiste enviar
        // Esto crea un patrón pseudoaleatorio pero consistente
        const now = new Date();
        const hoursFromEpoch = Math.floor(now.getTime() / (1000 * 60 * 60));
        
        // Calculamos posición en el ciclo (2 genéricos + 1 contextual = ciclo de 3)
        const cyclePosition = hoursFromEpoch % 3;
        
        if (cyclePosition === 2) {
            // Hora de chiste contextual (posición 2 en el ciclo)
            this.counter.genericCount = 2;
        } else {
            // Chiste genérico (posiciones 0 y 1)
            this.counter.genericCount = cyclePosition;
        }
        
        this.counter.totalCount = hoursFromEpoch;
        
        console.log(`📊 Contador inicializado: posición ${cyclePosition} en ciclo, genericCount: ${this.counter.genericCount}`);
    }

    shouldSendContextualJoke(genericJokesBeforeContextual) {
        return this.counter.genericCount >= genericJokesBeforeContextual;
    }

    incrementJoke(isContextual) {
        // En Vercel serverless, este método es principalmente para logging
        // El estado real se calcula en initializeFromTimestamp()
        
        if (isContextual) {
            console.log(`📊 Chiste contextual enviado. Total estimado: ${this.counter.totalCount}`);
        } else {
            console.log(`📊 Chiste genérico enviado. Genéricos en ciclo: ${this.counter.genericCount + 1}. Total estimado: ${this.counter.totalCount}`);
        }
    }

    getStatus() {
        return {
            genericCount: this.counter.genericCount,
            totalCount: this.counter.totalCount
        };
    }

    reset() {
        // En serverless no podemos resetear realmente, pero podemos log
        console.log('🔄 Reset solicitado (en serverless se usa patrón automático basado en tiempo)');
    }
}

module.exports = JokeCounter;
