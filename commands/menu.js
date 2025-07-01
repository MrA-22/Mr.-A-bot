import fs from "fs";
import { makeUniqueThumbnail } from "../moduls/unik.js";

export async function menuCommand({ sock, msg, from, senderName, mentionJid }) {
        const tanggal = new Date().toLocaleDateString('id-ID', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });
        const waktu = new Date().toLocaleTimeString('id-ID', {
                hour: '2-digit', minute: '2-digit'
        });

        const menuText = `
╭──🤖 *MR.A BOT MENU* ──⬣
│ Halo, *${senderName}*! Aku siap bantu 💖
│ 📆 Tanggal : ${tanggal}
│ ⏰ Waktu   : ${waktu}
│ Bot WhatsApp ✦ AI ✦ Tools ✦ Game ✦ Stiker
╰⬣

╭──📌 *MENU UTAMA* ──⬣
│ • allmenu – Semua fitur
│ • listmenu – Menu ringkas
│ • .owner – Kontak Dev bot
╰⬣

╭──📝 *CATATAN* ──⬣
│ • tutorial – Cara pakai bot
│ • !sewa – Lihat harga sewa
│ • freesewa – Masukkan bot gratis
╰⬣

> ✦ Gunakan *allmenu* untuk lihat semua fitur  
> © MR.A Dev – 2025
`.trim();

        const thumbPath = './bot/menu.jpg';
        let thumbnail = null;

        if (fs.existsSync(thumbPath)) {
                try {
                        thumbnail = await makeUniqueThumbnail(thumbPath);
                        console.log("✅ Thumbnail menu dibuat unik");
                } catch (err) {
                        console.error("❌ Gagal buat thumbnail unik:", err);
                }
        }

        await sock.sendMessage(from, {
                text: menuText,
                contextInfo: {
                        externalAdReply: {
                                title: "🤖 MENU UTAMA MR.A",
                                body: "Bot WhatsApp – AI ✦ Game ✦ Tools ✦ Stiker",
                                thumbnail,
                                mediaType: 1,
                                renderLargerThumbnail: true
                        },
                        mentionedJid: [mentionJid]
                }
        }, { quoted: msg });
}
// MENU LENGKAP (Command: !allmenu)
export function allMenu(mentionText) {
        return `
╭──⚙️ *MR.A SYSTEM ONLINE* ──⬣
│ 🤖 Bot WhatsApp ✦ AI ✦ Game ✦ Tools ✦ Stiker
│ Halo, ${mentionText} 👋
╰⬣

╭──📌 *MENU UTAMA* ──⬣
│ • allmenu
│ • listmenu
│ • .owner
│ • !adminmenu
╰⬣

╭──🧠 *AI & TOOLS* ──⬣
│ • .om
│ • !gam
│ • !cuaca
╰⬣

╭──🎨 *STIKER* ──⬣
│ • .stkr
│ • .strss
│ • .stmm
│ • .rbgs
│ • .q
╰⬣

╭──📥 *DOWNLOADER* ──⬣
│ • .yt
│ • .tt
│ • .ig
│ • .fb
╰⬣

╭──💘 *BUCIN ZONE* ──⬣
│ • !comblang
│ • !tembak
│ • !putus
╰⬣

╭──🎮 *GAME* ──⬣
│ • !tebaklagu
│ • !tebakgambar
│ • !rpg
│ • !mancing
│ • !slot
│ • !bom
│ • !fam100
│ • !kocok
│ • !truth
│ • !dare
│ • !apakah
│ • !kerangajaib
│ • !roast
│ • !ramal
╰⬣

╭──💰 *SALDO & PROFIL* ──⬣
│ • !daftar
│ • !profil
│ • !tf
│ • !topup
╰⬣

╭──🔧 *ADMIN TOOLS* ──⬣
│ • !invt
│ • !kick
│ • !tagall
│ • !hidetag
│ • !clg / !opg
│ • !badwordon / !badwordoff
│ • !wellon / !welloff
│ • !bot on / off
│ • !introcard on / off
│ • !event
╰⬣

╭──📄 *CATATAN* ──⬣
│ • sewa?
│ • tutorial
│ • !sewa
╰⬣

✦ Trust your ideas  
Enjoy the experience ☁️  
> © Mr.A Dev – 2025
`.trim();
}

// FUNGSI BANTU – Kotak format
function formatBoxedText(title, lines) {
        const top = `╭── ${title} ──⬣`;
        const body = lines.map(line => `│${line}`).join('\n');
        const bottom = '╰⬣';
        return `${top}\n${body}\n${bottom}`;
}

// MENU STIKER KHUSUS (Command: !menu stiker)
export async function menuStiker({ sock, msg, from }) {
        const lines = [
                '📎 .stkr',
                '   ➤ Balas/kirim gambar → jadi stiker',
                '',
                '📎 .strss <teks>',
                '   ➤ Ubah teks jadi stiker besar',
                '',
                '📎 .stmm <atas>|<bawah>',
                '   ➤ Gambar jadi stiker meme teks',
                '   ➤ Bisa pakai emoji 🐶😂🔥',
        ];

        const menuText = formatBoxedText('MENU STIKER', lines);
        await sock.sendMessage(from, { text: menuText }, { quoted: msg });
}
