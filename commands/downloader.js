import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import util from 'util'
import { exec } from 'child_process'

const execPromise = util.promisify(exec)

function formatDuration(sec) {
    if (!sec) return '-'
    const m = Math.floor(sec / 60)
    const s = sec % 60
    return `${m}m ${s}s`
}

// Set untuk menyimpan status pengunduhan setiap pengguna
const downloadingUsers = new Set();

export async function downloaderCommand({ sock, msg, from, text }) {
    const url = text.trim().split(' ')[1];
    if (!url) {
        return sock.sendMessage(from, {
            text: `╭──📥 DOWNLOADER ──⬣
│❗ Masukkan URL yang valid.
│📌 Contoh: *.dl https://vt.tiktok.com/...*
╰⬣`
        });
    }

    if (downloadingUsers.has(from)) {
        return sock.sendMessage(from, {
            text: `╭──📥 DOWNLOADER ──⬣
│🚫 Anda sedang mengunduh media.
│⏳ Harap tunggu hingga selesai.
╰⬣`
        });
    }

    downloadingUsers.add(from);

    await sock.sendMessage(from, {
        text: `╭──📥 DOWNLOADER ──⬣
│🌐 URL        : ${url}
│📤 Status     : Sedang mengunduh...
│⏳ Proses     : Mohon tunggu beberapa saat
╰⬣`
    }, { quoted: msg });

    const pythonScriptPath = path.resolve('./moduls/downloader.py');

    const child = spawn('cmd.exe', ['/c', 'python', pythonScriptPath, url], {
        windowsHide: true
    });

    let stdout = '';
    let stderr = '';
    child.stdout.on('data', chunk => stdout += chunk.toString());
    child.stderr.on('data', chunk => stderr += chunk.toString());

    child.on('close', async (code) => {
        downloadingUsers.delete(from);

        if (code !== 0 || !stdout.trim()) {
            console.error('[Python ERROR]', stderr);
            return sock.sendMessage(from, {
                text: `╭──❌ DOWNLOAD GAGAL ──⬣
│😓 Maaf, media gagal diunduh.
│🛠 Error     : ${stderr || 'Tidak diketahui'}
│💡 Coba lagi nanti atau cek link.
╰⬣`
            });
        }

        const lines = stdout.trim().split('\n').map(line => line.trim());
        const filePath = lines.find(line =>
            (line.endsWith('.mp4') || line.endsWith('.jpg') || line.endsWith('.jpeg') || line.endsWith('.png')) &&
            line.includes(path.resolve('./videos'))
        );

        if (!filePath || !fs.existsSync(filePath)) {
            return sock.sendMessage(from, {
                text: `╭──❌ DOWNLOAD GAGAL ──⬣
│📁 File tidak ditemukan.
│🔍 Output : ${stdout || 'Kosong'}
╰⬣`
            });
        }

        const infoLine = lines.find(l => l.startsWith('::INFO::'));
        const fileName = path.basename(filePath);

        let fileBuffer;
        try {
            fileBuffer = fs.readFileSync(filePath);
        } catch (e) {
            return sock.sendMessage(from, {
                text: `╭──❌ FILE ERROR ──⬣
│📁 Tidak bisa membaca file.
│🛠 Detail: ${e.message}
╰⬣`
            });
        }

        let caption = `╭──✅ DOWNLOAD BERHASIL ──⬣`;
        if (infoLine) {
            try {
                const info = JSON.parse(infoLine.replace('::INFO::', ''));
                caption += `
│🎞️ Judul    : ${info.title}
│📤 Oleh     : ${info.uploader || '-'}
│👁️ Views    : ${info.view_count || 0}
╰⬣`;
            } catch (e) {
                caption += `
│📁 File     : ${fileName}
╰⬣`;
            }
        } else {
            caption += `
│📁 File     : ${fileName}
╰⬣`;
        }

        const ext = path.extname(filePath).toLowerCase();
        const mediaType = ext === '.mp4' ? 'video' : 'image';

        await sock.sendMessage(from, {
            [mediaType]: fileBuffer,
            caption,
            mimetype: mediaType === 'video' ? 'video/mp4' : 'image/jpeg'
        }, { quoted: msg });

        fs.unlink(filePath, err => {
            if (err) console.warn('Gagal hapus file:', err);
        });
    });
}


export async function play(m, args, conn) {
    if (!Array.isArray(args)) args = []
    const query = args.join(" ")
    if (!query) return conn.reply(m.chat, "❌ Masukkan judul lagu.\nContoh: !play dj slow", m)
    if (!args[0]) {
        return sock.sendMessage(from, {
            text: `╭──🎧 *PLAY LAGU* ──⬣
│ Format: *!play <judul lagu>*
│ Contoh: !play aku bukan jodohnya
╰⬣`
        }, { quoted: msg })
    }
    await sock.sendMessage(from, {
        text: `🔍 Mencari lagu *${query}*...`,
    }, { quoted: msg })

    try {
        const { stdout, stderr } = await execPromise(`python3 ./moduls/downloader_lagu.py "${query}"`)
        if (stderr) console.error('STDERR:', stderr)

        const mp3Match = stdout.match(/::MP3::(.+)/)
        const infoMatch = stdout.match(/::INFO::({.*})/)

        if (!mp3Match) {
            return sock.sendMessage(from, {
                text: `❌ Tidak dapat menemukan atau mengunduh lagu.`,
            }, { quoted: msg })
        }

        const mp3Path = mp3Match[1].trim()
        let info = {}
        if (infoMatch) {
            info = JSON.parse(infoMatch[1])
        }

        // Format info lagu
        const title = info.title || '-'
        const channel = info.uploader || '-'
        const duration = formatDuration(info.duration)

        // Kirim info lagu
        await sock.sendMessage(from, {
            text:
                `╭──🎵 *LAGU DITEMUKAN* ──⬣
│ Judul   : *${title}*
│ Channel : ${channel}
│ Durasi  : ${duration}
╰⬣`
        }, { quoted: msg })

        // Kirim audio MP3
        await sock.sendMessage(from, {
            audio: { url: mp3Path },
            mimetype: 'audio/mpeg',
            ptt: false
        }, { quoted: msg })

    } catch (e) {
        console.error(e)
        await sock.sendMessage(from, {
            text: `⚠️ Gagal memproses permintaan.`,
        }, { quoted: msg })
    }
}
