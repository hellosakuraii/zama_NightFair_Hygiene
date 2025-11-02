const STORAGE_KEY = "fhevm.publicKey";

export interface PublicKeyInfo {
  publicKey: string;
  publicParams: string;
}

export class PublicKeyStorage {
  static async get(aclAddress: string): Promise<PublicKeyInfo | null> {
    if (typeof window === "undefined") return null;

    const key = `${STORAGE_KEY}.${aclAddress}`;
    const stored = localStorage.getItem(key);

    if (!stored) return null;

    try {
      const parsed = JSON.parse(stored) as PublicKeyInfo;
      return parsed;
    } catch {
      return null;
    }
  }

  static async set(aclAddress: string, publicKey: string, publicParams: string): Promise<void> {
    if (typeof window === "undefined") return;

    const key = `${STORAGE_KEY}.${aclAddress}`;
    const data: PublicKeyInfo = { publicKey, publicParams };
    
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error: unknown) {
      // FHEVM public key 非常大（~5MB），可能超出 localStorage 配额（通常 5-10MB）
      // 捕获 QuotaExceededError 并忽略，每次重新从 relayer 获取
      if (error instanceof DOMException && error.name === "QuotaExceededError") {
        console.warn(
          `[PublicKeyStorage] Cannot cache public key for ${aclAddress}: localStorage quota exceeded. ` +
          `Public key will be fetched from relayer on each page load.`
        );
        return;
      }
      // 其他错误则记录但不抛出
      console.error("[PublicKeyStorage] Failed to save public key:", error);
    }
  }

  static remove(aclAddress: string): void {
    if (typeof window === "undefined") return;

    const key = `${STORAGE_KEY}.${aclAddress}`;
    localStorage.removeItem(key);
  }
}
