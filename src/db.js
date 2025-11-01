// src/db.js
import sqlite3 from "sqlite3";
import { open } from "sqlite";

let _db = null;

export async function getDB() {
  if (_db) return _db;
  _db = await open({ filename: "./pbkdf2.db", driver: sqlite3.Database });
  await _db.exec(`
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
  return _db;
}

export async function insertUser({ user, salt_hex, iterations, prf, dkLen, hash_hex }) {
  const db = await getDB();
  await db.run(
    `INSERT INTO users (user, salt_hex, iterations, prf, dkLen, hash_hex)
     VALUES (?, ?, ?, ?, ?, ?)`,
    user, salt_hex, iterations, prf, dkLen, hash_hex
  );
}

export async function findUserByName(user) {
  const db = await getDB();
  return db.get(
    `SELECT user, salt_hex, iterations, prf, dkLen, hash_hex, created_at
     FROM users WHERE user = ?`,
    user
  );
}

export async function listUsers() {
  const db = await getDB();
  return db.all(
    `SELECT id, user, iterations, prf, dkLen, created_at
     FROM users ORDER BY id DESC`
  );
}

// NUEVA: listado completo (incluye salt y hash)
export async function listUsersFull() {
  const db = await getDB();
  return db.all(
    `SELECT id, user, salt_hex, iterations, prf, dkLen, hash_hex, created_at
     FROM users ORDER BY id DESC`
  );
}


export async function wipeUsers() {
  const db = await getDB();
  await db.run(`DELETE FROM users`);
}

