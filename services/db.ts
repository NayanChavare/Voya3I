
import { vault } from './vault';

let cachedState: Record<string, any> | null = null;

export const db = {
  /**
   * Initializes the database by unsealing the vault.
   */
  async init(): Promise<void> {
    if (cachedState) return;
    cachedState = await vault.unseal() || {};
  },

  /**
   * Gets data from the decrypted memory cache.
   */
  get: <T>(key: string): T | null => {
    if (!cachedState) {
      console.warn("DB not initialized. Call init() first.");
      return null;
    }
    return (cachedState[key] as T) || null;
  },

  /**
   * Updates data in the cache and immediately seals it to the encrypted vault.
   */
  set: async <T>(key: string, value: T): Promise<void> => {
    if (!cachedState) cachedState = {};
    cachedState[key] = value;
    await vault.seal(cachedState);
  },

  /**
   * Removes a key and updates the vault.
   */
  remove: async (key: string): Promise<void> => {
    if (!cachedState) return;
    delete cachedState[key];
    await vault.seal(cachedState);
  },

  /**
   * Clears the entire database.
   */
  clear: async (): Promise<void> => {
    cachedState = {};
    await vault.seal(cachedState);
  }
};
