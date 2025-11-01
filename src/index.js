import express from "express";
import crypto from "crypto";
import sqlite3 from "sqlite3";
import { open } from "sqlite";

// ---------- Util PBKDF2 ----------
function pbkdf2Async(password, salt, iterations, keyLen, digest) {
  return new Promise((resolve, reject) => {
    const t0 = process.hrtime.bigint();
    crypto.pbkdf2(password, salt, iterations, keyLen, digest, (err, key) => {
      if (err) return reject(err);
      const t1 = process.hrtime.bigint();
      resolve({ key, ms: Number(t1 - t0) / 1e6 });
    });
  });
}

function randomSalt(bytes = 16) {
  return crypto.randomBytes(bytes);
}

function toHex(buf) {
  return buf.toString("hex");
}

function fromHex(hex) {
  return Buffer.from(hex, "hex");
}

// ---------- DB ----------
async function initDB() {
  const db = await open({
    filename: "./pbkdf2.db",
    driver: sqlite3.Database,
  });
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user TEXT UNIQUE NOT NULL,
      salt_hex TEXT NOT NULL,
      iterations INTEGER NOT NULL,
      prf TEXT NOT NULL,
      dkLen INTEGER NOT NULL,
      hash_hex TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);
  return db;
}

// ---------- App ----------
const app = express();
app.use(express.json());
app.use(express.static('public')); // sirve /public como raíz estática

// Healthcheck
app.get("/", (_req, res) => {
  res.json({ ok: true, service: "pbkdf2-api" });
});

/**
 * POST /register
 * body: { user, password, iterations?, prf? (sha256|sha512), dkLen? (bytes), saltBytes? }
 */
app.post("/register", async (req, res) => {
  try {
    const {
      user,
      password,
      iterations = 150_000,
      prf = "sha256",
      dkLen = 32,
      saltBytes = 16,
    } = req.body || {};

    if (!user || !password) {
      return res.status(400).json({ error: "Faltan 'user' y/o 'password'." });
    }

    const db = await initDB();

    // salt aleatoria
    const salt = randomSalt(saltBytes);
    const { key, ms } = await pbkdf2Async(password, salt, iterations, dkLen, prf);

    // guardar
    await db.run(
      `INSERT INTO users (user, salt_hex, iterations, prf, dkLen, hash_hex)
       VALUES (?, ?, ?, ?, ?, ?)`,
      user,
      toHex(salt),
      iterations,
      prf,
      dkLen,
      toHex(key)
    );

    res.json({
      ok: true,
      user,
      iterations,
      prf,
      dkLen,
      salt_hex: toHex(salt),
      hash_hex: toHex(key),
      time_ms: ms,
      note: "Guardar estos parámetros junto con el usuario para verificar logins.",
    });
  } catch (err) {
    if (String(err).includes("UNIQUE constraint")) {
      return res.status(409).json({ error: "El usuario ya existe." });
    }
    console.error(err);
    res.status(500).json({ error: "Error interno en /register" });
  }
});

/**
 * POST /login
 * body: { user, password }
 * Busca los parámetros guardados, recalcula PBKDF2 y compara en tiempo constante.
 */
app.post("/login", async (req, res) => {
  try {
    const { user, password } = req.body || {};
    if (!user || !password) {
      return res.status(400).json({ error: "Faltan 'user' y/o 'password'." });
    }

    const db = await initDB();
    const row = await db.get(
      `SELECT salt_hex, iterations, prf, dkLen, hash_hex
       FROM users WHERE user = ?`,
      user
    );

    // Para evitar dar pistas (usuario inexistente), generamos un camino uniforme
    const salt = row ? fromHex(row.salt_hex) : randomSalt(16);
    const iterations = row ? row.iterations : 150_000;
    const prf = row ? row.prf : "sha256";
    const dkLen = row ? row.dkLen : 32;
    const target = row ? fromHex(row.hash_hex) : Buffer.alloc(dkLen, 0);

    const { key, ms } = await pbkdf2Async(password, salt, iterations, dkLen, prf);

    const match =
      key.length === target.length &&
      crypto.timingSafeEqual(key, target);

    res.json({
      ok: match,
      user,
      time_ms: ms,
      message: match ? "Login OK" : "Usuario o contraseña inválidos",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error interno en /login" });
  }
});

/**
 * POST /bench
 * body: { password?, saltBytes?, iterationsList?, prf?, dkLen? }
 * Corre múltiples derivaciones para medir tiempo.
 
app.post("/bench", async (req, res) => {
  try {
    const {
      password = "Password#Demo123",
      saltBytes = 16,
      iterationsList = [50_000, 100_000, 150_000, 200_000],
      prf = "sha256",
      dkLen = 32,
    } = req.body || {};

    const salt = randomSalt(saltBytes);
    const results = [];
    for (const it of iterationsList) {
      const { ms } = await pbkdf2Async(password, salt, it, dkLen, prf);
      results.push({
        iterations: it,
        prf,
        dkLen,
        time_ms: ms,
        ms_per_10k: (ms / it) * 10_000,
      });
    }
    res.json({ ok: true, runs: results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error interno en /bench" });
  }
});
*/

// ---------- Start ----------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ API PBKDF2 escuchando en http://localhost:${PORT}`);
});

