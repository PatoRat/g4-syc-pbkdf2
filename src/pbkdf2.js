import crypto from "crypto";

export function pbkdf2Async(password, salt, iterations, keyLen, digest) {
  return new Promise((resolve, reject) => {
    const t0 = process.hrtime.bigint();
    crypto.pbkdf2(password, salt, iterations, keyLen, digest, (err, key) => {
      if (err) return reject(err);
      const t1 = process.hrtime.bigint();
      resolve({ key, ms: Number(t1 - t0) / 1e6 });
    });
  });
}

export const randomSalt = (bytes = 16) => crypto.randomBytes(bytes);
export const toHex = (buf) => buf.toString("hex");
