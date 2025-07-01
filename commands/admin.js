export async function adminMenuCommand({ sock, msg, from, mentionJid }) {
    const senderId = msg.key.participant || msg.key.remoteJid || "";
    const mentionText = `@${senderId.split("@")[0]}`;

    const adminMenuText = `
╭──🛡️ ADMIN MENU ──⬣
│👤 Pengguna  : ${mentionText}
│📅 Tanggal   : ${new Date().toLocaleDateString()}
╰⬣

╭─⚙️ *MANAJEMEN ADMIN* ─⬣
│• !admin @user
│• !unadmin @user
╰⬣

╭─👥 *ANGGOTA GRUP* ─⬣
│• !kick
│• !tagall
│• !hidetag
╰⬣

╭─🔧 *KONTROL GRUP* ─⬣
│• !clg | !opg
│• !badwordon / off
│• !wellon / off
│• !bot on / off
│• !introcard on / off
│• !event
╰⬣

📌 Gunakan perintah ini dengan bijak.
📍 Hanya Admin yang bisa mengakses.
© Mr.A Dev – 2025
`.trim();

    await sock.sendMessage(from, {
        text: adminMenuText,
        contextInfo: {
            mentionedJid: [mentionJid]
        }
    }, { quoted: msg });
}
