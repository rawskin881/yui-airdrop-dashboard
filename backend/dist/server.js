"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const supabase_js_1 = require("@supabase/supabase-js");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
app.use((0, cors_1.default)({ origin: "*" }));
app.use(express_1.default.json());
// ===== SUPABASE CLIENT INITIALIZATION =====
const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_KEY || "";
if (!supabaseUrl || !supabaseKey) {
    console.error("\n❌ ERROR: SUPABASE_URL or SUPABASE_KEY not set in .env!");
    console.error("Please configure them to connect to your Supabase project.\n");
}
const supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
// ===== DATABASE SEEDING =====
const seedDatabase = async () => {
    try {
        // Check if demo user '1234567' exists
        const { data: demoUser } = await supabase
            .from('users')
            .select('telegram_id')
            .eq('telegram_id', '1234567')
            .maybeSingle();
        if (!demoUser) {
            console.log("🌸 Yui: Seeding Supabase database with demo user (ID: 1234567)...");
            // Insert demo user
            await supabase
                .from('users')
                .insert({ telegram_id: '1234567', name: 'Master Crypto' });
            // Check if demo airdrops exist
            const { data: currentAirdrops } = await supabase
                .from('airdrops')
                .select('id')
                .eq('user_id', '1234567');
            if (!currentAirdrops || currentAirdrops.length === 0) {
                const initialAirdrops = [
                    {
                        id: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
                        user_id: "1234567",
                        name: "Scroll Mainnet Airdrop",
                        deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                        status: "pending",
                        skor: 9,
                        notes: "Fokus transaksi bulanan & interaksi smart contract.",
                        tasks: [
                            { id: "t1", title: "Bridge ETH to Scroll", done: true },
                            { id: "t2", title: "Swap on Ambient Finance", done: false },
                            { id: "t3", title: "Provide Liquidity on Nuri", done: false }
                        ],
                        created_at: new Date().toISOString()
                    },
                    {
                        id: "b2c3d4e5-f67a-8b9c-0d1e-2f3a4b5c6d7e",
                        user_id: "1234567",
                        name: "Linea Voyage LXP",
                        deadline: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                        status: "gagal",
                        skor: 8,
                        notes: "Quest Linea Park sudah berakhir.",
                        tasks: [
                            { id: "t1", title: "Complete Proof of Humanity (PoH)", done: false },
                            { id: "t2", title: "Collect LXP from tasks", done: false }
                        ],
                        created_at: new Date().toISOString()
                    },
                    {
                        id: "c3d4e5f6-7a8b-9c0d-1e2f-3a4b5c6d7e8f",
                        user_id: "1234567",
                        name: "Berachain Artio Testnet",
                        deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                        status: "claim",
                        skor: 10,
                        notes: "Testnet gratis, claim BERA faucet tiap 8 jam.",
                        tasks: [
                            { id: "t1", title: "Drip Faucet BERA", done: true },
                            { id: "t2", title: "Swap BERA to HONEY on BEX", done: true },
                            { id: "t3", title: "Mint HONEY on Honey dApp", done: true }
                        ],
                        created_at: new Date().toISOString()
                    }
                ];
                await supabase
                    .from('airdrops')
                    .insert(initialAirdrops);
                console.log("🌸 Yui: Seeding completed successfully!");
            }
        }
    }
    catch (err) {
        console.error("Failed to seed Supabase database:", err.message);
    }
};
// Execute seeding
seedDatabase();
// ===== UTILS =====
function generateOTP(length = 8) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let otp = "";
    for (let i = 0; i < length; i++) {
        otp += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return otp;
}
function calculateSummary(airdrops) {
    const now = new Date();
    let totalAirdrops = airdrops.length;
    let completed = 0;
    let pending = 0;
    let nextDeadline = null;
    let upcomingReminders = [];
    for (const airdrop of airdrops) {
        if (airdrop.status === "completed" || airdrop.status === "done" || airdrop.status === "claim") {
            completed++;
        }
        else if (airdrop.status === "pending") {
            pending++;
        }
        const deadline = new Date(airdrop.deadline);
        const timeUntil = deadline.getTime() - now.getTime();
        const daysUntil = Math.ceil(timeUntil / (1000 * 60 * 60 * 24));
        if (airdrop.status === "pending") {
            if (!nextDeadline || deadline < new Date(nextDeadline)) {
                nextDeadline = airdrop.deadline;
            }
        }
        if (daysUntil <= 7 && daysUntil > 0 && airdrop.status === "pending") {
            upcomingReminders.push({
                name: airdrop.name || airdrop.nama,
                daysLeft: daysUntil,
                reminderStatus: daysUntil <= 1 ? "h1" : (daysUntil <= 3 ? "h3" : "h7")
            });
        }
    }
    return {
        totalAirdrops,
        completed,
        pending,
        nextDeadline,
        upcomingReminders: upcomingReminders.sort((a, b) => a.daysLeft - b.daysLeft)
    };
}
// Helper to decode Base64 JWT token
const decodeToken = (token) => {
    try {
        const payload = JSON.parse(Buffer.from(token, "base64").toString("utf-8"));
        return String(payload.telegram_id);
    }
    catch (e) {
        return null;
    }
};
// ===== MIDDLEWARE AUTH =====
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        console.log("[Auth Middleware] Missing or invalid authorization header");
        return res.status(401).json({ error: "Unauthorized - no token" });
    }
    const token = authHeader.substring(7);
    // Decode JWT to get real telegramId
    let userId = decodeToken(token);
    if (!userId) {
        // Fallback
        userId = token;
    }
    req.userId = userId;
    next();
};
// ===== DEBUG ROUTE: Log Requests =====
app.use((req, res, next) => {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.path}`);
    next();
});
// ===== ROUTES =====
// 1. POST /auth/telegram (Validation Mock)
app.post("/auth/telegram", async (req, res) => {
    try {
        const { initData } = req.body;
        console.log(`[Auth/Telegram] Authenticating WebApp initData`);
        let telegramId = "1234567";
        let name = "Master Crypto";
        if (initData && initData !== "mock") {
            try {
                const decoded = decodeURIComponent(initData);
                const params = new URLSearchParams(decoded);
                const userJson = params.get("user");
                if (userJson) {
                    const userObj = JSON.parse(userJson);
                    telegramId = String(userObj.id);
                    name = userObj.first_name || "Kak";
                }
            }
            catch (err) {
                console.warn("[Auth/Telegram] Could not parse real initData, falling back to mock user");
            }
        }
        const token = Buffer.from(JSON.stringify({
            telegram_id: telegramId,
            exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60)
        })).toString("base64");
        // Upsert user in Supabase
        const { error: dbError } = await supabase
            .from('users')
            .upsert({ telegram_id: telegramId, name: name });
        if (dbError) {
            console.error("[Auth/Telegram] DB Error upserting user:", dbError.message);
            return res.status(500).json({ error: "Database error: " + dbError.message });
        }
        return res.status(200).json({
            token,
            user: { id: telegramId, name }
        });
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
});
// Telegram Bot Webhook Update Handler
app.post("/telegram-webhook", async (req, res) => {
    try {
        const { message } = req.body;
        if (!message || !message.text || !message.chat) {
            return res.status(200).send("OK");
        }
        const chatId = String(message.chat.id);
        const text = message.text.trim();
        const firstName = message.chat.first_name || "Kak";
        const botToken = process.env.BOT_TOKEN;
        if (!botToken) {
            return res.status(200).send("Bot token not configured");
        }
        const sendBotMessage = async (textToSend) => {
            const telegramApiUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
            await fetch(telegramApiUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: textToSend,
                    parse_mode: "Markdown"
                })
            });
        };
        if (text === "/start") {
            // Upsert user in Supabase
            await supabase
                .from('users')
                .upsert({ telegram_id: chatId, name: firstName });
            await sendBotMessage(`🌸 *Halo ${firstName}!* Selamat datang di Bot *Yui Yoshioka*!\n\nYui di sini untuk membantu memantau airdrop crypto Kakak agar aman sentosa~ 💖\n\n*Perintah yang tersedia:*\n• /login - Dapatkan kode login 8-karakter cepat untuk masuk ke dashboard.\n• /start - Memulai ulang bot & menyapa Yui.`);
        }
        else if (text === "/login") {
            // Upsert user in Supabase in case they skipped /start
            await supabase
                .from('users')
                .upsert({ telegram_id: chatId, name: firstName });
            // Generate 8-character OTP
            const otpCode = generateOTP(8);
            const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
            // Save to Supabase
            await supabase
                .from('otps')
                .insert({ telegram_id: chatId, code: otpCode, expires_at: expiresAt });
            await sendBotMessage(`🌸 *Kode OTP Login Kakak:* \`${otpCode}\`\n\nMasukkan kode ini di tab *Input Kode Bot* di halaman login dashboard.\n\n_Kode ini hanya berlaku selama 10 menit ya!_`);
        }
        else {
            await sendBotMessage(`🌸 Yui kurang mengerti pesan Kakak (T_T).\nKetik /login untuk mendapatkan kode OTP login dashboard ya!`);
        }
        return res.status(200).send("OK");
    }
    catch (err) {
        console.error("[Telegram Webhook] Error:", err.message);
        return res.status(200).send("Error handled");
    }
});
// 2. POST /auth/request-otp
app.post("/auth/request-otp", async (req, res) => {
    try {
        const { telegramId } = req.body;
        if (!telegramId) {
            return res.status(400).json({ error: "Telegram ID dibutuhkan" });
        }
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 minutes TTL
        // Save to Supabase otps table
        const { error: dbError } = await supabase
            .from('otps')
            .insert({ telegram_id: String(telegramId), code: otpCode, expires_at: expiresAt });
        if (dbError) {
            console.error("[RequestOTP] DB Error inserting OTP:", dbError.message);
            return res.status(500).json({ error: "Database error: " + dbError.message });
        }
        const message = `🌸 Yui di sini! Kode OTP kamu untuk login dashboard adalah: *${otpCode}*\n\nJangan kasih tahu siapa-siapa ya! Kode ini cuma berlaku 5 menit.`;
        console.log("\n=======================================================");
        console.log(`🌸 TELEGRAM BOT SIMULATION MESSAGE TO USER [${telegramId}]:`);
        console.log(message);
        console.log("=======================================================\n");
        const botToken = process.env.BOT_TOKEN;
        if (botToken) {
            try {
                const telegramApiUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
                await fetch(telegramApiUrl, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        chat_id: telegramId,
                        text: message,
                        parse_mode: "Markdown"
                    })
                });
            }
            catch (err) {
                console.warn(`[Telegram Bot] Error sending OTP via API: ${err.message}.`);
            }
        }
        return res.status(200).json({ ok: true, message: "OTP berhasil dikirim! (Silakan cek terminal backend)" });
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
});
// 3. POST /auth/verify-otp
app.post("/auth/verify-otp", async (req, res) => {
    try {
        const { telegramId, otp } = req.body;
        // Fetch and check valid OTP from Supabase
        const { data: otpRow, error: fetchError } = await supabase
            .from('otps')
            .select('*')
            .eq('telegram_id', String(telegramId))
            .eq('code', String(otp))
            .gt('expires_at', new Date().toISOString())
            .maybeSingle();
        if (fetchError || !otpRow) {
            return res.status(401).json({ error: "OTP salah atau sudah kedaluwarsa (T_T)" });
        }
        // Delete the OTP code
        await supabase
            .from('otps')
            .delete()
            .eq('id', otpRow.id);
        // Get user details
        let { data: userRow } = await supabase
            .from('users')
            .select('*')
            .eq('telegram_id', String(telegramId))
            .maybeSingle();
        if (!userRow) {
            // Fetch real name from Telegram API
            let fetchedName = `User #${telegramId}`;
            const botToken = process.env.BOT_TOKEN;
            if (botToken) {
                try {
                    const url = `https://api.telegram.org/bot${botToken}/getChat?chat_id=${telegramId}`;
                    const res = await fetch(url);
                    if (res.ok) {
                        const data = await res.json();
                        if (data.ok && data.result) {
                            fetchedName = data.result.first_name || data.result.username || fetchedName;
                        }
                    }
                }
                catch (e) {
                    console.warn("[verify-otp] Failed to fetch chat info:", e);
                }
            }
            // Register the user in Supabase
            const { data: insertedUser, error: insertError } = await supabase
                .from('users')
                .insert({ telegram_id: String(telegramId), name: fetchedName })
                .select()
                .maybeSingle();
            if (!insertError && insertedUser) {
                userRow = insertedUser;
            }
        }
        let userName = userRow?.name || `User #${telegramId}`;
        const token = Buffer.from(JSON.stringify({
            telegram_id: String(telegramId),
            exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60)
        })).toString("base64");
        return res.status(200).json({
            token,
            user: { id: String(telegramId), name: userName }
        });
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
});
// 4. POST /auth/otp/generate
app.post("/auth/otp/generate", authenticateToken, async (req, res) => {
    try {
        const userId = req.userId;
        console.log(`[OTP/Generate] Generating OTP for user ${userId}`);
        const otp = generateOTP(8);
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes
        // Save OTP to Supabase
        const { error: dbError } = await supabase
            .from('otps')
            .insert({ telegram_id: String(userId), code: otp, expires_at: expiresAt });
        if (dbError) {
            console.error("[OTP/Generate] DB Error:", dbError.message);
            return res.status(500).json({ error: "Database error: " + dbError.message });
        }
        return res.status(200).json({
            otp,
            expiresIn: 600,
            message: "OTP generated. Bagikan ke browser untuk login."
        });
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
});
// 5. POST /auth/otp/verify
app.post("/auth/otp/verify", async (req, res) => {
    try {
        const { otp } = req.body;
        if (!otp) {
            return res.status(400).json({ error: "OTP required" });
        }
        // Find OTP
        const { data: otpRow, error: fetchError } = await supabase
            .from('otps')
            .select('*')
            .eq('code', String(otp))
            .gt('expires_at', new Date().toISOString())
            .maybeSingle();
        if (fetchError || !otpRow) {
            return res.status(401).json({ error: "Invalid or expired OTP" });
        }
        const userIdStr = String(otpRow.telegram_id);
        const token = Buffer.from(JSON.stringify({
            telegram_id: userIdStr,
            exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60),
            platform: "browser"
        })).toString("base64");
        // Fetch user details
        const { data: userRow } = await supabase
            .from('users')
            .select('name')
            .eq('telegram_id', userIdStr)
            .maybeSingle();
        // Clean up used OTP
        await supabase
            .from('otps')
            .delete()
            .eq('id', otpRow.id);
        return res.status(200).json({
            token,
            user: { id: userIdStr, name: userRow?.name || "Kak" }
        });
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
});
// 6. GET /api/airdrops
app.get("/api/airdrops", authenticateToken, async (req, res) => {
    try {
        const userId = req.userId;
        const { data: airdrops, error } = await supabase
            .from('airdrops')
            .select('*')
            .eq('user_id', String(userId))
            .order('created_at', { ascending: true });
        if (error) {
            console.error("[Airdrops/Get] DB Error:", error.message);
            return res.status(500).json({ error: error.message });
        }
        const formattedList = (airdrops || []).map(a => ({
            id: a.id,
            userId: a.user_id,
            name: a.name,
            deadline: a.deadline,
            status: a.status,
            skor: a.skor,
            notes: a.notes || '',
            tasks: a.tasks || [],
            createdAt: a.created_at,
            link: a.link || '',
            repeatType: a.repeat_type || 'once'
        }));
        return res.status(200).json(formattedList);
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
});
// 7. POST /api/airdrops
app.post("/api/airdrops", authenticateToken, async (req, res) => {
    try {
        const userId = req.userId;
        const body = req.body; // Array of airdrops
        if (!Array.isArray(body)) {
            return res.status(400).json({ error: "Invalid data format. Expected an array." });
        }
        // 1. Delete all current airdrops for the user to sync replacements
        const { error: deleteError } = await supabase
            .from('airdrops')
            .delete()
            .eq('user_id', String(userId));
        if (deleteError) {
            console.error("[Airdrops/Post] Delete Error:", deleteError.message);
            return res.status(500).json({ error: deleteError.message });
        }
        // 2. Insert new airdrops list
        if (body.length > 0) {
            const rowsToInsert = body.map((a) => ({
                id: a.id || undefined, // use database default UUID if missing
                user_id: String(userId),
                name: a.name || a.nama,
                deadline: a.deadline,
                status: a.status,
                skor: a.skor,
                notes: a.notes || '',
                tasks: a.tasks || [],
                created_at: a.createdAt || new Date().toISOString(),
                link: a.link || '',
                repeat_type: a.repeatType || 'once'
            }));
            const { error: insertError } = await supabase
                .from('airdrops')
                .insert(rowsToInsert);
            if (insertError) {
                console.error("[Airdrops/Post] Insert Error:", insertError.message);
                return res.status(500).json({ error: insertError.message });
            }
        }
        return res.status(200).json({ ok: true, message: "Airdrops saved to Supabase" });
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
});
// 8. GET /api/user
app.get("/api/user", authenticateToken, async (req, res) => {
    try {
        const userId = req.userId;
        let { data: userRow, error } = await supabase
            .from('users')
            .select('*')
            .eq('telegram_id', String(userId))
            .maybeSingle();
        if (error) {
            console.error("[User/Get] DB Error:", error.message);
            return res.status(500).json({ error: error.message });
        }
        if (!userRow) {
            // Fetch real name from Telegram API on the fly
            let fetchedName = `User #${userId}`;
            const botToken = process.env.BOT_TOKEN;
            if (botToken) {
                try {
                    const url = `https://api.telegram.org/bot${botToken}/getChat?chat_id=${userId}`;
                    const res = await fetch(url);
                    if (res.ok) {
                        const data = await res.json();
                        if (data.ok && data.result) {
                            fetchedName = data.result.first_name || data.result.username || fetchedName;
                        }
                    }
                }
                catch (e) {
                    console.warn("[User/Get] Failed to fetch chat info on the fly:", e);
                }
            }
            // Auto-register the user in Supabase
            const { data: insertedUser, error: insertError } = await supabase
                .from('users')
                .insert({ telegram_id: String(userId), name: fetchedName })
                .select()
                .maybeSingle();
            if (!insertError && insertedUser) {
                userRow = insertedUser;
            }
        }
        return res.status(200).json({
            name: userRow?.name || "Kak",
            userId,
            data: userRow
        });
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
});
// 9. GET /api/dashboard/data
app.get("/api/dashboard/data", authenticateToken, async (req, res) => {
    try {
        const userId = req.userId;
        // Fetch airdrops
        const { data: airdropsData } = await supabase
            .from('airdrops')
            .select('*')
            .eq('user_id', String(userId))
            .order('created_at', { ascending: true });
        const airdrops = (airdropsData || []).map(a => ({
            id: a.id,
            userId: a.user_id,
            name: a.name,
            deadline: a.deadline,
            status: a.status,
            skor: a.skor,
            notes: a.notes || '',
            tasks: a.tasks || [],
            createdAt: a.created_at,
            link: a.link || '',
            repeatType: a.repeat_type || 'once'
        }));
        const summary = calculateSummary(airdrops);
        // Mood logic based on pending/missed deadlines
        const now = new Date();
        let pendingCount = 0;
        let missedCount = 0;
        for (const airdrop of airdrops) {
            if (airdrop.status === "pending") {
                pendingCount++;
                const deadline = new Date(airdrop.deadline);
                if (deadline < now) {
                    missedCount++;
                }
            }
        }
        let level = 100;
        let message = "Semua airdrop aman terkendali, Kak! Yui bangga banget! Semangat terus ya! 🌸";
        if (missedCount > 0) {
            level = 10;
            message = `OI! Ada ${missedCount} airdrop yang kelewat deadline! Kakak niat kaya dari crypto nggak sih?! Buruan diberesin! 💢`;
        }
        else if (pendingCount > 6) {
            level = 35;
            message = `Kakak... airdrop-nya udah menumpuk ada ${pendingCount} pending nih! Yui khawatir nggak sempat claim semua. Jangan ditunda-tunda ya! 🥺`;
        }
        else if (pendingCount > 3) {
            level = 65;
            message = `Ada beberapa tugas pending nih. Yuk dicicil sekarang sebelum deadline-nya mepet! Yui temenin ya. 🌸`;
        }
        else {
            level = 90;
            message = `Kerja bagus, Kak! Tugas pending tinggal sedikit kok. Kakak santai aja dulu, Yui yang pantau! 💖`;
        }
        const calculatedMood = { level, message };
        return res.status(200).json({
            userId,
            mood: calculatedMood,
            summary,
            airdrops,
            timestamp: new Date().toISOString()
        });
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
});
// Start listening
const server = app.listen(PORT, () => {
    console.log(`\n=======================================================`);
    console.log(`🌸 YUI BACKEND SIMULATOR started on http://localhost:${PORT}`);
    console.log(`🚀 Supabase Database: ${supabaseUrl}`);
    console.log(`=======================================================\n`);
});
server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`\n❌ ERROR: Port ${PORT} is already in use by another process!`);
        console.error(`🌸 Yui says: "Kak, port ${PORT} sedang dipakai aplikasi lain. Coba matikan proses tersebut atau jalankan perintah berikut di PowerShell untuk menutupnya:`);
        console.error(`   Stop-Process -Id (Get-NetTCPConnection -LocalPort ${PORT}).OwningProcess -Force`);
        console.error(`   Atau Kakak bisa ganti port di file .env dengan PORT=3002 ya!"\n`);
        process.exit(1);
    }
});
