import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

// ─── 🔮 AI Chat: .om ─────────────────────────
export async function omCommand({ sock, msg, from, text }) {
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
        console.error("❌ OPENROUTER_API_KEY tidak ditemukan");
        await sock.sendMessage(from, {
            text: `
╭──🔐 *API KEY ERROR* ──⬣
│⚠️ API Key tidak tersedia.
│🛠️ Hubungi owner bot.
╰⬣
            `.trim()
        }, { quoted: msg });
        return;
    }

    const userMessage = text.replace('.om', '').trim();
    if (!userMessage) {
        await sock.sendMessage(from, {
            text: `
╭──🗣️ *GUNAKAN FORMAT* ──⬣
│❗ Kamu belum memasukkan pertanyaan.
│📌 Contoh: *.om siapa presiden RI?*
╰⬣
            `.trim()
        }, { quoted: msg });
        return;
    }

    try {
        const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
            model: 'deepseek/deepseek-chat-v3-0324:free',
            messages: [{ role: 'user', content: userMessage }],
            max_tokens: 200,
        }, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            }
        });

        const aiResponse = response.data.choices[0].message.content.trim();

        await sock.sendMessage(from, {
            text: `🧠 *AI Bot:*\n\n${aiResponse}`
        }, { quoted: msg });

    } catch (error) {
        console.error('❌ Error OpenRouter:', error);
        await sock.sendMessage(from, {
            text: `
╭──🚫 *ERROR AI* ──⬣
│⚠️ Gagal memproses pertanyaan.
│🔧 Coba lagi nanti yaa~
╰⬣
            `.trim()
        }, { quoted: msg });
    }
}

// ─── 🖼️ Gambar: !gam ─────────────────────────
export async function gambarCommand({ sock, msg, from, text }) {
    const query = text.replace('!gam', '').trim();
    if (!query) {
        return sock.sendMessage(from, {
            text: `
╭──🖼️ *FORMAT GAMBAR* ──⬣
│❗ Masukkan kata kunci pencarian.
│📌 Contoh: *!gam kucing lucu*
╰⬣
            `.trim()
        }, { quoted: msg });
    }

    try {
        const response = await axios.post('https://google.serper.dev/images', {
            q: query
        }, {
            headers: {
                'X-API-KEY': process.env.SERPER_API_KEY,
                'Content-Type': 'application/json'
            }
        });

        const result = response.data.images?.[0];
        if (!result) {
            return sock.sendMessage(from, {
                text: `
╭─❌ *GAMBAR TIDAK DITEMUKAN* ─⬣
│🔍 Tidak ada hasil untuk *${query}*
╰⬣
                `.trim()
            }, { quoted: msg });
        }

        await sock.sendMessage(from, {
            image: { url: result.imageUrl },
            caption: `📸 *Gambar:* ${query}\n🌐 Sumber: ${result.source}`
        }, { quoted: msg });

    } catch (err) {
        console.error('❌ Error Serper:', err);
        await sock.sendMessage(from, {
            text: `
╭──❌ *ERROR GAMBAR* ──⬣
│🚫 Terjadi kesalahan saat mengambil gambar.
╰⬣
            `.trim()
        }, { quoted: msg });
    }
}

// ─── 🌦️ Cuaca: !cuaca ────────────────────────
export async function cuacaCommand({ sock, msg, from, text }) {
    const query = text.replace('!cuaca', '').trim();
    if (!query) {
        return sock.sendMessage(from, {
            text: `
╭──🌦️ *FORMAT CUACA* ──⬣
│❗ Masukkan nama kota!
│📌 Contoh: *!cuaca Bandung*
╰⬣
            `.trim()
        }, { quoted: msg });
    }

    try {
        const apiKey = process.env.OPENWEATHER_API_KEY;
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(query)}&appid=${apiKey}&units=metric&lang=id`;

        const { data } = await axios.get(url);

        const lokasi = `${data.name}, ${data.sys.country}`;
        const suhu = data.main.temp;
        const deskripsi = data.weather[0].description;
        const kelembapan = data.main.humidity;
        const angin = data.wind.speed;

        const pesan = `
╭──🌤 CUACA SAAT INI ──⬣
│📍 Lokasi      : ${lokasi}
│📋 Cuaca      : ${deskripsi}
│🌡 Suhu        : ${suhu}°C
│💧 Kelembapan : ${kelembapan}%
│💨 Angin       : ${angin} m/s
╰⬣
        `.trim();

        await sock.sendMessage(from, { text: pesan }, { quoted: msg });
    } catch (err) {
        console.error(err);
        await sock.sendMessage(from, {
            text: `
╭──❌ *CUACA GAGAL* ──⬣
│🚫 Kota tidak ditemukan atau error API.
╰⬣
            `.trim()
        }, { quoted: msg });
    }
}
