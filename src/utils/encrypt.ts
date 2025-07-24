import crypto from "crypto";

const ALGORITHM = "aes-256-cbc";
// Use a 32-byte key (256 bits) from environment (never hardcoded)
const SECRET_KEY = Buffer.from(process.env.SECRET_KEY!, "hex"); // 64-char hex string
const IV_LENGTH = 16;

// Encrypt function
export function encryptSecret(secret: string) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, SECRET_KEY, iv);
  let encrypted = cipher.update(secret, "utf8", "hex");
  encrypted += cipher.final("hex");
  // Return IV with ciphertext, separated by :
  return iv.toString("hex") + ":" + encrypted;
}

// Decrypt function, as previously suggested
export function decryptSecret(encryptedString: string) {
  const [ivHex, encrypted] = encryptedString.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const decipher = crypto.createDecipheriv(ALGORITHM, SECRET_KEY, iv);
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}
