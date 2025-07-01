import fs from 'fs';
import path from 'path';
import axios from 'axios';
import twemoji from 'twemoji';
import { createCanvas, loadImage, registerFont } from 'canvas';
import { downloadMediaMessage } from '@whiskeysockets/baileys';
import { Sticker } from 'wa-sticker-formatter';

const EMOJI_FOLDER = './assets/emojis';
registerFont('./assets/fonts/Impact.ttf', { family: 'Impact' });

// 🔧 Fungsi bantu membungkus teks ke dalam kotak
function formatBoxedText(title, lines) {
    const top = `╭──${title}──⬣`;
    const body = lines.map(line => `│${line}`).join('\n');
    const bottom = '╰⬣';
    return `${top}\n${body}\n${bottom}`;
}

// 🔧 Ambil buffer dari gambar langsung atau dari reply
async function getImageBuffer(msg, sock) {
    try {
        const imageMsg = msg.message?.imageMessage ||
            msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage;

        if (!imageMsg) return null;

        const buffer = await downloadMediaMessage(
            msg.message?.imageMessage ? msg : { message: msg.message.extendedTextMessage.contextInfo.quotedMessage },
            'buffer',
            {},
            { reuploadRequest: sock.reuploadRequest }
        );

        return buffer;
    } catch (err) {
        console.error('❌ Gagal ambil media:', err);
        return null;
    }
}

// 📌 .stkr - Gambar jadi stiker
export async function stickerFromImage({ sock, msg, from }) {
    const buffer = await getImageBuffer(msg, sock);
    if (!buffer) {
        const helpText = formatBoxedText('🧷 FITUR STIKER: GAMBAR KE STIKER', [
            '📎 Perintah   : .stkr',
            '🖼 Input      : Kirim / Balas gambar',
            '🎨 Output     : Gambar jadi stiker',
            '📦 Pack       : MR.A BOT',
            '👤 Author     : Sticker'
        ]);
        return sock.sendMessage(from, { text: helpText }, { quoted: msg });
    }

    const sticker = new Sticker(buffer, {
        pack: 'MR.A BOT',
        author: 'Sticker',
        type: 'full',
        quality: 70,
    });

    const stickerBuffer = await sticker.toBuffer();
    await sock.sendMessage(from, { sticker: stickerBuffer }, { quoted: msg });
}

// 📌 .strss <teks> - Teks jadi stiker dengan font besar
export async function stickerFromText({ sock, msg, from, text }) {
    if (!text) {
        const helpText = formatBoxedText('🧷 FITUR STIKER: TEKS BESAR', [
            '📎 Perintah   : .strss <teks>',
            '✍️ Input      : Teks biasa',
            '🎨 Output     : Stiker teks besar & tebal',
            '🔠 Font       : Sans tebal 70px',
            '🎨 Latar      : Putih',
            '📦 Pack       : MR.A BOT',
            '👤 Author     : TextSticker'
        ]);
        return sock.sendMessage(from, { text: helpText }, { quoted: msg });
    }

    const canvas = createCanvas(512, 512);
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'black';
    ctx.font = 'bold 70px Sans';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const maxWidth = 460;
    const lines = [];
    let words = text.split(' ');
    let line = '';
    for (let i = 0; i < words.length; i++) {
        const testLine = line + words[i] + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && i > 0) {
            lines.push(line);
            line = words[i] + ' ';
        } else {
            line = testLine;
        }
    }
    lines.push(line);

    const lineHeight = 80;
    const startY = (canvas.height - lines.length * lineHeight) / 2;
    for (let i = 0; i < lines.length; i++) {
        ctx.fillText(lines[i].trim(), canvas.width / 2, startY + i * lineHeight);
    }

    const buffer = canvas.toBuffer();

    const sticker = new Sticker(buffer, {
        pack: 'MR.A BOT',
        author: 'TextSticker',
        type: 'full',
    });

    const stickerBuffer = await sticker.toBuffer();
    await sock.sendMessage(from, { sticker: stickerBuffer }, { quoted: msg });
}

// 📌 .stmm - Meme stiker dengan teks atas & bawah
export async function memeSticker({ sock, msg, from, text }) {
    const [topTextRaw = '', bottomTextRaw = ''] = text?.split('|').map(t => t.trim()) || [];
    const buffer = await getImageBuffer(msg, sock);
    if (!buffer) {
        const helpText = formatBoxedText('🧷 FITUR STIKER: MEME DENGAN TEKS', [
            '📎 Perintah   : .stmm <atas>|<bawah>',
            '🖼 Input      : Kirim / Balas gambar',
            '✍️ Teks      : Teks atas & bawah',
            '😂 Emoji      : Didukung (Twemoji)',
            '🔠 Font       : Impact + Outline',
            '📐 Ukuran     : 512x512 px',
            '📦 Pack       : MR.A BOT',
            '👤 Author     : MemeEmote'
        ]);
        return sock.sendMessage(from, { text: helpText }, { quoted: msg });
    }

    const image = await loadImage(buffer);
    const STICKER_SIZE = 512;
    const canvas = createCanvas(STICKER_SIZE, STICKER_SIZE);
    const ctx = canvas.getContext('2d');

    const cropSize = Math.min(image.width, image.height);
    const cropX = (image.width - cropSize) / 2;
    const cropY = 0;

    ctx.drawImage(image, cropX, cropY, cropSize, cropSize, 0, 0, STICKER_SIZE, STICKER_SIZE);

    const fontSize = Math.floor(STICKER_SIZE / 10);
    const emojiSize = fontSize + 10;

    const drawTextWithEmoji = async (text, y) => {
        const lines = wrapText(ctx, text.toUpperCase(), canvas.width - 40);
        for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
            const line = lines[lineIndex];
            const lineY = y + (lineIndex + 1) * (fontSize + 10) - 5;

            let totalWidth = 0;
            const elements = [];

            for (const word of line.split(' ')) {
                for (const char of word) {
                    if (twemoji.test(char)) {
                        const codepoint = twemoji.convert.toCodePoint(char);
                        const emojiPath = path.join(EMOJI_FOLDER, `${codepoint}.png`);

                        if (!fs.existsSync(emojiPath)) {
                            const url = `https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/${codepoint}.png`;
                            if (!fs.existsSync(EMOJI_FOLDER)) {
                                fs.mkdirSync(EMOJI_FOLDER, { recursive: true });
                            }
                            const res = await axios.get(url, { responseType: 'arraybuffer' });
                            fs.writeFileSync(emojiPath, res.data);
                        }

                        const emojiImg = await loadImage(emojiPath);
                        elements.push({ type: 'emoji', img: emojiImg });
                        totalWidth += emojiSize;
                    } else {
                        ctx.font = `bold ${fontSize}px Impact`;
                        const w = ctx.measureText(char).width;
                        elements.push({ type: 'text', char, width: w });
                        totalWidth += w;
                    }
                }
                const space = ctx.measureText(' ').width;
                elements.push({ type: 'space', width: space });
                totalWidth += space;
            }

            let x = (canvas.width - totalWidth) / 2;

            for (const el of elements) {
                if (el.type === 'emoji') {
                    ctx.drawImage(el.img, x, lineY - emojiSize + 5, emojiSize, emojiSize);
                    x += emojiSize;
                } else if (el.type === 'text') {
                    ctx.font = `bold ${fontSize}px Impact`;
                    ctx.fillStyle = 'white';
                    ctx.strokeStyle = 'black';
                    ctx.lineWidth = 8;
                    ctx.strokeText(el.char, x, lineY);
                    ctx.fillText(el.char, x, lineY);
                    x += el.width;
                } else if (el.type === 'space') {
                    x += el.width;
                }
            }
        }
    };

    const topPadding = 5;
    const bottomPadding = 5;

    if (topTextRaw) await drawTextWithEmoji(topTextRaw, topPadding);

    if (bottomTextRaw) {
        const lines = wrapText(ctx, bottomTextRaw, canvas.width - 40);
        const totalHeight = lines.length * (fontSize + 10);
        const startY = canvas.height - totalHeight + 6 - bottomPadding;
        await drawTextWithEmoji(bottomTextRaw, startY);
    }

    const finalBuffer = canvas.toBuffer();
    const sticker = new Sticker(finalBuffer, {
        pack: 'MR.A BOT',
        author: 'MemeEmote',
        type: 'full',
    });

    const stickerBuffer = await sticker.toBuffer();
    await sock.sendMessage(from, { sticker: stickerBuffer }, { quoted: msg });
}

// 🔧 Fungsi bantu untuk membungkus teks
function wrapText(ctx, text, maxWidth) {
    const words = text.split(' ');
    const lines = [];
    let line = '';
    for (const word of words) {
        const testLine = line + word + ' ';
        const { width } = ctx.measureText(testLine);
        if (width > maxWidth && line) {
            lines.push(line.trim());
            line = word + ' ';
        } else {
            line = testLine;
        }
    }
    lines.push(line.trim());
    return lines;
}

export async function menuStrssStmm({ sock, msg, from }) {
    const menuText = `
╭──🎨 *STIKER TEKS & MEME* ──⬣
│ • .strss <teks>
│    ➤ Jadikan teks besar sebagai stiker
│    ➤ Contoh: .strss Halo Dunia!
│
│ • .stmm <atas>|<bawah>
│    ➤ Jadikan gambar balasan stiker meme
│    ➤ Bisa pakai emoji & teks lucu
│    ➤ Contoh: .stmm Ini atas | Ini bawah
╰⬣

✨ Balas gambar untuk membuat meme, atau kirim teks saja untuk stiker teks.
`.trim();

    await sock.sendMessage(from, { text: menuText }, { quoted: msg });
}
