import { getAllUserData, setAllUserData } from '../lib/userDB.js';
import fs from 'fs'
import path from 'path'

// Fisher-Yates shuffle
const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

global.tebakLaguMap = global.tebakLaguMap || {};
global.leaderboardLagu = global.leaderboardLagu || {};

global.tebakGambarMap = {};

export const funCommands = async (sock, msg, from, sender, cmd, args) => {
    const mentions = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    const userDB = getAllUserData();
    const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';
    const mentionJid = msg.mentionedJid?.[0]; // jika ada tag asli
    let target = mentionJid;
    const userData = userDB[sender];

    // 🎯 !comblang
    if (cmd === "comblang") {
        if (mentions.length === 0) {
            return sock.sendMessage(from, {
                text: `
╭──💔 *FORMAT SALAH* ──⬣
│❗ Tag 1 atau 2 orang untuk dicomblangkan.
│📌 Contoh:
│👉 *!comblang @user1*
│👉 *!comblang @user1 @user2*
╰⬣
                `.trim()
            }, { quoted: msg });
        }

        const user1 = mentions[0];
        const user2 = mentions[1] || (sender + "@s.whatsapp.net");
        const username1 = user1.split('@')[0];
        const username2 = user2.split('@')[0];
        const persen = Math.floor(Math.random() * 51) + 50;

        let komentar = '';
        if (persen >= 95) komentar = '💍 Wahh! Ini sih jodoh dari langit!';
        else if (persen >= 85) komentar = '💖 Cinta sejati detected! Cepet nikah ya~';
        else if (persen >= 75) komentar = '💕 Cocok banget, semoga langgeng!';
        else if (persen >= 65) komentar = '😊 Lumayan, tinggal jujur aja nih.';
        else if (persen >= 55) komentar = '😅 Bisa dicoba... asal tahan mental.';
        else komentar = '💔 Fix friendzone, semangat ya!';

        const hasil = `
💘 *CUPID COMBLANG MODE ON* 💘

╭──💞 *Pasangan Baru* ──⬣
│👤 @${username1}
│❤️ *${persen}%*
│👤 @${username2}
╰⬣

🔮 ${komentar}
        `.trim();

        return sock.sendMessage(from, { text: hasil, mentions: [user1, user2] }, { quoted: msg });
    }

    // 🐟 !mancing
    if (cmd === "mancing") {
        const ikanList = [
            // Umum
            { nama: "🐟 Ikan Lele", xp: 5, saldo: 25000 },
            { nama: "🐠 Ikan Nila", xp: 3, saldo: 22000 },
            { nama: "🎣 Ikan Mas", xp: 4, saldo: 23000 },
            { nama: "🦐 Udang", xp: 2, saldo: 20000 },
            { nama: "🦀 Kepiting", xp: 6, saldo: 27000 },
            { nama: "🐡 Buntal", xp: 4, saldo: 21000 },
            { nama: "🐙 Gurita", xp: 5, saldo: 26000 },
            { nama: "🐚 Kerang", xp: 2, saldo: 18000 },
            { nama: "🐌 Siput Laut", xp: 1, saldo: 16000 },
            { nama: "🐋 Ikan Paus Mini", xp: 7, saldo: 30000 },

            // Barang gak berharga
            { nama: "🧱 Batu Bata", xp: 0, saldo: 0 },
            { nama: "🪵 Kayu Busuk", xp: 0, saldo: 0 },
            { nama: "🪣 Ember Bocor", xp: 0, saldo: 0 },
            { nama: "📦 Sampah Kardus", xp: 0, saldo: 0 },
            { nama: "🩲 Celana Dalam Bekas", xp: 0, saldo: 0 },

            // Langka
            { nama: "🐬 Lumba-lumba (dilepasin)", xp: 0, saldo: 0 },
            { nama: "🦑 Cumi Raksasa", xp: 10, saldo: 50000, langka: true },
            { nama: "🧜‍♀️ Putri Duyung Langka!", xp: 20, saldo: 150000, langka: true },
            { nama: "💎 Peti Harta Karun!!!", xp: 15, saldo: 250000, langka: true },
            { nama: "🪙 Koin Emas", xp: 10, saldo: 100000, langka: true },
            { nama: "🐉 Ikan Naga Laut", xp: 25, saldo: 300000, langka: true },
            { nama: "🧊 Es Batu Ajaib", xp: 5, saldo: 75000, langka: true },
            { nama: "🦈 Hiu Putih", xp: 12, saldo: 130000, langka: true },
            { nama: "🐳 Paus Legendaris", xp: 30, saldo: 500000, langka: true },
            { nama: "🌊 Gelombang Misterius", xp: 0, saldo: 0, langka: true }
        ];

        const hasil = ikanList[Math.floor(Math.random() * ikanList.length)];
        const userDB = getAllUserData();
        const userData = userDB[sender];

        if (!userData) {
            return sock.sendMessage(from, {
                text: `╭──🚫 *AKSES DITOLAK* ──⬣\n│❗ Kamu belum terdaftar\n│📌 Ketik *!daftar Nama | Umur* untuk mendaftar\n╰⬣`
            }, { quoted: msg });
        }

        userData.saldo += hasil.saldo;
        userData.xp = (userData.xp || 0) + hasil.xp;

        userDB[sender] = userData;
        setAllUserData(userDB);

        const pesan = hasil.langka
            ? `╭──🎉 *LUCKY CATCH!* ──⬣\n│🎣 Kamu mendapatkan item langka:\n│${hasil.nama}\n│+💰 Rp ${hasil.saldo.toLocaleString()} | +🎯 XP ${hasil.xp}\n╰⬣`
            : `╭──🎣 *HASIL PANCINGAN* ──⬣\n│${hasil.nama}\n│+💰 Rp ${hasil.saldo.toLocaleString()} | +🎯 XP ${hasil.xp}\n╰⬣`;

        return sock.sendMessage(from, { text: pesan }, { quoted: msg });
    }

    // 🎰 !slot
    if (cmd === "slot") {
        const userDB = getAllUserData();
        const userData = userDB[sender];

        if (!userData) {
            return sock.sendMessage(from, {
                text: `╭──🚫 *AKSES DITOLAK* ──⬣\n│❗ Kamu belum terdaftar\n│📌 Ketik *!daftar Nama | Umur* untuk mendaftar\n╰⬣`
            }, { quoted: msg });
        }

        const biayaMain = 50000;
        if (userData.saldo < biayaMain) {
            return sock.sendMessage(from, {
                text: `╭──💸 *SALDO KURANG* ──⬣\n│❌ Kamu butuh minimal Rp ${biayaMain.toLocaleString()} untuk bermain slot.\n│💰 Saldo kamu: Rp ${userData.saldo.toLocaleString()}\n╰⬣`
            }, { quoted: msg });
        }

        const items = ["🍒", "🍋", "🍇", "🍊", "7️⃣"];
        const spin = () => [0, 0, 0].map(() => items[Math.floor(Math.random() * items.length)]);
        const hasil = spin();
        const result = hasil.join(" | ");

        userData.saldo -= biayaMain;

        const hitung = {};
        hasil.forEach(icon => {
            hitung[icon] = (hitung[icon] || 0) + 1;
        });

        let hadiah = 0;
        let pesan = "";

        if (hitung["7️⃣"] === 3) {
            hadiah = 100000000;
            pesan = `💎 *SUPER JACKPOT!* 7️⃣ 7️⃣ 7️⃣\n+💰 Rp ${hadiah.toLocaleString()}`;
        } else if (Object.values(hitung).includes(3)) {
            hadiah = 500000;
            pesan = `🎉 *JACKPOT!* 3 simbol sama\n+💰 Rp ${hadiah.toLocaleString()}`;
        } else if (Object.values(hitung).includes(2)) {
            hadiah = 100000;
            pesan = `✨ *Lumayan!* 2 simbol sama\n+💰 Rp ${hadiah.toLocaleString()}`;
        } else {
            pesan = "😢 *Coba lagi,* belum hoki.";
        }

        userData.saldo += hadiah;
        userDB[sender] = userData;
        setAllUserData(userDB);

        return sock.sendMessage(from, {
            text: `╭──🎰 *MESIN SLOT* ──⬣\n│${result}\n│${pesan}\n│💰 Saldo Sekarang: Rp ${userData.saldo.toLocaleString()}\n╰⬣`
        }, { quoted: msg });
    }


    // 💣 !bom
    if (cmd === "bom") {
        const userDB = getAllUserData();
        const userData = userDB[sender];

        if (!userData) {
            return sock.sendMessage(from, {
                text: `╭──🚫 *AKSES DITOLAK* ──⬣\n│❗ Kamu belum terdaftar\n│📌 Ketik *!daftar Nama | Umur* untuk mendaftar\n╰⬣`
            }, { quoted: msg });
        }

        const hasil = Math.random();
        let pesan = "";
        let perubahanSaldo = 0;

        if (hasil < 0.4) {
            // 40% meledak → rugi
            perubahanSaldo = -15000;
            userData.saldo += perubahanSaldo;
            pesan = `💣 *BOOM!* Kamu terkena ledakan!\n💸 Saldo berkurang Rp 10.000\n💰 Sisa saldo: Rp ${userData.saldo.toLocaleString()}`;
        } else {
            // 60% aman → hadiah acak
            perubahanSaldo = Math.floor(Math.random() * 20000) + 5000; // 5rb - 25rb
            userData.saldo += perubahanSaldo;
            pesan = `🎉 *Selamat!* Bom tidak meledak.\n🎁 Kamu mendapat bonus: Rp ${perubahanSaldo.toLocaleString()}\n💰 Saldo sekarang: Rp ${userData.saldo.toLocaleString()}`;
        }

        userDB[sender] = userData;
        setAllUserData(userDB);

        return sock.sendMessage(from, {
            text: `╭──💣 *BOM!* ──⬣\n│${pesan}\n╰⬣`
        }, { quoted: msg });
    }


    // 🧠 !fam100
    if (cmd === "fam100") {
        return sock.sendMessage(from, {
            text: `╭──🧠 *FAM 100* ──⬣\n│Pertanyaan: Sebutkan sesuatu yang bisa dibuka!\n╰⬣`,
        }, { quoted: msg });
    }

    // 🎲 !kocok
    if (cmd === "kocok") {
        const userDB = getAllUserData();
        const userData = userDB[sender];

        if (!userData) {
            return sock.sendMessage(from, {
                text: `╭──🚫 *AKSES DITOLAK* ──⬣\n│❗ Kamu belum terdaftar\n│📌 Ketik *!daftar Nama | Umur* untuk mendaftar\n╰⬣`
            }, { quoted: msg });
        }

        const biayaMain = 5000;
        if (userData.saldo < biayaMain) {
            return sock.sendMessage(from, {
                text: `╭──💸 *SALDO TIDAK CUKUP* ──⬣\n│💰 Butuh saldo minimal Rp 5.000 untuk main\n│💼 Saldo kamu: Rp ${userData.saldo.toLocaleString()}\n╰⬣`
            }, { quoted: msg });
        }

        userData.saldo -= biayaMain;

        const angka = Math.floor(Math.random() * 100) + 1;
        let pesan = `│🎲 Kamu dapat angka: *${angka}*\n│💸 Biaya main: Rp 5.000`;

        if (angka >= 80) {
            const hadiah = Math.floor(Math.random() * 40000) + 10000; // 10rb - 50rb
            userData.saldo += hadiah;
            pesan += `\n│🎉 Selamat! Kamu menang dan dapat bonus Rp ${hadiah.toLocaleString()}`;
        } else {
            pesan += `\n│😢 Sayang sekali, belum beruntung kali ini.`;
        }

        setAllUserData(userDB);

        return sock.sendMessage(from, {
            text: `╭──🎲 *KOCOK ANGKA* ──⬣\n│${pesan}\n│💼 Saldo sekarang: Rp ${userData.saldo.toLocaleString()}\n╰⬣`
        }, { quoted: msg });
    }

    // 🔎 !truth
    if (cmd === "truth") {
        const list = [
            "Siapa orang terakhir yang kamu chat?",
            "Pernah suka sama sahabat sendiri?",
            "Rahasia terbesar kamu?",
            "Siapa gebetan pertamamu?",
            "Pernah selingkuh?",
            "Kebohongan terbesar yang pernah kamu ucapkan?",
            "Pernah stalker seseorang? Siapa?",
            "Siapa yang paling sering kamu pikirkan?",
            "Hal paling memalukan yang pernah kamu alami?",
            "Pernah pura-pura baik padahal benci?",
            "Pernah curi-curi pandang siapa?",
            "Pernah iri dengan teman sendiri?",
            "Pernah berbohong ke orang tua?",
            "Pernah suka sama guru?",
            "Pernah bohong bilang udah move on?",
            "Siapa mantan yang paling kamu sesali?",
            "Pernah di-ghosting? Oleh siapa?",
            "Apa kebiasaan burukmu yang orang lain gak tahu?",
            "Hal paling gila yang pernah kamu lakukan karena cinta?",
            "Siapa nama mantan yang masih kamu inget?",
            "Siapa yang pernah bikin kamu nangis diam-diam?",
            "Pernah pura-pura tidur biar gak diganggu?",
            "Siapa teman yang paling kamu percaya?",
            "Siapa yang paling kamu hindari sekarang?",
            "Apa rahasia yang belum kamu ceritakan ke siapa pun?",
            "Pernah pacaran lebih dari 1 dalam waktu bersamaan?",
            "Siapa yang bikin kamu senyum sendiri akhir-akhir ini?",
            "Pernah ngaku-ngaku jomblo padahal pacaran?",
            "Pernah dikatain toxic? Oleh siapa?",
            "Pernah punya pikiran buat balikan sama mantan?",
            "Kapan terakhir kali kamu menangis?",
            "Hal paling childish yang kamu lakukan baru-baru ini?",
            "Pernah jatuh cinta sama orang yang udah punya pacar?",
            "Pernah stalking mantan?",
            "Hal paling aneh yang kamu suka?",
            "Pernah makan makanan yang jatuh ke lantai?",
            "Siapa yang paling kamu benci diam-diam?",
            "Pernah bohong tentang nilai ke orang tua?",
            "Pernah merasa gak dihargai oleh teman?",
            "Pernah jatuh cinta pada pandangan pertama?",
            "Siapa yang kamu harap sedang melihat statusmu?",
            "Pernah naksir saudara teman?",
            "Apa hal paling aneh yang pernah kamu ucapin pas ngelamun?",
            "Siapa yang bikin kamu senyum-senyum gak jelas?",
            "Pernah mimpi buruk tentang seseorang?",
            "Apa ketakutan terbesarmu dalam hidup?",
            "Pernah gak mandi 2 hari?",
            "Apa hal paling cringe yang pernah kamu lakukan di medsos?",
            "Siapa nama gebetan sekarang?",
            "Pernah curhat ke orang yang salah?",
            "Pernah suka sama pacar orang?",
            "Apa nama panggilan lucu yang kamu simpan diam-diam buat gebetan?",
            "Apa username fake yang pernah kamu pakai?",
            "Pernah stalk akun alter siapa?",
            "Apa pesan terakhir yang belum kamu balas?",
            "Siapa yang terakhir kamu kepoin di IG?",
            "Apa kebohongan yang kamu simpan sampai sekarang?",
            "Pernah posting status cuma buat satu orang?",
            "Apa hal paling kekanak-kanakan dari dirimu?",
            "Pernah menangis gara-gara film?",
            "Pernah curi-curi lihat HP orang lain?",
            "Pernah chat orang terus langsung hapus karena malu?",
            "Siapa yang kamu harap nge-chat kamu sekarang?",
            "Siapa yang paling sering muncul di mimpi kamu?",
            "Hal paling konyol yang pernah kamu katakan ke gebetan?",
            "Apa isi search history paling aneh kamu?",
            "Pernah bohong lagi tidur padahal online?",
            "Pernah chat mantan iseng aja?",
            "Siapa yang paling ganteng/cantik menurutmu di grup ini?",
            "Pernah telat bales chat sengaja?",
            "Apa fakta memalukan tentang masa kecilmu?",
            "Pernah pura-pura gak lihat orang?",
            "Pernah nyembunyiin perasaan? Ke siapa?",
            "Pernah ngaku suka hal tertentu padahal enggak?",
            "Siapa yang pengen kamu bilangin ‘aku kangen kamu’?",
            "Apa pesan yang gak pernah kamu kirimkan ke seseorang?",
            "Apa julukan paling aneh yang pernah kamu dapat?",
            "Apa screenshot terakhir yang kamu simpan?",
            "Pernah malu sama keluarga sendiri?",
            "Apa hal yang bikin kamu insecure?",
            "Apa hal yang kamu harap gak pernah kamu lakuin?",
            "Pernah dipermalukan di depan umum?",
            "Siapa yang kamu pikirin pas baca ini?",
            "Apa kebohongan yang sering kamu ulangi?",
            "Pernah malu karena status atau story sendiri?",
            "Pernah bohong demi perhatian seseorang?",
            "Apa zodiak yang paling kamu hindari?",
            "Apa kamu masih simpan foto mantan?",
            "Pernah screenshot story siapa diam-diam?",
            "Apa hal yang bikin kamu nyesel pernah cinta?",
            "Apa alasan kamu pura-pura gak tahu sesuatu?",
            "Pernah nangis pas lagi call/VC?",
            "Siapa yang kamu anggap toxic tapi gak bilang langsung?",
            "Hal apa yang bikin kamu blokir seseorang?",
            "Pernah baca chat orang lain diam-diam?",
            "Pernah suka sama teman kelas sendiri?",
            "Pernah dipanggil lebay oleh orang lain?",
            "Apa isi diary kamu (kalau punya)?",
            "Siapa orang yang bikin kamu deg-degan akhir-akhir ini?",
            "Pernah dikatain bucin? Siapa bilang?",
            "Apa hal yang paling kamu banggakan dari dirimu?",
            "Pernah bilang cinta tapi gak beneran suka?",
            "Pernah suka sama dua orang sekaligus?",
            "Pernah dicuekin dan pura-pura kuat?",
            "Siapa teman yang paling kamu rindukan sekarang?",
            "Apa yang kamu pikirin sebelum tidur biasanya?",
            "Hal paling ngeselin dari sahabat kamu?",
            "Pernah nulis nama orang di buku cuma karena suka?",
            "Siapa yang kamu pengen jadi pasanganmu tapi gak mungkin?",
            "Apa kesan pertama kamu saat lihat crush kamu?",
            "Apa hal yang bikin kamu nyesel pernah ngetik di chat?",
            "Siapa yang kamu pengen ajak balikan tapi gak berani bilang?",
            "Apa julukan rahasia yang kamu kasih ke orang yang kamu suka?",
            "Pernah pura-pura gak kenal orang yang kamu tahu banget?",
            "Hal apa yang paling kamu takutin kehilangan?",
            "Pernah nyesel nolak seseorang?",
            "Pernah naksir guru/dosen? Siapa?",
            "Apa lagu yang bikin kamu inget mantan?",
            "Pernah ngerasa kamu gak cukup baik buat seseorang?",
            "Apa yang paling kamu rindukan dari masa kecil?",
            "Apa yang kamu lakuin pas galau berat?",
            "Siapa yang kamu benci tapi gak bisa jauh darinya?",
            "Apa yang kamu harap gak pernah berubah dari dirimu?"
        ];
        return sock.sendMessage(from, { text: `╭──🗣️ *TRUTH* ──⬣\n│${list[Math.floor(Math.random() * list.length)]}\n╰⬣` }, { quoted: msg });
    }

    // 😈 !dare
    if (cmd === "dare") {
        const list = [
            "Chat mantan sekarang juga!",
            "Upload foto jelek ke story!",
            "Nyanyi lagu anak-anak sekarang juga!",
            "Pakai foto profil jelek 1 hari!",
            "Teriak ‘Aku bucin!’ di depan umum (bukti?)",
            "Telepon orang acak dan bilang 'Aku kangen kamu'",
            "Update status: Aku kangen mantan",
            "Kirim voice note bilang 'I love you' ke random teman",
            "Screenshot isi chat paling atas dan kirim ke sini!",
            "Tiru gaya seleb di story kamu!",
            "Follow balik semua orang yang pernah kamu unfollow!",
            "Like 5 postingan mantan secara berurutan!",
            "Tulis puisi spontan tentang cinta!",
            "Lagu cinta pertama yang kamu tahu, nyanyiin sekarang!",
            "Pakai emoji 😭 selama 1 jam di semua chat",
            "Bikin pantun gombal sekarang juga!",
            "Chat orang random dan bilang 'Aku suka kamu dari dulu'",
            "Kirim stiker random ke 10 orang",
            "Bilang 'Aku masih cinta kamu' ke siapa pun di grup ini",
            "Ganti nama WA jadi 'Bucin Terverifikasi'",
            "Pura-pura jadi robot di VC selama 1 menit",
            "Chat mantan dan kirim emoji ❤️ aja",
            "Gombalin 3 orang di grup ini sekarang juga",
            "Upload foto alay kamu sekarang juga",
            "Ganti status jadi: 'Aku cinta kamu wahai jodohku yang belum ketemu'",
            "Kirim voice note tertawa selama 10 detik",
            "Kirim selfie pakai ekspresi sedih!",
            "Pura-pura jadi selebgram selama 5 menit",
            "Kirim satu pantun receh ke 3 orang",
            "Nulis nama crush kamu di status!",
            "Bilang 'Aku siap disakiti' dengan suara sedih",
            "Buat status: 'Lagi kangen seseorang, tapi dia gak tahu'",
            "Buat puisi tentang admin grup",
            "Nyanyi lagu cinta pakai suara robot",
            "Voice note bilang 'Aku pengen balikan 😭'",
            "Bilang 'aku lapar' ke semua kontak favorit kamu",
            "Kirim foto masa kecil kamu",
            "Ketik ulang status teman kamu sekarang",
            "Tirukan gaya ketawa orang yang paling aneh",
            "Tulis status: 'Butuh pelukan 😢'",
            "Kirim voice note nyanyi dangdut",
            "Pakai caption absurd di foto terbaru kamu",
            "Ganti nama jadi 'Jomblo Ceria'",
            "Chat gebetan dan bilang 'Aku suka kamu dari dulu'",
            "Kirim emoji 🥵 ke seseorang random",
            "Kirim voice note acting galau",
            "Upload video nyanyi lagu sedih (minimal 5 detik)",
            "Kirim meme kocak ke 5 orang random",
            "Tulis cerpen cinta satu paragraf sekarang!",
            "Buat status tentang jomblo bahagia",
            "Tirukan suara hewan favorit kamu",
            "Chat orang random dan bilang 'Aku sayang kamu'",
            "Upload story boomerang muka kaget",
            "Tulis kata 'AKU BUJANG' dengan capslock",
            "Kirim voice note ketawa jahat",
            "Nyanyi lagu TikTok di voice note",
            "Kirim stiker yang paling cringe!",
            "Chat teman lama dan bilang ‘Aku kangen!’",
            "Upload foto makanan yang paling jelek",
            "Chat orang yang kamu hindari dan bilang ‘Halo kamu’",
            "Ganti nama jadi ‘Galau Terus’ selama 1 hari",
            "Upload selfie dengan caption ‘Aku butuh cinta’",
            "Kirim video dance 5 detik (boleh pura-pura)",
            "Bilang ‘Aku kangen’ ke seseorang yang tidak kamu sukai",
            "Update status: ‘Aku gagal move on’",
            "Chat admin dan bilang ‘Aku pengen curhat’",
            "Pakai emoji 🥴 selama 2 jam",
            "Kirim emoji random ke 10 orang",
            "Nyanyi lagu jadul di VN",
            "Kirim voice note gaya ngerap",
            "Voice note bilang ‘Aku cinta kamu, jangan tolak aku’",
            "Ganti profil jadi foto alay",
            "Post foto hitam putih dan tulis caption galau",
            "Voice note bilang ‘Kamu cantik banget, serius deh’",
            "Gombalin bot ini seolah-olah manusia",
            "Buat surat cinta ke tokoh kartun favoritmu",
            "Kirim voice note pura-pura lagi ngambek",
            "Bilang ‘Aku bukan bucin, aku setia’ di grup",
            "Ketik ulang lirik lagu cinta yang kamu tahu",
            "Kirim emoji 😍 ke 3 orang random",
            "Chat seseorang dan bilang 'Aku masih nyimpen rasa'",
            "Gombalin orang terakhir yang chat kamu",
            "Update status: ‘Aku bukan bucin, tapi butuh perhatian’",
            "Pura-pura jadi motivator selama 1 menit",
            "Ketik ‘Aku butuh pelukan’ ke mantan!",
            "Kirim voice note dengan suara bayi",
            "Upload selfie dengan ekspresi takut",
            "Bilang ‘Aku gak kuat lagi’ pakai nada sinetron",
            "Post story gambar jomblo lucu",
            "Tirukan suara hewan pilihan teman",
            "Bilang ‘Aku menyesal pernah ninggalin kamu’",
            "Buat status: ‘Aku jomblo tapi bahagia kok’",
            "Kirim voice note ala youtuber",
            "Kirim foto tersedih kamu (boleh editan)",
            "Bilang ‘Aku siap disakiti lagi’ ke gebetan",
            "Ketik nama mantan + emoji 💔",
            "Kirim voice note bilang ‘Aku masih ingat kamu loh…’",
            "Update bio jadi: ‘Sendirian itu pilihan’",
            "Kirim emoji 🤡 dan sebutkan nama orang random",
            "Nyanyi lagu anak-anak ke mantan (kalau berani)",
            "Ketik ulang puisi cinta dari Google",
            "Chat 5 orang dan bilang ‘Aku butuh teman bicara’"
        ];
        return sock.sendMessage(from, { text: `╭──🎯 *DARE* ──⬣\n│${list[Math.floor(Math.random() * list.length)]}\n╰⬣` }, { quoted: msg });
    }

    // 🐚 !kerangajaib
    if (cmd === "kerangajaib") {
        const jawab = [
            "Tentu saja", "Tidak mungkin", "Coba tanya lagi", "Mungkin iya", "Mungkin tidak",
            "Lakukan saja", "Tunda dulu", "Aku tidak yakin", "Jangan lakukan itu", "Ya",
            "Tidak", "Lebih baik kamu tidak tahu", "Bisa jadi", "Sangat mungkin", "Sudah pasti",
            "Itu ide buruk", "Diamlah dan dengarkan", "Itu takdir", "Percaya saja", "Itu rahasia",
            "Kamu sudah tahu jawabannya", "Jangan terlalu berharap", "Coba lagi nanti", "Bukan sekarang",
            "Kesempatanmu kecil", "Kesempatan besar", "Tidak saat ini", "Sekarang waktu yang tepat",
            "Hanya kamu yang bisa jawab", "Tanyakan lagi besok", "Hidupmu aneh", "Ngaco banget",
            "Kamu nanya serius?", "Kepo banget sih", "Heh, males jawab", "Ciee nanya ginian",
            "Mending tidur", "Lagi sibuk, nanti aja", "Kalau kamu yakin, lanjutkan", "Dengerin kata hati",
            "Itu keputusan sulit", "Kamu butuh liburan", "Jawabannya di langit", "Jangan bertanya soal itu",
            "Kamu tau jawabannya", "Hahaha, enggak lah", "Yakin banget?", "Apa perlu aku jawab?",
            "Sabar ya, nanti juga jelas", "Tunggu dulu...", "Ayo mikir sendiri", "Jangan tanya aku",
            "Jangan percaya ramalan", "Aku robot, bukan dukun", "Kamu keren, tapi jangan nanya gitu",
            "Apa kamu siap dengan jawabannya?", "Aneh banget pertanyaannya", "Hehehe iya",
            "Mending fokus hidup", "Jangan berharap banyak", "Semoga saja", "Nggak bisa dijawab",
            "Gak usah dipikirin", "Nanti juga lupa", "Percaya aja sama semesta", "Ada kemungkinan",
            "50:50", "Gak penting", "Itu cuma mimpi", "Jalani aja", "Pilih yang buatmu bahagia",
            "Tanyakan lagi dalam hati", "Aku gak paham maksudmu", "Apa maksudmu sih?",
            "Kamu terlalu serius", "Main dulu gih", "Cintamu tergantung sinyal", "Kalau jodoh tak ke mana",
            "Bisa jadi jodohmu", "Pasti sukses!", "Berdoa aja", "Jangan panik", "Coba lagi dengan cara lain",
            "Kamu butuh kopi", "Makan dulu gih", "Itu bukan urusanku", "Takdir yang tentukan",
            "Sudah waktunya kamu tau", "Belum waktunya", "Tenang aja", "Nikmati prosesnya",
            "Kamu akan tahu nanti", "Yang penting jangan menyerah", "Bisa aja sih", "Semoga beruntung",
            "Dunia tak seindah itu", "Tergantung kamu", "Tanya orang tua dulu", "Tanya sahabatmu",
            "Gak masuk akal", "Aneh tapi nyata", "Kamu cocok jadi detektif", "Kepo maksimal",
            "Itu pertanyaan jebakan ya?", "Nanya lagi, aku ledakin", "Kamu butuh istirahat", "Ngapain nanya gitu?",
            "Pakai logika dong", "Sudahlah", "Kamu lucu", "Kenapa gak?", "Kayaknya sih iya",
            "Kayaknya sih enggak", "Itu urusan hati", "Ngimpi aja", "Hahaha, kamu nanya!",
            "Coba tanya Google", "Lebih baik diem", "Yang penting bahagia", "Lihat ke depan",
            "Fokus ke diri sendiri", "Lanjutkan perjuangan", "Sabar adalah kunci", "Jawaban ada di kopi",
        ];

        const rawText =
            msg.message?.conversation ||
            msg.message?.extendedTextMessage?.text ||
            msg.message?.imageMessage?.caption ||
            msg.message?.videoMessage?.caption ||
            '';

        // Ambil pertanyaan dari teks setelah command
        const pertanyaan = rawText.replace(/^(!|\/)?kerangajaib\s*/i, '').trim() || 'Tidak ada pertanyaan';

        // Ambil target yang di-mention
        let target = msg.mentionedJid?.[0];
        if (!target) {
            const match = rawText.match(/@(\d{10,15})/); // manual tag
            if (match) target = `${match[1]}@s.whatsapp.net`;
        }

        // Fallback ke pengirim
        target = target || (msg.key.participant || msg.key.remoteJid);
        const tag = '@' + target.replace('@s.whatsapp.net', '');
        const hasil = jawab[Math.floor(Math.random() * jawab.length)];

        return sock.sendMessage(from, {
            text: `╭──🐚 *KERANG AJAIB* ──⬣\n│${hasil}\n╰⬣`,
            mentions: [target]
        }, { quoted: msg });
    }

    // 🔥 !roast
    if (cmd === "roast") {
        const list = [
            "Kamu itu bukti kalau manusia butuh upgrade.",
            "Kalau kamu jadi makanan, pasti basi sebelum dimakan.",
            "AI aja bingung mau jawab kamu gimana.",
            "Kecerdasanmu tuh kayak sinyal WiFi… sering putus nyambung.",
            "Kamu tuh bukan jelek, cuma belum pernah bagus.",
            "Kalau kamu jadi superhero, kekuatannya pasti nyusahin orang.",
            "Waktu bilang 'jangan menyerah', bukan berarti terus nyebelin.",
            "Mukamu cocok buat horror comedy.",
            "Kamu lucu… kayak error 404, nggak ketemu otaknya.",
            "Kalo otakmu sinyal, kamu udah lost connection lama.",
            "IQ kamu sama kayak suhu kulkas.",
            "Kamu itu bukan toxic, kamu racun murni.",
            "Kamu lebih ngilang daripada sinyal di gunung.",
            "Kamu bukan annoying lagi, kamu versi premium-nya.",
            "Kamu kayak fotokopi buram, gak jelas.",
            "Mikir dong, masa tiap hari cuma ngerepotin.",
            "Kamu ngambek? Wow, dunia gempar nggak tuh.",
            "Kalo kamu di Google, pasti dicari buat diblock.",
            "Kamu lebih repot dari update Windows.",
            "Selera humormu bikin robot nangis.",
            "Kamu kayak Windows XP: usang dan sering crash.",
            "Otakmu kayak parkiran, selalu penuh tapi kosong.",
            "Kamu tuh error 505: otak not found.",
            "Bakat kamu cuma satu: gangguin orang.",
            "Kamu nyari validasi tapi cuma nemu ilusi.",
            "Kalo kamu jadi konten, pasti diskip orang.",
            "Kamu itu bikin internet lemot cuma lewat.",
            "IQ kamu masih loading.",
            "Kalau kamu cahaya, pasti remang-remang.",
            "Kamu itu misteri, misteri kenapa masih eksis.",
            "Kamu cocoknya jadi warning label.",
            "Ngomong sama kamu bikin baterai hati habis.",
            "Logikamu kayak sinyal WiFi di hutan.",
            "Kamu pamer IQ? Mana, gak keliatan.",
            "Bisa diam nggak? Suaramu kayak notif error.",
            "Kamu itu senyap tapi nyusahin.",
            "Munculmu bikin suasana jadi off.",
            "Ngeliat kamu, semangat langsung logout.",
            "Suara kamu kayak lagu rusak di TikTok.",
            "Mukamu kayak bug di aplikasi.",
            "Semangatmu kayak baterai lowbat.",
            "Kamu unik... uniquely annoying.",
            "Kalo kamu makanan, pasti gak laku di diskon pun.",
            "Kamu bikin sarkasme jadi lelah.",
            "Kamu tuh spoiler di kehidupan orang.",
            "Nafasmu aja toxic.",
            "Kamu bukan badut, kamu sirkus lengkap.",
            "Pikiranmu buffering terus.",
            "Chat kamu pending di hati siapa pun.",
            "Mukamu GPS rusak, gak ada arah.",
            "Ketawa kamu kayak sinyal TikTok ilang.",
            "Kamu kayak bug di skrip cinta.",
            "Kehadiranmu kayak spam notifikasi.",
            "Kamu bukan teman toxic, kamu bahan penelitian.",
            "Otakmu mode pesawat terus.",
            "Kamu lucu… kalau semua orang buta humor.",
            "Kamu gagal jadi manusia versi beta.",
            "Kamu satu-satunya virus tanpa antivirus.",
            "Ngeliat kamu kayak baca hoax, gak penting.",
            "Kenapa kamu masih online sih?",
            "Kamu itu contoh kenapa mute group penting.",
            "Kalau hidup itu game, kamu itu bug-nya.",
            "Otakmu expired.",
            "Kamu bikin alien gak mau datang ke Bumi.",
            "Kamu lebih random dari CAPTCHA.",
            "Kamu kayak permen kosong: bungkus doang.",
            "Kamu pamer gaya, tapi gak punya isi.",
            "Kamu loading terus, ga pernah full.",
            "Udah ga lucu, ga guna juga.",
            "Kamu tuh hasil typo dari kehidupan.",
            "Lucu sih… tapi tragis.",
        ];
        if (!target) {
            const match = text.match(/@(\d{10,15})/); // cek manual @628xxxxxx
            if (match) {
                target = `${match[1]}@s.whatsapp.net`;
            }
        }

        if (!target) {
            return sock.sendMessage(from, {
                text: '❗ Tag seseorang untuk di-roast, contoh: *!roast @kontak*',
            }, { quoted: msg });
        }

        const pick = list[Math.floor(Math.random() * list.length)];

        return sock.sendMessage(from, {
            text: `╭──🔥 *ROAST* ──⬣\n> @${target.split('@')[0]} ${pick}\n╰⬣`,
            mentions: [target]
        }, { quoted: msg });
    }

    if (cmd === "ramal") {
        const ramalan = [
            "Hari ini akan menemukan uang receh yang bikin senyum sendiri.",
            "Hari ini bakal ketemu orang yang mirip artis favoritnya.",
            "Hari ini kemungkinan bakal ngelakuin typo pas lagi chat penting.",
            "Hari ini bakal ketawa gara-gara hal yang sepele banget.",
            "Hari ini akan merasa lapar padahal baru makan.",
            "Hari ini akan dapat notifikasi yang bikin deg-degan.",
            "Hari ini bakal kepencet like status mantan.",
            "Hari ini bisa ketemu orang baru yang nyebelin tapi seru.",
            "Hari ini akan sok sibuk di depan orang rumah.",
            "Hari ini akan menghindari pekerjaan dengan alasan ‘nanti’.",
            "Hari ini akan gak sengaja ngaca dan bilang: ‘aku cakep juga ya’.",
            "Hari ini bakal salah kirim chat ke orang yang salah.",
            "Hari ini akan menyelamatkan serangga tanpa sengaja.",
            "Hari ini akan nyesel bilang ‘5 menit lagi’ tadi pagi.",
            "Hari ini akan dapet ide random yang jenius tapi lupa nyatet.",
            "Hari ini akan merasa pengen ngemil terus.",
            "Hari ini akan dikira jutek padahal cuma diem.",
            "Hari ini akan mimpi tapi gak inget mimpinya.",
            "Hari ini akan tiba-tiba kangen seseorang.",
            "Hari ini bakal merasa ‘kok cepat banget udah malam lagi’.",
            "Hari ini kemungkinan bakal kepo story orang diam-diam.",
            "Hari ini akan kena ‘mental damage’ dari scroll TikTok.",
            "Hari ini akan merasa ngantuk di saat gak bisa tidur.",
            "Hari ini bakal merasa semua orang lebih produktif.",
            "Hari ini akan pura-pura paham padahal nggak ngerti.",
            "Hari ini kemungkinan besar bakal ketemu makanan enak.",
            "Hari ini bakal teringat sesuatu yang memalukan dari masa lalu.",
            "Hari ini bakal buka kulkas berkali-kali tanpa alasan.",
            "Hari ini akan berpikir: ‘Harusnya aku dari kemarin begini.’",
            "Hari ini akan pura-pura sibuk biar gak disuruh.",
            "Hari ini akan menghindari diskusi yang bikin pusing.",
            "Hari ini akan dapat notif dari orang tak terduga.",
            "Hari ini bakal nemuin meme yang mewakili hidupnya.",
            "Hari ini kemungkinan besar akan me-time dan menikmatinya.",
            "Hari ini akan nostalgia tanpa sengaja.",
            "Hari ini akan denger lagu yang pas banget sama mood-nya.",
            "Hari ini akan merasa bingung padahal gak ada masalah.",
            "Hari ini akan ngetik panjang lalu hapus semuanya.",
            "Hari ini akan menemukan solusi dari masalah yang lama.",
            "Hari ini akan kesandung pikiran sendiri.",
            "Hari ini akan kepikiran ‘kenapa dulu aku...’",
            "Hari ini akan jadi pendengar yang baik buat orang lain.",
            "Hari ini akan ngerasa ‘wah, aku kuat juga ya’.",
            "Hari ini akan liat postingan yang bikin semangat lagi.",
            "Hari ini bakal ngerasa semuanya lambat, tapi ternyata banyak yang kelar.",
            "Hari ini akan bilang ‘besok aja ah’ padahal bisa sekarang.",
            "Hari ini bakal merasa awkward tapi lucu.",
            "Hari ini akan dikasih sesuatu yang gratis.",
            "Hari ini akan gagal fokus karena mikir terlalu banyak.",
            "Hari ini akan dikagetin sama sesuatu yang ternyata biasa aja.",
            "Hari ini bakal jadi tempat curhat seseorang.",
            "Hari ini akan merasa spesial meski gak ada yang bilang.",
            "Hari ini akan bingung kenapa semua orang sibuk banget.",
            "Hari ini akan ngerasa waktu cepet banget jalan.",
            "Hari ini akan menghindari drama dan itu keputusan tepat.",
            "Hari ini akan pengen tidur siang lebih lama dari biasanya.",
            "Hari ini akan ketawa pas gak boleh ketawa.",
            "Hari ini akan lupa sesuatu penting tapi inget lagi sebelum terlambat.",
            "Hari ini bakal jadi penyelamat buat orang lain, walau kecil.",
            "Hari ini akan merasa damai tanpa alasan.",
            "Hari ini akan menemukan playlist baru yang disuka.",
            "Hari ini akan merasa hidup mulai tertata.",
            "Hari ini akan kena ‘malu-maluin’ kecil tapi bisa ditertawakan.",
            "Hari ini akan punya alasan untuk tersenyum sendiri.",
            "Hari ini bakal ngantuk pas gak bisa tidur dan melek pas bisa tidur.",
            "Hari ini akan liat angka kembar dan merasa ‘ini pertanda’.",
            "Hari ini akan bilang: ‘kayaknya ini takdir’ atas hal receh.",
            "Hari ini akan merasa pengen ngomong jujur tapi ditahan.",
            "Hari ini bakal dapat mimpi random yang bikin mikir.",
            "Hari ini akan merasa lebih dewasa dari biasanya.",
            "Hari ini akan nyadar bahwa dia makin bijak.",
            "Hari ini bakal ngelamun di tengah obrolan orang lain.",
            "Hari ini akan merasa 'aku butuh liburan' tiap 5 menit.",
            "Hari ini akan ketemu hal kecil yang bikin happy banget.",
            "Hari ini akan mencoba fokus, tapi gagal gara-gara notifikasi.",
            "Hari ini akan disapa seseorang yang udah lama gak kontak.",
            "Hari ini akan merasa lebih kuat dari sebelumnya.",
            "Hari ini bakal ngerasa ‘kenapa aku gak dari dulu kayak gini’.",
            "Hari ini akan berpikir: ‘Aku ternyata bisa juga ya.’",
            "Hari ini akan jadi inspirasi orang lain tanpa sadar.",
            "Hari ini akan nemu benda yang udah lama hilang.",
            "Hari ini akan ditanya hal yang bikin baper.",
            "Hari ini bakal ngeluarin joke receh tapi semua ketawa.",
            "Hari ini akan ngerasa semua hal terjadi pas banget.",
            "Hari ini akan membuat keputusan kecil yang berdampak besar.",
            "Hari ini akan menghindari orang, dan itu keputusan yang tepat.",
            "Hari ini akan ketemu 'kode semesta' yang nyambung banget.",
            "Hari ini akan dapet semangat baru dari hal gak terduga.",
            "Hari ini bakal lupa bawa sesuatu tapi ternyata gak penting.",
            "Hari ini akan dibuat mikir keras gara-gara pertanyaan sederhana.",
            "Hari ini bakal merhatiin langit dan mikir: ‘hidup tuh lucu ya’.",
            "Hari ini akan nemu quotes yang tepat banget buat kondisinya.",
            "Hari ini akan dikasih pilihan, dan dua-duanya oke.",
            "Hari ini akan ngalamin hal kecil yang bikin hati adem.",
            "Hari ini akan merasa pengen bilang 'makasih' ke diri sendiri.",
            "Hari ini bakal dengerin lagu lama dan keinget momen spesial.",
            "Hari ini akan jadi penyebab orang lain bahagia.",
            "Hari ini bakal ngerasa: ‘gue gak harus buru-buru.’",
            "Hari ini akan merasa cukup, meskipun sederhana.",
            "Hari ini akan dapat pelajaran dari hal random.",
            "Hari ini akan sadar... hal-hal kecil ternyata berarti banget.",
            "Hari ini akan bilang: ‘ternyata aku gak sendiri.’",
            "Hari ini akan tersenyum, meski gak tahu alasannya."
        ];

        // Ambil target dari mention atau teks manual
        let target = msg.mentionedJid?.[0];
        const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';
        if (!target) {
            const match = text.match(/@(\d{10,15})/); // manual: @628xxxx
            if (match) {
                target = `${match[1]}@s.whatsapp.net`;
            }
        }

        // Fallback jika tidak ada target
        if (!target) {
            return sock.sendMessage(from, {
                text: '❗ Tag seseorang untuk diramal, contoh: *!ramal @kontak*',
            }, { quoted: msg });
        }

        const tag = '@' + target.replace('@s.whatsapp.net', '');
        const hasil = ramalan[Math.floor(Math.random() * ramalan.length)].replace(/@user/g, tag);

        return sock.sendMessage(from, {
            text: `╭──🔮 *RAMALAN* ──⬣\n> ${hasil}\n╰⬣`,
            mentions: [target]
        }, { quoted: msg });
    }
}
export const whoamiCommand = async (sock, msg, from) => {
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const isQuotedBot = quoted && (
        quoted?.conversation?.startsWith('╭──🤖 MR.A SYSTEM ONLINE') ||
        quoted?.extendedTextMessage?.text?.startsWith('╭──🤖 MR.A SYSTEM ONLINE')
    );

    if (!quoted) {
        return sock.sendMessage(from, {
            text: `╭──🤖 MR.A SYSTEM ONLINE ──⬣
│❌ Untuk memulai *!whoami*, balas pesan dari bot.
╰⬣`
        }, { quoted: msg });
    }

    if (!isQuotedBot) {
        return sock.sendMessage(from, {
            text: `╭──🤖 MR.A SYSTEM ONLINE ──⬣
│📌 Pastikan kamu *reply* pesan yang dikirim oleh bot.
╰⬣`
        }, { quoted: msg });
    }

    const questions = [
        "Aku berwarna kuning, sering dipakai di jalan, siapa aku?",
        "Aku punya sayap tapi tidak terbang, siapa aku?",
        "Aku manis dan disukai semut, siapa aku?",
        "Aku sering dipakai saat hujan, siapa aku?",
        "Aku bulat dan dipakai main kaki, siapa aku?"
    ];
    const question = questions[Math.floor(Math.random() * questions.length)];

    return sock.sendMessage(from, {
        text: `╭──🤖 MR.A SYSTEM ONLINE ──⬣
│🤔 *Siapa aku?*
│📍 ${question}
│✏️ Jawab dengan mereply pesan ini.
╰⬣`
    }, { quoted: msg });
};

export const jawabWhoamiCommand = async (sock, msg, from, sender) => {
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';

    if (!quoted) return;

    const original = quoted?.extendedTextMessage?.text || quoted?.conversation || '';
    if (!original.includes('🤔 *Siapa aku?*')) return;

    const answers = {
        "Aku berwarna kuning, sering dipakai di jalan, siapa aku?": ["rambu", "rambu lalu lintas"],
        "Aku punya sayap tapi tidak terbang, siapa aku?": ["ayam", "bebek"],
        "Aku manis dan disukai semut, siapa aku?": ["gula", "permen", "madu"],
        "Aku sering dipakai saat hujan, siapa aku?": ["payung", "jas hujan"],
        "Aku bulat dan dipakai main kaki, siapa aku?": ["bola"]
    };

    let benar = false;
    let soalDitemukan = '';

    for (const [soal, jawabans] of Object.entries(answers)) {
        if (original.includes(soal)) {
            soalDitemukan = soal;
            for (const j of jawabans) {
                if (text.toLowerCase().includes(j)) {
                    benar = true;
                    break;
                }
            }
            break;
        }
    }

    const userDB = getAllUserData();
    if (!userDB[sender]) userDB[sender] = { saldo: 0, score: 0 };

    if (benar) {
        userDB[sender].score += 1;
        userDB[sender].saldo += 50000;
        setAllUserData(userDB);

        return sock.sendMessage(from, {
            text: `╭──✅ *JAWABAN BENAR* ──⬣
│🎯 Soal: ${soalDitemukan}
│🏆 Skor: ${userDB[sender].score}
│💰 Saldo: Rp ${userDB[sender].saldo.toLocaleString()}
╰⬣`
        }, { quoted: msg });
    } else {
        return sock.sendMessage(from, {
            text: `╭──❌ *SALAH!* ──⬣
│📍 Soal: ${soalDitemukan || 'Tidak ditemukan'}
│💡 Coba lagi ya!
╰⬣`
        }, { quoted: msg });
    }
};

export const tebakLagu = async (sock, msg, from, sender, cmd, args) => {
    const isGroup = from.endsWith('@g.us');
    const participant = isGroup ? msg.key.participant : sender;
    if (!participant) return;

    const userNumber = participant.split('@')[0];
    const userDB = getAllUserData();
    const userData = userDB[userNumber];

    if ((cmd === "tebaklagu" || global.tebakLaguMap[from]) && !userData) {
        return sock.sendMessage(from, {
            text: `╭──🚫 *AKSES DITOLAK* ──⬣
│❗ Kamu belum terdaftar
│📌 Ketik *!daftar Nama | Umur* untuk mendaftar
╰⬣`
        }, { quoted: msg });
    }

    if (cmd === "tebaklagu") {
        const folder = './media/audiogm';
        const files = fs.readdirSync(folder).filter(file => file.endsWith('.mp3'));
        if (files.length < 5) {
            return sock.sendMessage(from, {
                text: `📂 Lagu kurang dari 5 di folder *${folder}*. Tambah dulu.`
            }, { quoted: msg });
        }

        global.tebakLaguMap[from] = {
            stage: 1,
            score: 0,
            correctCount: 0,
            shuffledSongs: shuffleArray(files),
            gameParticipants: {}
        };

        await sock.sendMessage(from, {
            text: `╭━〔🎵 *Tebak Lagu Dimulai!* 〕━╮
> 🎧 Total Lagu : 5
> 🎯 Tujuan     : Tebak judul lagu!
> 💰 Hadiah     : Rp200.000
> 📝 Cara Main  : Balas VN dengan judul lagu
╰━━━━━━━━━━━━━━━━━━━━╯
🎶 Mengirim lagu pertama...`
        }, { quoted: msg });

        return await sendNextLagu(sock, from, msg);
    }

    const quotedMsg = msg.message?.extendedTextMessage?.contextInfo;
    const quoted = quotedMsg?.quotedMessage;
    const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';

    if (quoted && global.tebakLaguMap[from]) {
        const game = global.tebakLaguMap[from];
        if (!quotedMsg?.stanzaId || quotedMsg?.stanzaId !== game.messageId) return;

        if (!game.gameParticipants[userNumber]) {
            game.gameParticipants[userNumber] = { score: 0, correctCount: 0 };
        }

        if (text.toLowerCase().includes(game.answer)) {
            game.gameParticipants[userNumber].score += 20;
            game.gameParticipants[userNumber].correctCount += 1;

            await sock.sendMessage(from, {
                text: `╭──✅ *JAWABAN BENAR!* ──⬣
│🎶 Lagu: ${game.answer}
│👤 @${userNumber}
│➕ Poin: +20
╰⬣`,
                mentions: [`${userNumber}@s.whatsapp.net`]
            }, { quoted: msg });

            if (game.stage >= 5) return await finishGame(sock, from, msg);
            game.stage += 1;
            return await sendNextLagu(sock, from, msg);
        } else {
            game.gameParticipants[userNumber].score -= 10;
            return sock.sendMessage(from, {
                text: `╭──❌ *SALAH!* ──⬣
│➖ Poin: -10
│📝 Skor sekarang: ${game.gameParticipants[userNumber].score}
╰⬣`
            }, { quoted: msg });
        }
    }
};

const sendNextLagu = async (sock, from, msg) => {
    const game = global.tebakLaguMap[from];
    if (!game || game.stage > 5) return;

    const folder = './media/audiogm';
    const currentFile = game.shuffledSongs[game.stage - 1];
    const filePath = path.join(folder, currentFile);

    let answer = path.parse(currentFile).name;
    answer = answer.includes(' - ') ? answer.split(' - ')[1].toLowerCase() : answer.toLowerCase();

    const instruksiMsg = await sock.sendMessage(from, {
        text: `🎵 *Sesi ${game.stage}/5*\n↪ Balas VN ini dengan judul lagu.`
    }, { quoted: msg });

    const sentMsg = await sock.sendMessage(from, {
        audio: fs.readFileSync(filePath),
        mimetype: 'audio/mp4',
        ptt: true
    }, { quoted: instruksiMsg });

    game.answer = answer;
    game.messageId = sentMsg.key.id;
    console.log(`➡️ Lagu stage ${game.stage} untuk ${from}: Jawaban = ${game.answer}`);
};

async function finishGame(sock, from, msg) {
    const game = global.tebakLaguMap[from];
    delete global.tebakLaguMap[from];

    let winner = null;
    let highest = -Infinity;

    for (let user in game.gameParticipants) {
        const p = game.gameParticipants[user];
        if (p.correctCount > 0 && p.score > highest) {
            highest = p.score;
            winner = user;
        }
    }

    if (!winner) {
        return sock.sendMessage(from, {
            text: `❌ Tidak ada yang berhasil menjawab 😭`
        }, { quoted: msg });
    }

    const userDB = getAllUserData();
    if (!userDB[winner]) userDB[winner] = { saldo: 0 };
    userDB[winner].saldo += 200000;
    setAllUserData(userDB);

    return sock.sendMessage(from, {
        text: `╭──🏆 *PERMAINAN SELESAI* ──⬣
│👑 Pemenang: @${winner}
│🎁 Hadiah: Rp200.000
│💰 Total Saldo: Rp${userDB[winner].saldo.toLocaleString()}
╰⬣`,
        mentions: [`${winner}@s.whatsapp.net`]
    }, { quoted: msg });
}

export const skipLagu = async (sock, msg, from, sender) => {
    const game = global.tebakLaguMap[from];
    if (!game) {
        return sock.sendMessage(from, {
            text: `╭──🚫 *TIDAK ADA GAME* ──⬣
│❌ Tidak ada game *Tebak Lagu* yang sedang berlangsung.
╰⬣`
        }, { quoted: msg });
    }

    await sock.sendMessage(from, {
        text: `╭──⏭ *SKIP LAGU* ──⬣
│🎵 Lagu saat ini dilewati!
│➡️ Mengirim lagu berikutnya...
╰⬣`
    }, { quoted: msg });

    game.stage += 1;
    if (game.stage > 5) {
        return await finishGame(sock, from, msg);
    }

    return await sendNextLagu(sock, from, msg);
};

export const clueLagu = async (sock, msg, from, sender) => {
    const game = global.tebakLaguMap[from];
    if (!game) {
        return sock.sendMessage(from, {
            text: `╭──🚫 *TIDAK ADA GAME* ──⬣
│❌ Tidak ada game *Tebak Lagu* yang sedang berlangsung.
╰⬣`
        }, { quoted: msg });
    }

    const original = game.answer;
    const clueChars = original.split('').map(c => (c === ' ' ? ' ' : '_'));

    // ungkapkan sekitar 50% huruf acak
    let revealCount = Math.ceil(original.replace(/ /g, '').length / 2);
    while (revealCount > 0) {
        const idx = Math.floor(Math.random() * original.length);
        if (original[idx] !== ' ' && clueChars[idx] === '_') {
            clueChars[idx] = original[idx];
            revealCount--;
        }
    }

    return sock.sendMessage(from, {
        text: `╭──💡 *CLUE LAGU* ──⬣
│🎧 Petunjuk judul lagu:
│📝 *${clueChars.join('')}*
╰⬣`
    }, { quoted: msg });
};

export const tebakGambar = async (sock, msg, from, sender, cmd, args) => {
    const isGroup = from.endsWith('@g.us');
    const participant = isGroup ? msg.key.participant : sender;
    if (!participant) return;

    const userNumber = participant.split('@')[0];
    const userDB = getAllUserData();
    const userData = userDB[userNumber];

    if ((cmd === "tebakgambar" || global.tebakGambarMap[from]) && !userData) {
        return sock.sendMessage(from, {
            text: `╭──🚫 *AKSES DITOLAK* ──⬣
│❗ Kamu belum terdaftar
│📌 Ketik *!daftar Nama | Umur* untuk mendaftar
╰⬣`
        }, { quoted: msg });
    }

    if (cmd === "tebakgambar") {
        const folder = './media/gambargm';
        const files = fs.readdirSync(folder).filter(file => /\.(png|jpg|jpeg)$/i.test(file));
        if (files.length < 5) {
            return sock.sendMessage(from, {
                text: `📂 Gambar kurang dari 5 di folder *${folder}*. Tambah dulu.`
            }, { quoted: msg });
        }

        global.tebakGambarMap[from] = {
            stage: 1,
            shuffledImages: shuffleArray(files),
            gameParticipants: {}
        };

        await sock.sendMessage(from, {
            text: `╭━〔🖼️ *Tebak Gambar Dimulai!* 〕━╮
> 📷 Total Gambar : 5
> 🎯 Tebak gambar apa itu!
> 💰 Hadiah : Rp200.000.000
> 📝 Cara Main : Balas gambar dengan jawabannya
╰━━━━━━━━━━━━━━━━━━━━╯
Mengirim gambar pertama...`
        }, { quoted: msg });

        return await sendNextGambar(sock, from, msg);
    }

    const quotedMsg = msg.message?.extendedTextMessage?.contextInfo;
    const quoted = quotedMsg?.quotedMessage;
    const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';

    if (quoted && global.tebakGambarMap[from]) {
        const game = global.tebakGambarMap[from];
        if (!quotedMsg?.stanzaId || quotedMsg?.stanzaId !== game.messageId) return;

        if (!game.gameParticipants[userNumber]) {
            game.gameParticipants[userNumber] = { score: 0, correctCount: 0 };
        }

        if (normalizeAnswer(text) === normalizeAnswer(game.answer)) {
            game.gameParticipants[userNumber].score += 20;
            game.gameParticipants[userNumber].correctCount += 1;

            await sock.sendMessage(from, {
                text: `╭──✅ *JAWABAN BENAR!* ──⬣
│🖼️ Jawaban: ${game.answer}
│👤 @${userNumber}
│➕ Poin: +20
╰⬣`,
                mentions: [`${userNumber}@s.whatsapp.net`]
            }, { quoted: msg });

            if (game.stage >= 5) return await finishGameGambar(sock, from, msg);
            game.stage += 1;
            return await sendNextGambar(sock, from, msg);
        } else {
            game.gameParticipants[userNumber].score -= 10;
            return sock.sendMessage(from, {
                text: `╭──❌ *SALAH!* ──⬣
│➖ Poin: -10
│📝 Skor sekarang: ${game.gameParticipants[userNumber].score}
╰⬣`
            }, { quoted: msg });
        }
    }
};

const sendNextGambar = async (sock, from, msg) => {
    const game = global.tebakGambarMap[from];
    if (!game || game.stage > 5) return;

    const folder = './media/gambargm';
    const currentFile = game.shuffledImages[game.stage - 1];
    const filePath = path.join(folder, currentFile);

    let answer = path.parse(currentFile).name;
    answer = answer.toLowerCase();

    const instruksiMsg = await sock.sendMessage(from, {
        text: `🖼️ *Sesi ${game.stage}/5*\n↪ Balas gambar ini dengan jawabannya.`
    }, { quoted: msg });

    const sentMsg = await sock.sendMessage(from, {
        image: fs.readFileSync(filePath),
        caption: `Tebak gambar apa ini?`
    }, { quoted: instruksiMsg });

    game.answer = answer;
    game.messageId = sentMsg.key.id;
    console.log(`➡️ Gambar stage ${game.stage} untuk ${from}: Jawaban = ${game.answer}`);
};

function normalizeAnswer(text) {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '') // hilangkan semua tanda baca DAN spasi
        .trim();
}


async function finishGameGambar(sock, from, msg) {
    const game = global.tebakGambarMap[from];
    delete global.tebakGambarMap[from];

    let winner = null;
    let highest = -Infinity;

    for (let user in game.gameParticipants) {
        const p = game.gameParticipants[user];
        if (p.correctCount > 0 && p.score > highest) {
            highest = p.score;
            winner = user;
        }
    }

    if (!winner) {
        return sock.sendMessage(from, {
            text: `❌ Tidak ada yang berhasil menjawab 😭`
        }, { quoted: msg });
    }

    const userDB = getAllUserData();
    if (!userDB[winner]) userDB[winner] = { saldo: 0 };
    userDB[winner].saldo += 200_000_000;
    setAllUserData(userDB);

    return sock.sendMessage(from, {
        text: `╭──🏆 *PERMAINAN SELESAI* ──⬣
│👑 Pemenang: @${winner}
│🎁 Hadiah: Rp200.000.000
│💰 Total Saldo: Rp${userDB[winner].saldo.toLocaleString()}
╰⬣`,
        mentions: [`${winner}@s.whatsapp.net`]
    }, { quoted: msg });
}

export const skipGambar = async (sock, msg, from, sender, cmd) => {
    if (!global.tebakGambarMap[from]) {
        return sock.sendMessage(from, {
            text: `╭──🚫 *TIDAK ADA GAME* ──⬣
│⚠️ Tidak ada game *Tebak Gambar* yang sedang berlangsung.
╰⬣`
        }, { quoted: msg });
    }

    const game = global.tebakGambarMap[from];
    game.stage += 1;

    if (game.stage > 5) {
        return await finishGameGambar(sock, from, msg);
    }

    await sock.sendMessage(from, {
        text: `╭──⏭ *LEWATI GAMBAR* ──⬣
│⏩ Soal dilewati!
│🖼️ Mengirim gambar berikutnya...
╰⬣`
    }, { quoted: msg });

    return await sendNextGambar(sock, from, msg);
};


export const clueGambar = async (sock, msg, from, sender, cmd) => {
    const game = global.tebakGambarMap[from];
    if (!game) {
        return sock.sendMessage(from, {
            text: `╭──🚫 *TIDAK ADA GAME* ──⬣
│⚠️ Tidak ada game *Tebak Gambar* yang sedang berlangsung.
╰⬣`
        }, { quoted: msg });
    }

    const original = game.answer;
    const clueChars = original.split('').map(c => (c === ' ' ? ' ' : '_'));

    // ungkapkan 50% huruf acak
    let revealCount = Math.ceil(original.replace(/ /g, '').length / 2);
    while (revealCount > 0) {
        const idx = Math.floor(Math.random() * original.length);
        if (original[idx] !== ' ' && clueChars[idx] === '_') {
            clueChars[idx] = original[idx];
            revealCount--;
        }
    }

    return sock.sendMessage(from, {
        text: `╭──💡 *CLUE GAMBAR* ──⬣
│🔍 Petunjuk: *${clueChars.join('')}*
╰⬣`
    }, { quoted: msg });
};

export const stoplg = async (sock, msg, from, sender, cmd, args) => {
    const pushName = msg.pushName || sender.split('@')[0];

    if (global.tebakLaguMap[from]) {
        delete global.tebakLaguMap[from];
        return sock.sendMessage(from, {
            text: `╭──⛔ *GAME DIHENTIKAN* ──⬣
│🎵 *Tebak Lagu* telah dihentikan oleh @${pushName}.
╰⬣`,
            mentions: [sender]
        }, { quoted: msg });
    } else {
        return sock.sendMessage(from, {
            text: `╭──🚫 *TIDAK ADA GAME* ──⬣
│⚠️ Tidak ada game *Tebak Lagu* yang sedang berjalan.
│👤 Diminta oleh: @${pushName}
╰⬣`,
            mentions: [sender]
        }, { quoted: msg });
    }
};

export const stopgm = async (sock, msg, from, sender, cmd, args) => {
    const userNumber = sender.split('@')[0];
    const pushName = msg.pushName || userNumber;

    if (global.tebakGambarMap[from]) {
        delete global.tebakGambarMap[from];
        return sock.sendMessage(from, {
            text: `╭──⛔ *GAME DIHENTIKAN* ──⬣
│🖼️ *Tebak Gambar* telah dihentikan oleh @${pushName}.
╰⬣`,
            mentions: [sender]
        }, { quoted: msg });
    } else {
        return sock.sendMessage(from, {
            text: `╭──🚫 *TIDAK ADA GAME* ──⬣
│⚠️ Tidak ada game *Tebak Gambar* yang sedang berjalan.
│👤 Diminta oleh: @${pushName}
╰⬣`,
            mentions: [sender]
        }, { quoted: msg });
    }
};

