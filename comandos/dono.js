const { Message, Buttons, Client, MessageMedia, downloadMediaMessage } = require('@whiskeysockets/baileys');
const { verificarAdmin, verificarDono, verificarGrupo, verificarBotAdmin } = require('../lib/privilegios');
const pool = require('../lib/bd');
const messages = require('../lib/msg');
const fsExtra = require('fs-extra');
const path = require('path');
const fs = require('fs');

// Define os caminhos para o arquivo de permissões
const basePath = path.resolve(__dirname, '..', 'media', 'filtro');
const fileName = 'filtro.txt';
const filePath = path.join(basePath, fileName);

async function dono(sock, message, messageInfo) {
    // Usando a nova estrutura messageInfo para obter conteúdo e tipo da mensagem
    const messageContent = messageInfo.content.text;
    
    // Verifica se é mensagem de grupo usando os metadados
    const isGroup = messageInfo.metadata.isGroup;

    // Verifica se a mensagem não é do bot e é nova
    if (!messageInfo.metadata.fromMe && message.key.id.length > 21) {
        // Função auxiliar para mensagens aleatórias
        function getRandomMessage(array) {
            const index = Math.floor(Math.random() * array.length);
            return array[index];
        }

        // Verifica se o arquivo de permissões existe, se não, cria com status padrão
        if (!fs.existsSync(filePath)) {
            fs.writeFileSync(filePath, 'restrição:ativa');
        }

        // Comandos de restrição de grupo
        if (messageContent === '!rgativar' || messageContent === '!rgdesativar') {
        if (await verificarDono(sock, message, messageInfo)) {
                try {
                    const status = messageContent === '!rgativar' ? 'restrição:ativa' : 'restrição:desativada';
                    
                    fs.writeFileSync(filePath, status);
                    
                    await sock.sendMessage(message.key.remoteJid, {
                        text: `Restrição ${status.split(':')[1]}.`,
                        quoted: message
                    });
                } catch (error) {
                    console.error('Falha ao escrever no arquivo', error);
                    await sock.sendMessage(message.key.remoteJid, {
                        text: 'Ocorreu um erro ao tentar alterar a restrição.',
                        quoted: message
                    });
                }
            }
        }

        // COMANDO - VER GRUPOS DO BOT
        if (messageContent === '!grupos') {
        if (await verificarDono(sock, message, messageInfo)) {
                try {
                // Obtém todos os chats
                const chats = await sock.groupFetchAllParticipating();
                let resposta = '';

                // Itera sobre cada grupo
                for (const [id, chat] of Object.entries(chats)) {
                    const participantes = chat.participants;
                    if (participantes) {
                        const qtdParticipantes = participantes.length;
                        const qtdAdmins = participantes.filter(p => p.admin === 'admin' || p.admin === 'superadmin').length;

                        resposta += `🏷️ *GRUPO:* ${chat.subject}\n`;
                        resposta += `📱 *ID:* ${id}\n`;
                        resposta += `👥 *PARTICIPANTES:* ${qtdParticipantes}\n`;
                        resposta += `👑 *ADMINISTRADORES:* ${qtdAdmins}\n`;
                        resposta += `▔▔▔▔▔▔▔▔▔▔▔▔▔▔\n`;
                    }
                }

                if (resposta) {
                    await sock.sendMessage(message.key.remoteJid, {
                        text: resposta.trim()
                    });
                } else {
                    await sock.sendMessage(message.key.remoteJid, {
                        text: '❌ Nenhum grupo encontrado.'
                    });
                }

            } catch (error) {
                console.error('Erro ao listar grupos:', error);
                await sock.sendMessage(message.key.remoteJid, {
                    text: '❌ Ocorreu um erro ao listar os grupos.'
                });
            }
        }
    }







if (messageContent.startsWith('!btodos')) {
if (await verificarDono(sock, message, messageInfo)) {
    try {
        // Obtém os metadados do grupo
        const groupMetadata = await sock.groupMetadata(message.key.remoteJid);
        
        // Filtra participantes que não são admins
        const nonAdmins = groupMetadata.participants.filter(
            participant => participant.admin !== 'admin' && participant.admin !== 'superadmin'
        );

        // Mapeia os IDs dos não-admins
        const nonAdminIds = nonAdmins.map(participant => participant.id);

        // Remove os participantes
        await sock.groupParticipantsUpdate(
            message.key.remoteJid,
            nonAdminIds,
            "remove"
        );

        // Envia mensagem de confirmação
        await sock.sendMessage(message.key.remoteJid, {
            text: "✅ Todos os participantes não-admins foram removidos do grupo.",
            quoted: message
        });

    } catch (error) {
        console.error('Erro ao banir todos:', error);
        await sock.sendMessage(message.key.remoteJid, {
            text: "❌ Ocorreu um erro ao tentar remover os participantes",
            quoted: message
        });
    }
}
}













}
}

module.exports = { dono };