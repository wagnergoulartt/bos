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

// Função para atualizar lista de membros do grupo
async function updateGroupMembers(sock, groupId) {
    try {
        const groupMetadata = await sock.groupMetadata(groupId);
        const participants = groupMetadata.participants;

        // Adiciona novos membros ou atualiza existentes
        for (const participant of participants) {
            const userId = participant.id;

            const [exists] = await pool.query(
                'SELECT * FROM mensagens WHERE IdGrupo = ? AND IdUsuario = ?',
                [groupId, userId]
            );

            if (exists.length === 0) {
                await pool.query(
                    'INSERT INTO mensagens (IdGrupo, IdUsuario, Nome, NumeroMensagens) VALUES (?, ?, ?, ?)',
                    [groupId, userId, userId, 0] // Salvando o ID do usuário na coluna Nome
                );
            }
        }

        // Remove membros que saíram do grupo
        const participantIds = participants.map(p => p.id);
        await pool.query(
            'DELETE FROM mensagens WHERE IdGrupo = ? AND IdUsuario NOT IN (?)',
            [groupId, participantIds]
        );
    } catch (error) {
        console.error('Erro ao atualizar membros do grupo:', error);
    }
}

// Função para atualizar contagem de mensagens
async function updateMessageCount(groupId, userId) {
    try {
        const [rows] = await pool.query(
            'SELECT * FROM mensagens WHERE IdGrupo = ? AND IdUsuario = ?',
            [groupId, userId]
        );

        if (rows.length > 0) {
            await pool.query(
                'UPDATE mensagens SET NumeroMensagens = NumeroMensagens + 1 WHERE IdGrupo = ? AND IdUsuario = ?',
                [groupId, userId]
            );
        } else {
            await pool.query(
                'INSERT INTO mensagens (IdGrupo, IdUsuario, Nome, NumeroMensagens) VALUES (?, ?, ?, ?)',
                [groupId, userId, userId, 1] // Salvando o ID do usuário na coluna Nome
            );
        }
    } catch (error) {
        console.error('Erro ao atualizar contagem de mensagens:', error);
    }
}

// Função para obter top membros
async function getTopMembers(groupId) {
    try {
        const [rows] = await pool.query(
            'SELECT Nome, NumeroMensagens FROM mensagens WHERE IdGrupo = ? ORDER BY NumeroMensagens DESC LIMIT 50',
            [groupId]
        );
        return rows;
    } catch (error) {
        console.error('Erro ao obter top membros:', error);
        return [];
    }
}

// Função para obter membros menos ativos
async function getBottomMembers(groupId) {
    try {
        const [rows] = await pool.query(`
            SELECT Nome, NumeroMensagens
            FROM mensagens 
            WHERE IdGrupo = ?
            ORDER BY NumeroMensagens ASC
            LIMIT 50
        `, [groupId]);
        return rows;
    } catch (error) {
        console.error('Erro ao obter membros menos ativos:', error);
        return [];
    }
}

async function mensagens(sock, message, messageInfo) {
    const messageContent = messageInfo.content.text;
    const isGroup = messageInfo.metadata.isGroup;

    if (!messageInfo.metadata.fromMe) {
        function getRandomMessage(array) {
            const index = Math.floor(Math.random() * array.length);
            return array[index];
        }

        if (isGroup) {
            const groupId = message.key.remoteJid;
            
            await updateGroupMembers(sock, groupId);

            if (messageContent) {
                const userId = message.key.participant || message.key.remoteJid;
                await updateMessageCount(groupId, userId);
            }

            if (messageContent === '!topativos') {
                if (await verificarAdmin(sock, message, messageInfo)) {
                    const topMembers = await getTopMembers(groupId);
                    let response = '*TOP ATIVOS DO GRUPO:*\n\n';
                    const mentions = [];
                    
                    for (const member of topMembers) {
                        mentions.push(member.Nome);
                        response += `@${member.Nome.split('@')[0]} - *[${member.NumeroMensagens}]*\n`;
                    }
                    
                    await sock.sendMessage(groupId, { 
                        text: response,
                        mentions: mentions
                    });
                }
            }

            if (messageContent === '!moitas') {
                if (await verificarAdmin(sock, message, messageInfo)) {
                    const bottomMembers = await getBottomMembers(groupId);
                    let response = '*MOITAS DO GRUPO:*\n\n';
                    const mentions = [];
                    
                    for (const member of bottomMembers) {
                        mentions.push(member.Nome);
                        response += `@${member.Nome.split('@')[0]} - *(${member.NumeroMensagens})*\n`;
                    }
                    
                    await sock.sendMessage(groupId, { 
                        text: response,
                        mentions: mentions
                    });
                }
            }
        }
    }
}

module.exports = { mensagens };
