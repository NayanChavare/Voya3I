
/**
 * SDG-INSIGHT Vault Service
 * Handles military-grade AES-GCM encryption for the local-first backend.
 * Includes simulated institutional cloud synchronization.
 */

const VAULT_KEY_NAME = 'SDG_VAULT_MASTER';
const STORAGE_KEY = 'system_core.bin';

const bufferToBase64 = (buf: ArrayBuffer) => {
  return btoa(String.fromCharCode(...new Uint8Array(buf)));
};

const base64ToBuffer = (base64: string) => {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
};

async function getMasterKey(): Promise<CryptoKey> {
  let rawKey = localStorage.getItem(VAULT_KEY_NAME);
  if (!rawKey) {
    const seed = crypto.getRandomValues(new Uint8Array(32));
    rawKey = bufferToBase64(seed);
    localStorage.setItem(VAULT_KEY_NAME, rawKey);
  }

  const keyData = base64ToBuffer(rawKey);
  return await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'AES-GCM' },
    false,
    ['encrypt', 'decrypt']
  );
}

export const vault = {
  async seal(data: any): Promise<void> {
    const key = await getMasterKey();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encodedData = new TextEncoder().encode(JSON.stringify(data));

    const encryptedContent = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encodedData
    );

    const combined = new Uint8Array(iv.length + encryptedContent.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(encryptedContent), iv.length);

    localStorage.setItem(STORAGE_KEY, bufferToBase64(combined.buffer));
    
    // Simulate auto-sync to institutional cloud after every save
    console.log("Vault sealed. Auto-syncing to institutional cloud repository...");
  },

  async unseal(): Promise<any | null> {
    const sealedData = localStorage.getItem(STORAGE_KEY);
    if (!sealedData) return null;

    try {
      const key = await getMasterKey();
      const combined = new Uint8Array(base64ToBuffer(sealedData));
      
      const iv = combined.slice(0, 12);
      const data = combined.slice(12);

      const decryptedContent = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        key,
        data
      );

      return JSON.parse(new TextDecoder().decode(decryptedContent));
    } catch (e) {
      console.error("Vault corruption or decryption failure", e);
      return null;
    }
  }
};
