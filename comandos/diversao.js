const { Message, Buttons, Client, downloadMediaMessage } = require('@whiskeysockets/baileys');
const { verificarAdmin, verificarDonoBot, verificarGrupo, verificarBotAdmin } = require('../lib/privilegios');
const messages = require('../lib/msg');
require('dotenv').config();
const P = require('pino');

async function diversao(sock, message, messageInfo) {
    // Usando a nova estrutura messageInfo para obter conteúdo e tipo da mensagem
    const messageContent = messageInfo.content.text;
    
    // Verifica se é mensagem de grupo usando os metadados
    const isGroup = messageInfo.metadata.isGroup;

    // Verifica se a mensagem não é do bot e é nova
    if (!messageInfo.metadata.fromMe && message.key.id.length > 21) {
        // Função auxiliar para mensagens aleatórias permanece a mesma
        function getRandomMessage(array) {
            const index = Math.floor(Math.random() * array.length);
            return array[index];
        }

/////////////////////////////////////////////////////////////////////////////////////    
// COMANDO - SINCERÃO
/////////////////////////////////////////////////////////////////////////////////////

if (messageContent.startsWith('!sincerao')) {
if (await verificarGrupo(sock, message, messageInfo)) {
if (await verificarAdmin(sock, message, messageInfo)) {
    try {
        // Verifica se existem pessoas mencionadas
        const mentions = messageInfo.content.mentionedJids;
        
        if (!mentions || mentions.length < 2) {
            await sock.sendMessage(messageInfo.metadata.from, {
                text: "Você precisa mencionar pelo menos 2 pessoas para usar o !sincerao",
                quoted: message
            });
            return;
        }

        // Seleciona uma pessoa aleatória das mencionadas
        const pessoaEscolhida = mentions[Math.floor(Math.random() * mentions.length)];
        
        // Pega uma mensagem aleatória da lista Sincerao
        const mensagemAleatoria = getRandomMessage(messages.Sincerao);

        // Substitui o placeholder {user} pelo número do usuário
        const mensagemFinal = mensagemAleatoria.replace('{user}', pessoaEscolhida.split('@')[0]);

        // Envia a mensagem mencionando a pessoa
        await sock.sendMessage(
            messageInfo.metadata.from,
            {
                text: mensagemFinal,
                mentions: [pessoaEscolhida],
                quoted: message,
            quoted: message // Isso faz a mensagem ser uma resposta à mensagem original
            }, { quoted: message });

    } catch (error) {
        console.error('Erro no comando !sincerao:', error);
        await sock.sendMessage(
            messageInfo.metadata.from,
            {
                text: "Ocorreu um erro ao executar o comando !sincerao",
                quoted: message
            }
        );
    }
}
}
}

/////////////////////////////////////////////////////////////////////////////////////    
// COMANDO - PIADA
/////////////////////////////////////////////////////////////////////////////////////

        if (messageContent === '!piada') {
        if (await verificarGrupo(sock, message, messageInfo)) {
            const resposta = getRandomMessage(messages.Piada);
            await sock.sendMessage(message.key.remoteJid, { 
                text: resposta,
                quoted: message // Isso faz a mensagem ser uma resposta à mensagem original
            }, { quoted: message }); // Adiciona quoted aqui também
            return;
        }
}

/////////////////////////////////////////////////////////////////////////////////////    
// COMANDO - CANTADA
/////////////////////////////////////////////////////////////////////////////////////

        if (messageContent === '!cantada') {
        if (await verificarGrupo(sock, message, messageInfo)) {
            const resposta = getRandomMessage(messages.Cantada);
            await sock.sendMessage(message.key.remoteJid, { 
                text: resposta,
                quoted: message // Isso faz a mensagem ser uma resposta à mensagem original
            }, { quoted: message }); // Adiciona quoted aqui também
            return;
        }
}

/////////////////////////////////////////////////////////////////////////////////////    
// COMANDO - CHARADA
/////////////////////////////////////////////////////////////////////////////////////

        if (messageContent === '!charada') {
        if (await verificarGrupo(sock, message, messageInfo)) {
            const resposta = getRandomMessage(messages.Charada);
            await sock.sendMessage(message.key.remoteJid, { 
                text: resposta,
                quoted: message // Isso faz a mensagem ser uma resposta à mensagem original
            }, { quoted: message }); // Adiciona quoted aqui também
            return;
        }
}

/////////////////////////////////////////////////////////////////////////////////////    
// COMANDO - NIVEL GOLPE
/////////////////////////////////////////////////////////////////////////////////////

if (messageContent.startsWith('!nivelgolpe')) {
if (await verificarGrupo(sock, message, messageInfo)) {
    try {

        // Verifica se tem menção
        const mentions = messageInfo.content.mentionedJids;

        if (!mentions || mentions.length === 0) {
            await sock.sendMessage(message.key.remoteJid, {
                text: "❌ Você precisa mencionar alguém para calcular o nível de golpe!",
                quoted: message
            });
            return;
        }

        // Pega o usuário mencionado
        const usuarioMencionado = mentions[0];
        
        // Seleciona uma mensagem aleatória do array NivelGolpe
        const mensagem = getRandomMessage(messages.NivelGolpe);

        // Substitui {name} pela menção do usuário
        const resposta = mensagem.replace('{name}', `@${usuarioMencionado.split('@')[0]}`);

        // Envia a mensagem mencionando o usuário
        await sock.sendMessage(message.key.remoteJid, {
            text: resposta,
            mentions: [usuarioMencionado],
            quoted: message,
            quoted: message // Isso faz a mensagem ser uma resposta à mensagem original
            }, { quoted: message });

    } catch (error) {
        console.error('Erro ao executar nivel golpe:', error);
        await sock.sendMessage(message.key.remoteJid, {
            text: "❌ Ocorreu um erro ao calcular o nível de golpe",
        quoted: message // Isso faz a mensagem ser uma resposta à mensagem original
            }, { quoted: message });
    }
}
}

/////////////////////////////////////////////////////////////////////////////////////    
// COMANDO - PAR
/////////////////////////////////////////////////////////////////////////////////////

if (messageContent.startsWith('!par')) {
if (await verificarGrupo(sock, message, messageInfo)) {
        // Extrai os usuários mencionados na mensagem
        const mentions = message.message.extendedTextMessage?.contextInfo?.mentionedJid || [];
        
        // Verifica se dois usuários foram mencionados
        if (mentions && mentions.length === 2) {
            // Gera um número aleatório entre 0 e 100 para a porcentagem de amor
            const lovePercentage = Math.floor(Math.random() * 101); // 0% a 100%
            
            // Obtém os números dos usuários sem o @s.whatsapp.net
            const user1 = mentions[0].split('@')[0];
            const user2 = mentions[1].split('@')[0];
            
            // Cria a mensagem de porcentagem de amor
            const loveMessage = `*A PORCENTAGEM DE COMPATIBILIDADE ENTRE O PAR:*\n\n@${user1}\n@${user2}\n\n*É DE EXATAMENTE: ${lovePercentage}%*`;

            // Envia a mensagem com as menções
            await sock.sendMessage(
                message.key.remoteJid,
                { 
                    text: loveMessage,
                    mentions: mentions // Array com os JIDs dos usuários mencionados
                },
                { quoted: message,
            quoted: message // Isso faz a mensagem ser uma resposta à mensagem original
            }, { quoted: message });
        } else {
            // Envia uma mensagem de erro se o número de usuários mencionados não for 2
            await sock.sendMessage(
                message.key.remoteJid,
                { text: '*Você precisa mencionar duas pessoas para calcular a porcentagem de amor.*' },
                { quoted: message,
                quoted: message // Isso faz a mensagem ser uma resposta à mensagem original
            }, { quoted: message }); // Adiciona quoted aqui também
        }
    }
}

/////////////////////////////////////////////////////////////////////////////////////    
// COMANDO - TOP5
/////////////////////////////////////////////////////////////////////////////////////

if (messageContent.startsWith('!top5 ')) {
if (await verificarGrupo(sock, message, messageInfo)) {
        try {
            const titulo = messageContent.slice(6).trim(); // Remove o comando '!top5 '
            
            // Obtém os participantes do grupo
            const groupMetadata = await sock.groupMetadata(message.key.remoteJid);
            const participantes = groupMetadata.participants;

            // Garante que há pelo menos 5 participantes no grupo
            if (participantes.length < 5) {
                await sock.sendMessage(
                    message.key.remoteJid, 
                    { text: 'O grupo não possui participantes suficientes para o comando !top5.' },
                    { quoted: message }
                );
                return;
            }

            // Seleciona 5 participantes aleatórios
            const selecionados = participantes
                .sort(() => Math.random() - 0.5)
                .slice(0, 5);

            // Constrói a mensagem
            let mensagem = `*Top5 ${titulo}*\n\n`;
            let mencoes = [];

            selecionados.forEach((participante) => {
                const numero = participante.id.split('@')[0];
                mensagem += `@${numero}\n`; // Adiciona a menção
                mencoes.push(participante.id); // Adiciona o JID à lista de menções
            });

            // Envia a mensagem com menções
            await sock.sendMessage(
                message.key.remoteJid,
                {
                    text: mensagem,
                    mentions: mencoes // Array com os JIDs dos usuários mencionados
                },
                { quoted: message,
                quoted: message // Isso faz a mensagem ser uma resposta à mensagem original
                }, { quoted: message });
        } catch (error) {
            console.error('Erro ao processar mensagem:', error);
        }
    }
}

/////////////////////////////////////////////////////////////////////////////////////    
// COMANDO - BAFOMENTRO
/////////////////////////////////////////////////////////////////////////////////////

if (messageContent.startsWith('!bafometro')) {
if (await verificarGrupo(sock, message, messageInfo)) {
    try {


        // Verifica se tem menção
        const mentions = messageInfo.content.mentionedJids;

        if (!mentions || mentions.length === 0) {
            await sock.sendMessage(message.key.remoteJid, {
                text: "❌ Você precisa mencionar alguém para usar o bafometro!",
                quoted: message
            });
            return;
        }

        // Pega o usuário mencionado
        const usuarioMencionado = mentions[0];
        
        // Seleciona uma mensagem aleatória do array Bafometro
        const mensagem = getRandomMessage(messages.Bafometro);

        // Substitui {name} pela menção do usuário
        const resposta = mensagem.replace('{name}', `@${usuarioMencionado.split('@')[0]}`);

        // Envia a mensagem mencionando o usuário
        await sock.sendMessage(message.key.remoteJid, {
            text: resposta,
            mentions: [usuarioMencionado],
            quoted: message,
            quoted: message // Isso faz a mensagem ser uma resposta à mensagem original
            }, { quoted: message });

    } catch (error) {
        console.error('Erro ao executar bafometro:', error);
        await sock.sendMessage(message.key.remoteJid, {
            text: "❌ Ocorreu um erro ao executar o bafometro",
         quoted: message // Isso faz a mensagem ser uma resposta à mensagem original
            }, { quoted: message,
                quoted: message // Isso faz a mensagem ser uma resposta à mensagem original
            }, { quoted: message }); 
    }
}
}

/////////////////////////////////////////////////////////////////////////////////////    
// COMANDO - VIADOMETRO
/////////////////////////////////////////////////////////////////////////////////////

if (messageContent.startsWith('!viadometro')) {
if (await verificarGrupo(sock, message, messageInfo)) {
    try {

        // Verifica se tem menção
        const mentions = messageInfo.content.mentionedJids;

        if (!mentions || mentions.length === 0) {
            await sock.sendMessage(message.key.remoteJid, {
                text: "❌ Você precisa mencionar alguém para usar o viadometro!",
                quoted: message
            });
            return;
        }

        // Pega o usuário mencionado
        const usuarioMencionado = mentions[0];
        
        // Seleciona uma mensagem aleatória do array Viadometro
        const mensagem = getRandomMessage(messages.Viadometro);

        // Envia a mensagem mencionando o usuário
        await sock.sendMessage(message.key.remoteJid, {
            text: mensagem,
            mentions: [usuarioMencionado],
            quoted: message,
            quoted: message // Isso faz a mensagem ser uma resposta à mensagem original
            }, { quoted: message });

    } catch (error) {
        console.error('Erro ao executar viadometro:', error);
        await sock.sendMessage(message.key.remoteJid, {
            text: "❌ Ocorreu um erro ao executar o viadometro",
         quoted: message // Isso faz a mensagem ser uma resposta à mensagem original
            }, { quoted: message });
    }
}
}

/////////////////////////////////////////////////////////////////////////////////////    
// COMANDO - CARA
/////////////////////////////////////////////////////////////////////////////////////

if (messageInfo.types.image && messageInfo.content.text.toLowerCase().startsWith('!cara')) {
if (await verificarGrupo(sock, message, messageInfo)) {
    try {
        const imageMessage = message.message.imageMessage;
        const buffer = await downloadMediaMessage(
            message,
            'buffer',
            {},
            { 
                logger: P({ level: 'silent' }),
                reuploadRequest: sock.updateMediaMessage
            }
        );

        // Função para pegar mensagem aleatória
        function getRandomMessage(array) {
            const index = Math.floor(Math.random() * array.length);
            return array[index];
        }

        // Gera 15 mensagens aleatórias e numeradas em negrito
        let mensagensNumeradas = '';
        for(let i = 1; i <= 15; i++) {
            const mensagemAleatoria = getRandomMessage(messages.Cara);
            mensagensNumeradas += `${i}. *${mensagemAleatoria}*\n`;
        }

        // Adiciona duas quebras de linha e a frase final em negrito
        mensagensNumeradas += '\n\n*PELA FOTO ACIMA, TENHO CARA DE QUE ?*';

        await sock.sendMessage(
            messageInfo.metadata.from,
            {
                image: buffer,
                caption: mensagensNumeradas
            }
        );

    } catch (error) {
        console.error('Error processing !cara command:', error);
        await sock.sendMessage(
            messageInfo.metadata.from, 
            { text: 'Desculpe, houve um erro ao processar a imagem.' }
        );
    }
}
}

/////////////////////////////////////////////////////////////////////////////////////    
// COMANDO - EU NUNCA
/////////////////////////////////////////////////////////////////////////////////////

if (messageInfo.types.text && messageInfo.content.text.toLowerCase() === '!eununca') {
if (await verificarGrupo(sock, message, messageInfo) && await verificarAdmin(sock, message, messageInfo)) {
            // Função para pegar mensagem aleatória
            function getRandomMessage(array) {
                const index = Math.floor(Math.random() * array.length);
                return array[index];
            }

            // Pega uma frase aleatória
            const fraseAleatoria = getRandomMessage(messages.EuNunca);

            // Constrói a mensagem com formatação
            const euNuncaMessage = `*EU JÁ* 🍺 *EU NUNCA* 😅\n\n*${fraseAleatoria}*\n\n*REAJA COM UM DOS EMOJI ACIMA!*`;

            // Envia a mensagem
            await sock.sendMessage(
                messageInfo.metadata.from,
                { text: euNuncaMessage,
            quoted: message // Isso faz a mensagem ser uma resposta à mensagem original
            }, { quoted: message });

        }
}



    }
}

module.exports = { diversao };