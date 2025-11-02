// FHEVM Network Configurations
export const SEPOLIA_CHAIN_ID = 11155111;
export const LOCAL_CHAIN_ID = 31337;

export const SEPOLIA_CONFIG = {
  chainId: SEPOLIA_CHAIN_ID,
  relayerUrl: "https://relayer.sepolia.zama.ai",
} as const;

export const LOCAL_CONFIG = {
  chainId: LOCAL_CHAIN_ID,
} as const;

export const SUPPORTED_CHAIN_IDS = [SEPOLIA_CHAIN_ID, LOCAL_CHAIN_ID] as const;

// v0.3.0-5: 优先使用本地备份（dev 模式下更稳定）
export const SDK_LOCAL_URL = "/relayer-sdk-js.umd.cjs";
export const SDK_CDN_URL =
  "https://cdn.zama.org/relayer-sdk-js/0.3.0-5/relayer-sdk-js.umd.cjs";

export function isSupportedChain(chainId: number): boolean {
  return SUPPORTED_CHAIN_IDS.includes(chainId as any);
}

export function getChainName(chainId: number): string {
  switch (chainId) {
    case SEPOLIA_CHAIN_ID:
      return "Sepolia";
    case LOCAL_CHAIN_ID:
      return "Localhost";
    default:
      return "Unknown";
  }
}
