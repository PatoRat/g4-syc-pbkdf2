import { Router } from "express";
import { insertUser } from "../db.js";
import { pbkdf2Async, randomSalt, toHex } from "../pbkdf2.js";


const router = Router();

router.post("/", async (req, res) => {
  try {
    const {
      user, password,
      iterations = 150_000, prf = "sha256", dkLen = 32, saltBytes = 16,
    } = req.body || {};
    if (!user || !password) return res.status(400).json({ error: "Faltan 'user' y/o 'password'." });

    //Llamo a las funciones de pbkdf2.js
    const salt = randomSalt(saltBytes);
    const { key, ms } = await pbkdf2Async(password, salt, iterations, dkLen, prf);

    //Guardo los datos en la bd
    await insertUser({
      user,
      salt_hex: toHex(salt),
      iterations,
      prf,
      dkLen,
      hash_hex: toHex(key),
    });

    res.json({
      ok: true, user, iterations, prf, dkLen,
      salt_hex: toHex(salt), hash_hex: toHex(key), time_ms: ms,
      note: "Guardar estos parámetros junto con el usuario para verificar logins.",
    });
  } catch (err) {
    if (String(err).includes("UNIQUE constraint"))
      return res.status(409).json({ error: "El usuario ya existe." });
    console.error(err);
    res.status(500).json({ error: "Error interno en /register" });
  }
});

export default router;
