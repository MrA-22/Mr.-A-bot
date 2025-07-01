import fs from 'fs';
import { menuCommand, allMenu, menuStiker } from '../commands/menu.js';
import { ownerCommand } from '../commands/owner.js';
import { adminMenuCommand } from '../commands/admin.js';
import {
    stickerFromImage,
    stickerFromText,
    memeSticker,
    menuStrssStmm
} from '../commands/tools.js';
import { omCommand } from '../commands/ai.js';
import { sendMediaBack } from '../commands/q.js';
import { downloaderCommand, play } from '../commands/downloader.js';
import { userCommands } from "../commands/user.js";
import { bucinCommands } from "../commands/bucin.js";
import { funCommands, whoamiCommand, jawabWhoamiCommand, tebakLagu, skipLagu, clueLagu, stoplg, tebakGambar, skipGambar, clueGambar, stopgm } from '../commands/game.js';

export default async function messageHandler(m, sock) {
    const msg = m.messages[0];
    if (!msg.message || (msg.key && msg.key.remoteJid === "status@broadcast")) return;

    const from = msg.key.remoteJid;
    const type = Object.keys(msg.message)[0];
    const text = (type === "conversation")
        ? msg.message.conversation
        : (msg.message[type]?.text || msg.message[type]?.caption || "");

    // MULTI PREFIX: ! . / #
    const multiPrefix = ['!', '.', '/', '#'];
    const isCommand = multiPrefix.includes(text[0]);
    const cmd = isCommand ? text.slice(1).split(' ')[0].toLowerCase() : '';
    const args = isCommand ? text.slice(1).split(' ').slice(1).join(' ') : '';

    const senderName = msg.pushName || "Pengguna";
    const sender = (msg.key.participant || msg.key.remoteJid || "").split('@')[0];

    // MENU UTAMA
    if (cmd === "menu") {
        await menuCommand({
            sock,
            msg,
            from,
            senderName,
            mentionJid: sender
        });
    }

    if (cmd === "allmenu") {
        const mentionText = `@${sender}`;
        const menuText = allMenu(mentionText);
        await sock.sendMessage(from, {
            text: menuText,
            mentions: [sender]
        }, { quoted: msg });
    }

    if (/^owner\??$/i.test(cmd)) {
        await ownerCommand({ sock, msg, from });
    }

    if (cmd === "menustiker") {
        return menuStiker({ sock, msg, from });
    }

    // MENU ADMIN
    if (cmd === "adminmenu") {
        const mentionJid = msg.key.participant || msg.key.remoteJid;
        await adminMenuCommand({
            sock,
            msg,
            from,
            mentionJid
        });
    }

    // FITUR STIKER
    if (cmd === "stkr") {
        await stickerFromImage({ sock, msg, from });
    }

    if (cmd === "strss") {
        if (!args) {
            return menuStrssStmm({ sock, msg, from }); // Tampilkan bantuan
        }
        await stickerFromText({ sock, msg, from, text: args });
    }

    if (cmd === "stmm") {
        if (!args.includes('|')) {
            return menuStrssStmm({ sock, msg, from }); // Tampilkan bantuan
        }
        await memeSticker({ sock, msg, from, text: args });
    }

    // Command AI
    if (cmd === "om") {
        await omCommand({
            sock,
            msg,
            from,
            text
        });
    }

    // Command .q untuk kirim ulang media
    if (cmd === "q") {
        await sendMediaBack({
            sock,
            msg,
            from
        });
    }

    if (cmd === "media") {
        await downloaderCommand({ sock, msg, from, text });
    }

    if (cmd === "play") {
        return await play(sock, msg, from, sender, cmd, args);
    }

    // PROFIL & USER
    if (['daftar', 'profil'].includes(cmd)) {
        await userCommands(sock, msg, from, sender, cmd, args);
    }

    // BUCIN
    if (['pacaran', 'putus'].includes(cmd)) {
        await bucinCommands(sock, msg, from, sender, cmd, args);
    }

    if (["aku mau", "yaudah ayo"].includes(text.toLowerCase())) {
        await bucinCommands(sock, msg, from, sender, "", text);
    }

    // FUN
    await funCommands(sock, msg, from, sender, cmd, args);
    if (cmd === "whoami") {
        return await whoamiCommand(sock, msg, from);
    }
    await jawabWhoamiCommand(sock, msg, from, sender);

    // TEBAK LAGU
    await tebakLagu(sock, msg, from, sender, cmd, args);
    if (cmd === "skiplg") {
        await skipLagu(sock, msg, from);
    }
    if (cmd === "cluelg") {
        await clueLagu(sock, msg, from, sender);
    }
    if (cmd === "stoplg") {
        return await stoplg(sock, msg, from, sender, cmd, args);
    }

    // TEBAK GAMBAR
    await tebakGambar(sock, msg, from, sender, cmd, args);
    if (cmd === "skipgm") {
        return await skipGambar(sock, msg, from, sender, cmd);
    }
    if (cmd === "cluegm") {
        return await clueGambar(sock, msg, from, sender, cmd);
    }
    if (cmd === "stopgm") {
        return await stopgm(sock, msg, from, sender, cmd, args);
    }
}
