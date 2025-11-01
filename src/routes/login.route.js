import { Router } from "express";
import { findUserByName } from "../db.js";
import { pbkdf2Async, randomSalt, toHex } from "../pbkdf2.js";

const router = Router();

const fromHex = (hex) => Buffer.from(hex, "hex");

router.post("/", async (req, res) => {
  try {
    const { user, password } = req.body || {};
    if (!user || !password) return res.status(400).json({ error: "Faltan 'user' y/o 'password'." });

    const row = await findUserByName(user);

    // Camino uniforme si no existe el usuario
    const salt = row ? fromHex(row.salt_hex) : randomSalt(16);
    const iterations = row ? row.iterations : 150_000;
    const prf = row ? row.prf : "sha256";
    const dkLen = row ? row.dkLen : 32;
    const target = row ? fromHex(row.hash_hex) : Buffer.alloc(dkLen, 0);


    //Creo la key y tambien guardo el tiempo que tardo
    const { key, ms } = await pbkdf2Async(password, salt, iterations, dkLen, prf);
    const match = toHex(key) === toHex(target)

    //creo el json de respuesta
    res.json({
      ok: match,
      user,
      time_ms: ms,
      message: match ? "Login OK" : "Usuario o contraseña inválidos",
      used: {
        iterations, prf, dkLen,
        salt_hex: toHex(salt),
        computed_hash_hex: toHex(key),
        stored_hash_hex: row ? row.hash_hex : null
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error interno en /login" });
  }
});

export default router;
