const { Message, Buttons, Client, MessageMedia, downloadMediaMessage } = require("baileys");
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


// COMANDO - ENTRAR EM GRUPO VIA LINK
if (messageContent.startsWith('!entrar')) {
    if (await verificarDono(sock, message, messageInfo)) {
        try {
            // Extrai o link do comando
            const link = messageContent.slice(7).trim();
            
            // Verifica se foi fornecido um link
            if (!link) {
                await sock.sendMessage(message.key.remoteJid, {
                    text: '❌ Por favor, forneça o link do grupo.\nExemplo: !entrar https://chat.whatsapp.com/xxxxx',
                    quoted: message
                });
                return;
            }

            // Extrai o código do convite do link
            const inviteCode = link.split('com/')[1];
            
            try {
                // Tenta entrar no grupo
                const joinResult = await sock.groupAcceptInvite(inviteCode);

                if (joinResult) {
                    await sock.sendMessage(message.key.remoteJid, {
                        text: '✅ Solicitação enviada! Aguardando aprovação do administrador do grupo...',
                        quoted: message
                    });

                    // Monitora o status da entrada (aguardando aprovação)
                    const checkJoinStatus = async () => {
                        try {
                            const groupInfo = await sock.groupMetadata(joinResult);
                            const isParticipant = groupInfo.participants.some(p => p.id === sock.user.id);

                            if (isParticipant) {
                                await sock.sendMessage(message.key.remoteJid, {
                                    text: `✅ Entrada aprovada! Agora sou membro do grupo *${groupInfo.subject}*`,
                                    quoted: message
                                });
                            } else {
                                // Continua verificando a cada 30 segundos
                                setTimeout(checkJoinStatus, 30000);
                            }
                        } catch (error) {
                            console.error('Erro ao verificar status:', error);
                        }
                    };

                    // Inicia o monitoramento
                    checkJoinStatus();

                } else {
                    await sock.sendMessage(message.key.remoteJid, {
                        text: '❌ Não foi possível entrar no grupo. Verifique se o link é válido.',
                        quoted: message
                    });
                }

            } catch (error) {
                if (error.toString().includes('invite revoked')) {
                    await sock.sendMessage(message.key.remoteJid, {
                        text: '❌ Este link de convite foi revogado ou é inválido.',
                        quoted: message
                    });
                } else {
                    await sock.sendMessage(message.key.remoteJid, {
                        text: '❌ Ocorreu um erro ao tentar entrar no grupo.',
                        quoted: message
                    });
                }
            }

        } catch (error) {
            console.error('Erro ao processar comando !entrar:', error);
            await sock.sendMessage(message.key.remoteJid, {
                text: '❌ Ocorreu um erro ao processar o comando.',
                quoted: message
            });
        }
    }
}



if (messageContent === '!sair') {
    // Verifica se o remetente é o dono do bot
    if (await verificarDono(sock, message, messageInfo)) {
        // Verifica se a mensagem foi enviada em um grupo
        if (message.key.remoteJid.endsWith('@g.us')) {
            try {
                // Envia uma mensagem opcional de despedida
                await sock.sendMessage(message.key.remoteJid, {
                    text: '👋 Bot saindo do grupo...'
                }, { quoted: message });
                
                // Efetua a saída do grupo
                await sock.groupLeave(message.key.remoteJid);
            } catch (error) {
                console.error('Erro ao sair do grupo:', error);
                await sock.sendMessage(message.key.remoteJid, {
                    text: '❌ Ocorreu um erro ao tentar sair do grupo.'
                }, { quoted: message });
            }
        } else {
            await sock.sendMessage(message.key.remoteJid, {
                text: '❌ Este comando só pode ser usado em grupos.'
            }, { quoted: message });
        }
    }
}






if (messageContent === '!limpar') {
    // Verifica se o remetente é um admin (ou se preferir, pode ser verificado como dono)
    if (await verificarAdmin(sock, message, messageInfo)) {
        try {
            // Se o bot estiver usando um objeto de armazenamento (store) para os chats,
            // podemos limpá-lo para "esvaziar" as conversas locais.
            // OBS.: Essa operação limpa apenas o armazenamento interno do bot.
            // Se houver um objeto 'sock.chats' do tipo Map, tentamos limpá-lo também.
            
            if (sock.chats && typeof sock.chats.clear === 'function') {
                sock.chats.clear();
            }
            
            // Se você estiver utilizando um store global, como em alguns exemplos:
            if (global.store && global.store.chats && typeof global.store.chats.clear === 'function') {
                global.store.chats.clear();
            }
            
            // Envia confirmação para o chat de origem
            await sock.sendMessage(message.key.remoteJid, {
                text: '✅ Todas as conversas foram limpas com sucesso!'
            }, { quoted: message });
        } catch (error) {
            console.error('Erro ao limpar as conversas:', error);
            await sock.sendMessage(message.key.remoteJid, {
                text: '❌ Ocorreu um erro ao limpar as conversas.'
            }, { quoted: message });
        }
    }
}






}
}

module.exports = { dono };
