async function getContactName(sock, message, messageInfo) {
    try {
        const mentions = messageInfo.content.mentionedJids;
        if (!mentions || mentions.length === 0) return null;

        const userJid = mentions[0];
        
        // Tenta obter o nome através dos metadados do grupo
        if (messageInfo.metadata.isGroup) {
            const groupMetadata = await sock.groupMetadata(message.key.remoteJid);
            const participant = groupMetadata.participants.find(p => p.id === userJid);
            
            // Tenta obter o nome do participante de várias formas possíveis
            if (participant) {
                const name = participant.name || 
                            participant.notify || 
                            participant.pushName || 
                            participant.verifiedName;
                
                if (name) return name;
            }
        }

        // Se não conseguir o nome, retorna o número formatado
        return userJid.replace('@s.whatsapp.net', '');
    } catch (error) {
        console.error('Erro ao obter nome do contato:', error);
        // Garante que a variável mentions existe antes de usá-la
        const userJid = messageInfo?.content?.mentionedJids?.[0] || '';
        return userJid.replace('@s.whatsapp.net', '');
    }
}

module.exports = { getContactName };