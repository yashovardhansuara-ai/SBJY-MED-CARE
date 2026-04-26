/**
 * Utility for AES-GCM encryption/decryption using the Web Crypto API.
 */
export class EncryptionUtility {
  private static async getKey(pin: string, salt: Uint8Array): Promise<CryptoKey> {
    const enc = new TextEncoder();
    const keyMaterial = await window.crypto.subtle.importKey(
      "raw",
      enc.encode(pin),
      { name: "PBKDF2" },
      false,
      ["deriveBits", "deriveKey"]
    );
    return window.crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: salt,
        iterations: 100000,
        hash: "SHA-256",
      },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"]
    );
  }

  static async encrypt(pin: string, data: string): Promise<string> {
    const salt = window.crypto.getRandomValues(new Uint8Array(16));
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const key = await this.getKey(pin, salt);

    const enc = new TextEncoder();
    const encodedData = enc.encode(data);

    const encryptedContent = await window.crypto.subtle.encrypt(
      { name: "AES-GCM", iv: iv },
      key,
      encodedData
    );

    const encryptedBuffer = new Uint8Array(encryptedContent);
    const combined = new Uint8Array(salt.length + iv.length + encryptedBuffer.length);
    combined.set(salt, 0);
    combined.set(iv, salt.length);
    combined.set(encryptedBuffer, salt.length + iv.length);

    return btoa(String.fromCharCode(...combined));
  }

  static async decrypt(pin: string, encryptedBase64: string): Promise<string> {
    const combinedStr = atob(encryptedBase64);
    const combined = new Uint8Array(combinedStr.length);
    for (let i = 0; i < combinedStr.length; i++) {
      combined[i] = combinedStr.charCodeAt(i);
    }

    const salt = combined.slice(0, 16);
    const iv = combined.slice(16, 28);
    const data = combined.slice(28);

    const key = await this.getKey(pin, salt);

    const decryptedContent = await window.crypto.subtle.decrypt(
      { name: "AES-GCM", iv: iv },
      key,
      data
    );

    const dec = new TextDecoder();
    return dec.decode(decryptedContent);
  }
}
