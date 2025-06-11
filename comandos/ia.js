const { Message, Buttons, Client, MessageMedia, downloadMediaMessage, MessageType } = require("baileys");
const { verificarAdmin, verificarDono, verificarGrupo, verificarBotAdmin } = require('../lib/privilegios');
const pool = require('../lib/bd');
require('dotenv').config();
const messages = require('../lib/msg');
const fsExtra = require('fs-extra');
const path = require('path');
const fs = require('fs');
const axios = require('axios');

const numeroContato = process.env.NUMERO_CONTATO;
const numeroDono = process.env.NUMERO_DONO;

async function ia(sock, message, messageInfo) {
    // Usando a nova estrutura messageInfo para obter conteúdo e tipo da mensagem
    const messageContent = messageInfo.content.text;
    
    // Verifica se é mensagem de grupo usando os metadados
    const isGroup = messageInfo.metadata.isGroup;

    // Verifica se a mensagem não é do bot e é nova
    if (!messageInfo.metadata.fromMe && message.key.id.length > 21) {
        // Verifica se a mensagem começa com !lola
        if (messageContent.toLowerCase().startsWith('!lola ')) {
            try {
                // Extrai a pergunta removendo o comando !lola
                const question = messageContent.slice(messageContent.indexOf(' ') + 1);

                // Obtém a data e hora atual
                const agora = new Date();
                const dataAtual = agora.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
                const horaAtual = agora.toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo' });
                
                // Contexto para a IA
                const context = [
                    { 
                        role: "system", 
                        content: `Você é uma assistente virtual chamada Lola. Sempre que falar de si mesma, use o nome Lola. Você está interagindo em um grupo de WhatsApp e deve considerar isso ao responder. Se alguém mencionar 'Goulart' ou o número @555184112140, saiba que está se referindo ao seu desenvolvedor ou pai como tiver melhor para a frase. A data atual é ${dataAtual} e a hora atual é ${horaAtual}.` 
                    },
                    { 
                        role: "user", 
                        content: question 
                    }
                ];

                const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
                    messages: context,
                    model: "llama3-8b-8192"
                }, {
                    headers: {
                        'Authorization': 'Bearer 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',
                        'Content-Type': 'application/json'
                    }
                });

                let answer = response.data.choices[0].message.content;

                // Verifica respostas específicas
                if (question.toLowerCase().includes("qual é o seu nome") || 
                    question.toLowerCase().includes("como você se chama")) {
                    answer = "Meu nome é Lola. Como posso ajudar você hoje?";
                }
                else if (question.toLowerCase().includes("que dia é hoje") ||
                         question.toLowerCase().includes("qual é a data")) {
                    answer = `Hoje é ${dataAtual}.`;
                }
                else if (question.toLowerCase().includes("que horas são") ||
                         question.toLowerCase().includes("qual é a hora")) {
                    answer = `Agora são ${horaAtual}.`;
                }

                // Envia a resposta
                await sock.sendMessage(message.key.remoteJid, { 
                    text: answer,
                    quoted: message 
                });

            } catch (error) {
                console.error('Erro ao chamar a API da Groq:', error);
                await sock.sendMessage(
                    message.key.remoteJid, 
                    { 
                        text: 'Desculpe, ocorreu um erro ao processar sua pergunta.',
                        quoted: message 
                    }
                );
            }
        }
    }
}

module.exports = { ia };
