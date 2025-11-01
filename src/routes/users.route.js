import { Router } from "express";
import { listUsers, listUsersFull, wipeUsers } from "../db.js";

const router = Router();


/** GET /users/full (incluye salt y hash) */
router.get("/full", async (_req, res) => {
  try { res.json({ ok: true, users: await listUsersFull() }); }
  catch (e) { console.error(e); res.status(500).json({ error: "Error en /users/full" }); }
});

/** DELETE /users (borra todo) */
router.delete("/", async (_req, res) => {
  try { await wipeUsers(); res.json({ ok: true, deleted: true }); }
  catch (e) { console.error(e); res.status(500).json({ error: "Error en DELETE /users" }); }
});

export default router;
