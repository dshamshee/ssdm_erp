import crypto from "crypto";

export class GcmPgEncryption {
  private iv: string;
  private key: string;
  private isProduction: boolean;
  private md5Iv: string | null = null;

  constructor(iv: string, key: string, isProduction = false) {
    this.iv = iv;
    this.key = key;
    this.isProduction = isProduction;

    // Handle case where IV might be Terminal ID (not Base64)
    if (isProduction && !this._isValidBase64(iv)) {
      console.log("⚠️  IV is not Base64, using MD5 hash of Terminal ID as IV");
      this.md5Iv = crypto.createHash("md5").update(iv).digest("hex");
    }
  }

  private _isValidBase64(str: string): boolean {
    try {
      const buffer = Buffer.from(str, "base64");
      return Buffer.from(buffer).toString("base64") === str;
    } catch {
      return false;
    }
  }

  async encrypt(plainText: string): Promise<string> {
    if (this.isProduction) {
      return this._encryptCBC(plainText);
    } else {
      return this._encryptGCM(plainText);
    }
  }

  async decrypt(cipherText: string): Promise<string> {
    if (this.isProduction) {
      return this._decryptCBC(cipherText);
    } else {
      return this._decryptGCM(cipherText);
    }
  }

  private _encryptCBC(plainText: string): string {
    try {
      let iv: Buffer;
      let key: Buffer;

      if (this.md5Iv) {
        iv = Buffer.from(this.md5Iv, "hex");
        key = Buffer.from(this.key, "base64");
      } else {
        iv = Buffer.from(this.iv, "base64");
        key = Buffer.from(this.key, "base64");
      }

      if (iv.length !== 16) {
        throw new Error(`Invalid IV length: ${iv.length}. Must be 16 bytes.`);
      }

      if (key.length !== 32) {
        throw new Error(`Invalid Key length: ${key.length}. Must be 32 bytes.`);
      }

      const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
      cipher.setAutoPadding(true);

      let encrypted = cipher.update(plainText, "utf8", "hex");
      encrypted += cipher.final("hex");

      return encrypted.toUpperCase();
    } catch (error: any) {
      console.error("❌ Production encryption error:", error.message);
      throw error;
    }
  }

  private _decryptCBC(cipherText: string): string {
    try {
      let iv: Buffer;
      let key: Buffer;

      if (this.md5Iv) {
        iv = Buffer.from(this.md5Iv, "hex");
        key = Buffer.from(this.key, "base64");
      } else {
        iv = Buffer.from(this.iv, "base64");
        key = Buffer.from(this.key, "base64");
      }

      if (iv.length !== 16) {
        throw new Error(`Invalid IV length: ${iv.length}. Must be 16 bytes.`);
      }

      if (key.length !== 32) {
        throw new Error(`Invalid Key length: ${key.length}. Must be 32 bytes.`);
      }

      const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
      decipher.setAutoPadding(true);

      let decrypted = decipher.update(cipherText, "hex", "utf8");
      decrypted += decipher.final("utf8");

      return decrypted;
    } catch (error: any) {
      console.error("❌ Production decryption error:", error.message);
      throw error;
    }
  }

  private async _encryptGCM(plainText: string): Promise<string> {
    const combined = this.key + this.iv;
    const hash = crypto.createHash("sha256").update(combined).digest();
    const mKey = hash.toString("base64");

    const salt = crypto.randomBytes(16);
    const iv = crypto.randomBytes(12);

    const derivedKey = crypto.pbkdf2Sync(mKey, salt, Number(process.env.CRYPTO_CODE), 32, "sha512");

    const cipher = crypto.createCipheriv("aes-256-gcm", derivedKey, iv);
    const encrypted = Buffer.concat([
      cipher.update(plainText, "utf8"),
      cipher.final(),
    ]);

    const tag = cipher.getAuthTag();

    return Buffer.concat([salt, iv, encrypted, tag]).toString("base64");
  }

  private async _decryptGCM(cipherText: string): Promise<string> {
    const combined = this.key + this.iv;
    const hash = crypto.createHash("sha256").update(combined).digest();
    const mKey = hash.toString("base64");

    const data = Buffer.from(cipherText, "base64");
    const salt = data.subarray(0, 16);
    const iv = data.subarray(16, 28);
    const tag = data.subarray(data.length - 16);
    const encrypted = data.subarray(28, data.length - 16);

    const derivedKey = crypto.pbkdf2Sync(mKey, salt, Number(process.env.CRYPTO_CODE), 32, "sha512");

    const decipher = crypto.createDecipheriv("aes-256-gcm", derivedKey, iv);
    decipher.setAuthTag(tag);

    let decrypted = decipher.update(encrypted).toString("utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  }
}
