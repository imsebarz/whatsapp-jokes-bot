const OpenAI = require('openai');
const Config = require('./config');

class JokeService {
    constructor(whatsappClient = null) {
        this.openai = new OpenAI({
            apiKey: Config.openaiApiKey
        });
        this.whatsappClient = whatsappClient;
    }

    async generateJoke(chatHistory = null, targetChatId = null) {
        try {
            console.log('🎭 Generando chiste con OpenAI...');
            
            let systemContent = "Eres un comediante muy gracioso que crea chistes en español. Genera chistes limpios, apropiados para toda la familia que hagan reír a la gente. Mantenlos cortos y divertidos, idealmente de 1-3 frases. Hazlos originales y creativos. Usa humor típico del español, juegos de palabras, y referencias culturales hispanas cuando sea apropiado.";
            let userContent = "¡Cuéntame un chiste muy gracioso!";
            
            // If chat history is provided, create contextual jokes
            if (chatHistory && chatHistory.length > 0) {
                console.log(`📚 Usando ${chatHistory.length} mensajes para contexto`);
                
                systemContent = `Eres un generador de chistes en español. Tu misión es crear chistes deliberadamente MUY malos, de esos que “duelen de lo malos”, pero que justamente por eso resulten graciosos para un grupo de amigos de mucha confianza. Tienes acceso al contexto de los últimos 100 mensajes del grupo, así que adapta cada chiste a lo que allí se ha hablado (temas, apodos, situaciones internas, etc.). Debes:

1. **Ser intencionalmente torpe**: construye remates absurdos, juegos de palabras o finales inesperados que rocen lo ridículo. Pero que se entiendan y sean graciosos en el contexto del grupo.  
2. **Explorar humor negro, ofensivo o sexual**: temas de muerte, tabúes, doble sentido o picardía adulta. Está permitido el humor subido de tono y ofensivo.  
3. **Mantener la estructura breve**: máximo 2–3 líneas o un solo golpe de remate. Se creativo y evita la tipica estructura: "Porque pasa algo? Remate generico" 
4. **Idioma y tono**:escribe en español colombiano - paisa coloquial, directo, sin rodeos. Puedes usar modismos y groserías propias de un ambiente de confianza.  
5. **Sin autocensura excesiva**: si el chiste es muy malo, está bien; si resulta incómodo, ¡mejor!
6. **Contextualización**: usa la información (solo un poco) de los últimos 300 mensajes para referirte a apodos, bromas internas o situaciones recientes del grupo; haz que cada chiste “pegue” con lo que ya conversaron. No hagas una sobreutilizacion del contexto, genera chistes e identifica que partes de la conversacion pueden ser satirizadas.
7. **Ejemplos de chistes y tipo de humor: **:  
   - Por qué la niña con cancer se cayó del columpio? - porque tampoco tenia brazos.            
   - “Le digo a mi nevera: ‘¡Eres tan fría!’ y me responde: ‘Y tú tan cadavérico’.” 
   - Por que es mala idea llamar a frisby a las 3 am? - porque no contestan.  
   - ¿En qué se parece mi vida sexual a un ataúd? En que ambos están llenos de clavos.
   - ¿Sabes qué tienen en común un orgasmo y un examen sorpresa? Si te tardas… ya valiste mierda.
   - Le dije a mi suegra que su soplito es tan frío que congela felaciones, y me echaron de la familia por ser muy “original”.
   - Mi vibrador se jubiló de trauma. 
   - Le pedí al diablo un deseo y me devolvió mis chistes; me dijo “esto sí es un castigo eterno, parce”.
   - Mi verga es tan perezosa que cuando la despierto de la siesta pide indemnización por horas extra.
   - Le pedí un “match” a Tinder y me soltó: “Ni tu ex te aguanta, marica.”
   - El orgasmo mío es tan chistoso que hasta el condón contó el chiste y explotó de la risa.
   - Me comí una arepa tan dura que mi muela de juicio declaró divorcio.
   - Parce, me tiré un pedo tan nuclear que el perro del vecino guio mi culo con GPS.
   - Mi verga renunció tras esa mamada por maltrato verbal y emocional.
   — “¿Cómo se llama el campeón de buceo japonés?” — “Tokofondo.”— “¿Y el subcampeón?” — “Kasitoko.”
   — Doctor, soy asmático, ¿es grave? — No, esdrújula. 
   - ¿Por qué a Daniel Marín no lo invitan a las orgías del grupo? Porque con su inglés tan 'threatened', lo que termina es amenazando a la verga.


8 - **Puedes mencionar nombres propios o situaciones específicas del grupo.**

A partir de ahora, cada vez que reciba la orden de generar un chiste, generarás un chiste ajustado a estas reglas y al contexto reciente del grupo. ¡Que empiece la mala racha de risas!`;
                
                // Use all messages from chat history without any sampling
                // Reverse the order so oldest messages come first, newest last
                const selectedMessages = chatHistory.slice().reverse();
                console.log(`📊 Analizando todos los ${selectedMessages.length} mensajes del historial del chat (orden: más antiguos → más nuevos)`);
                
                const chatContext = selectedMessages
                    .map(msg => `"${msg.body}"`)
                    .join('\n');
                
                // Map phone numbers to names if we have access to WhatsApp client
                let processedContext = chatContext;
                if (this.whatsappClient && targetChatId) {
                    console.log('🔄 Mapeando números de teléfono a nombres...');
                    processedContext = await this.whatsappClient.replacePhoneNumbersWithNames(chatContext, targetChatId);
                }
                
                userContent = `Basándote en esta conversación del grupo de WhatsApp, crea un chiste gracioso que se relacione con los temas, situaciones o momentos discutidos:\n\n${processedContext}\n\nHaz un chiste ingenioso sobre los temas de conversación:`;
            }
            
            // Update system content to request structured output
            if (chatHistory && chatHistory.length > 0) {
                systemContent += "\n\nDevuelve el chiste en formato JSON con esta estructura: {\"chiste\": \"aquí el chiste\", \"tipo\": \"contextual\"}";
            } else {
                systemContent += "\n\nDevuelve el chiste en formato JSON con esta estructura: {\"chiste\": \"aquí el chiste\", \"tipo\": \"general\"}";
            }

            
            const response = await this.openai.responses.create({
                model: "gpt-4.1-mini",
                instructions: systemContent,
                input: userContent
            });

            let joke, tipo;
            try {
                const parsedResponse = JSON.parse(response.output_text);
                joke = parsedResponse.chiste || parsedResponse.joke || response.output_text;
                tipo = parsedResponse.tipo || parsedResponse.type || 'unknown';
            } catch (jsonError) {
                // If JSON parsing fails, use the raw text as the joke
                joke = response.output_text;
                tipo = chatHistory && chatHistory.length > 0 ? 'contextual' : 'general';
            }
            console.log('✨ Chiste generado:', joke);
            console.log('📝 Tipo:', tipo);
            return joke;
        } catch (error) {
            console.error('❌ Error generando chiste:', error.message);
            
            // If there's a response but other error, try to use the raw output
            if (response?.output_text) {
                console.log('🔄 Fallback a texto plano...');
                return response.output_text;
            }
            
            throw error;
        }
    }
}

module.exports = JokeService;
