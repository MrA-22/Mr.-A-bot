import fs from 'fs';
import { makeUniqueThumbnail } from "../moduls/unik.js";
export async function ownerCommand({ sock, msg, from }) {
    const ownerText = `
╭──👑 *OWNER BOT* ──⬣
│👤 Nama       : Mr.A Dev
│📞 Kontak     : wa.me/6281234567890
│💼 Instagram  : @mr.a_dev
│🌐 YouTube    : youtube.com/@mrabot
╰⬣

✦ Hubungi hanya untuk keperluan:
• Kerja sama
• Laporan bug
• Sewa bot

> © MR.A Dev – 2025
`.trim();

    const thumbPath = './bot/owner.jpg';
    let jpegThumbnail = null;

    if (fs.existsSync(thumbPath)) {
        try {
            jpegThumbnail = await makeUniqueThumbnail(thumbPath);
            console.log("✅ Thumbnail owner dibuat unik");
        } catch (err) {
            console.error("❌ Gagal buat thumbnail unik:", err);
        }
    }

    await sock.sendMessage(from, {
        text: ownerText,
        contextInfo: {
            externalAdReply: {
                title: "👑 Mr.A Developer",
                body: "Klik untuk kontak langsung via WhatsApp",
                sourceUrl: "https://wa.me/6281344195326?t=" + Date.now(), // juga bisa picu WA refresh
                mediaType: 1,
                renderLargerThumbnail: true,
                showAdAttribution: true,
                jpegThumbnail
            }
        }
    }, { quoted: msg });
}
