const { Message, Buttons, Client, MessageMedia, downloadMediaMessage, MessageType } = require("baileys");
const { verificarAdmin, verificarDono, verificarGrupo, verificarBotAdmin } = require('../lib/privilegios');
const pool = require('../lib/bd');
require('dotenv').config();
const messages = require('../lib/msg');
const fsExtra = require('fs-extra');
const path = require('path');
const fs = require('fs');

const numeroContato = process.env.NUMERO_CONTATO;
const numeroDono = process.env.NUMERO_DONO;

// Função para verificar grupos
async function verificarGrupos() {
    try {
        if (!global.sock) return;

        const filePath = path.join(__dirname, '..', 'media', 'filtro', 'filtro.txt');
        
        if (!fs.existsSync(filePath)) {
            return;
        }

        const status = fs.readFileSync(filePath, { encoding: 'utf-8' });

        if (status === 'restrição:desativada') {
            return;
        }

        const chats = await global.sock.groupFetchAllParticipating();
        
        for (const [groupId, group] of Object.entries(chats)) {
            try {
                const [results] = await pool.query('SELECT * FROM grupos WHERE id_grupo = ?', [groupId]);
                
                if (results.length === 0) {
                    await global.sock.sendMessage(groupId, {
                        text: 'Este grupo não está autorizado a usar este bot no momento.\nPara obter permissão ou esclarecer\nqualquer dúvida, entre em contato\ncom o desenvolvedor diretamente.\n\n*GOULART - N7 BOTS*\nContato: 5551984112140'
                    });

                    setTimeout(async () => {
                        await global.sock.groupLeave(groupId);
                    }, 3000);
                }
            } catch (error) {
                console.error('Erro ao verificar grupo:', error);
            }
        }
    } catch (error) {
        console.error('Erro na verificação de grupos:', error);
    }
}

// Variável para controle de inicialização
let isInitialized = false;

async function filtro(sock, message, messageInfo) {
    try {
        // Inicializa a verificação apenas uma vez quando global.sock estiver disponível
        if (!isInitialized && global.sock) {
            isInitialized = true;
            
            // Executa verificação inicial
            await verificarGrupos();

            // Configura verificação periódica
            setInterval(verificarGrupos, 600000);
        }

        // Verifica se a mensagem não é do bot e é nova
        if (!messageInfo.metadata.fromMe && message.key.id.length > 21) {
            // Função auxiliar para mensagens aleatórias
            function getRandomMessage(array) {
                const index = Math.floor(Math.random() * array.length);
                return array[index];
            }

            // Obtém o conteúdo da mensagem
            const messageContent = messageInfo.content.text;
            
            // Verifica se é mensagem de grupo
            const isGroup = messageInfo.metadata.isGroup;

            // Aqui você pode adicionar mais lógica de processamento de mensagens
            // como comandos específicos, respostas automáticas, etc.
        }
    } catch (error) {
        console.error('Erro na função filtro:', error);
    }
}

module.exports = { filtro };
