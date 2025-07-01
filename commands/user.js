import { getAllUserData, setAllUserData } from "../lib/userDB.js";
import fs from "fs";

export const userCommands = async (sock, msg, from, sender, cmd, args) => {
    const userDB = getAllUserData();
    const userData = userDB[sender];

    // 📌 Command !daftar
    if (cmd === "daftar") {
        if (userData) {
            return sock.sendMessage(from, {
                text: `
╭──❗ *SUDAH TERDAFTAR* ──⬣
│🚫 Kamu sudah memiliki akun kak!
│📎 Gunakan *!profil* untuk melihat data.
╰⬣
            `.trim()
            }, { quoted: msg });
        }

        const [name, umur] = args.split("|").map(item => item.trim());

        if (!name || !umur || isNaN(umur)) {
            return sock.sendMessage(from, {
                text: `
╭──⚠️ *FORMAT SALAH* ──⬣
│❌ Contoh penulisan yang benar:
│👉 *!daftar Nama | Umur*
│📌 Contoh: *!daftar Arif | 20*
╰⬣
            `.trim()
            }, { quoted: msg });
        }

        const newUser = {
            name,
            umur,
            saldo: 500000, // 🎁 Saldo awal Rp 500.000
            pasangan: "",
            tanggalJadian: "",
            xp: 0,
        };

        userDB[sender] = newUser;
        setAllUserData(userDB);

        return sock.sendMessage(from, {
            text: `
╭──✅ *PENDAFTARAN BERHASIL* ─⬣
│🎉 Selamat datang *${name}*!
│📝 Akun kamu sudah dibuat.
│💰 Bonus saldo awal: *Rp 500.000*
│🔍 Gunakan *!profil* untuk melihat data.
╰⬣
        `.trim()
        }, { quoted: msg });
    }

    // 📌 Command !profil
    if (cmd === "profil") {
        let target = sender; // default: diri sendiri

        // Cek apakah pakai reply
        const contextInfo = msg.message?.extendedTextMessage?.contextInfo;
        if (contextInfo?.participant) {
            target = contextInfo.participant.split('@')[0];
        }

        // Cek apakah pakai tag @user
        const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
        if (mentioned && mentioned.length > 0) {
            target = mentioned[0].split('@')[0];
        }

        const targetId = `${target}@s.whatsapp.net`;
        const targetData = userDB[target];

        if (!targetData) {
            return sock.sendMessage(from, {
                text: `
╭──🔒 *DATA TIDAK DITEMUKAN* ──⬣
│❗ User ini belum terdaftar.
│✍️ Gunakan *!daftar Nama | Umur*
╰⬣
            `.trim()
            }, { quoted: msg });
        }

        const { name, umur, saldo, pasangan, tanggalJadian } = targetData;

        // Ambil nama pasangan jika ada
        let namaPasangan = "Belum ada";
        if (pasangan && userDB[pasangan]) {
            namaPasangan = userDB[pasangan].name || pasangan;
        }

        // Dapatkan foto profil target
        let ppBuffer;
        try {
            const ppUrl = await sock.profilePictureUrl(targetId, "image");
            const res = await fetch(ppUrl);
            ppBuffer = Buffer.from(await res.arrayBuffer());
        } catch (e) {
            ppBuffer = fs.readFileSync("./bot/menu.jpg"); // fallback lokal
        }

        // Siapkan daftar koleksi ikan
        const koleksiIkan = targetData.koleksiIkan || {};
        const xp = targetData.xp || 0;

        const koleksiList = Object.entries(koleksiIkan).length > 0
            ? Object.entries(koleksiIkan).map(([ikan, jumlah]) => `│   • ${ikan} x${jumlah}`).join('\n')
            : '│   • Belum punya ikan';

        // Buat profil lengkap
        const profileText = `
╭──🪪 *PROFIL PENGGUNA* ──⬣
│👤 Nama        : *${name}*
│🎂 Umur         : *${umur} tahun*
│💰 Saldo         : *Rp ${saldo.toLocaleString()}*
│⭐ XP              : *${xp}*
│💘 Pasangan   : *${namaPasangan}*
│📅 Jadian        : *${tanggalJadian || 'Belum ada'}*
╰⬣
`.trim();

        // Kirim pesan ke WhatsApp
        return sock.sendMessage(from, {
            image: ppBuffer,
            caption: profileText
        }, { quoted: msg });
    }
}