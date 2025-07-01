import {
    makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion
} from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
import qrcode from "qrcode-terminal";
import pino from "pino";
import chalk from "chalk";
import figlet from "figlet";
import moment from "moment";
import messageHandler from "./handlers/messageHandler.js";

// ========================
// 🎨 Custom Logger (Filter log tertentu)
// ========================
const customLogger = pino({
    level: 'info',
    transport: {
        target: 'pino-pretty',
        options: {
            ignore: 'pid,hostname',
            colorize: true
        }
    },
    hooks: {
        logMethod(args, method) {
            const logStr = args.join(" ");
            // ⛔ Filter log yang ingin dihindari
            if (logStr.includes("Closing open session in favor of incoming prekey bundle")) return;
            method.apply(this, args);
        }
    }
});

// ========================
// ⏳ Start
// ========================
console.clear();
console.log(chalk.cyan(figlet.textSync("MR.A BOT", { horizontalLayout: "default" })));
console.log(chalk.green(`⏰ ${moment().format("LLLL")}`));
console.log(chalk.yellow("🔄 Memulai bot..."));

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState("./baileys_auth");
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        logger: customLogger, // ✅ Pakai logger yang sudah difilter
        printQRInTerminal: false,
        auth: state
    });

    // Simpan kredensial saat diperbarui
    sock.ev.on("creds.update", saveCreds);

    // 🔌 Handler koneksi
    sock.ev.on("connection.update", (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            console.log(chalk.blue("📱 Scan QR berikut untuk login:"));
            qrcode.generate(qr, { small: true });
        }

        if (connection === "close") {
            const shouldReconnect = (lastDisconnect?.error instanceof Boom)
                && lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut;
            console.log(chalk.red("❌ Koneksi terputus."), "Reconnect:", shouldReconnect);
            if (shouldReconnect) startBot();
        }

        if (connection === "open") {
            console.log(chalk.green("✅ Bot berhasil terhubung!"));
        }
    });

    // 📥 Pesan masuk
    sock.ev.on("messages.upsert", async (m) => {
        try {
            await messageHandler(m, sock);
        } catch (err) {
            console.error("❌ Error di handler:", err);
        }
    });
}

startBot();
