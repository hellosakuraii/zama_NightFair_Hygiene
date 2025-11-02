// FHEVM Types
export interface FhevmInstance {
  getPublicKey: () => Promise<string>;
  encrypt: (value: number | bigint, type: FheType) => Promise<string>;
  decrypt: (contractAddress: string, handle: bigint | string) => Promise<bigint>;
  createEncryptedInput: (contractAddress: string, userAddress: string) => EncryptedInput;
  userDecrypt: (
    handles: Array<{ handle: any; contractAddress: string }>,
    privateKey: string,
    publicKey: string,
    signature: string,
    contractAddresses: string[],
    userAddress: string,
    startTimestamp: number,
    durationDays: number
  ) => Promise<Record<string, bigint>>;
  generateKeypair: () => { publicKey: string; privateKey: string };
  createEIP712: (
    publicKey: string,
    contractAddresses: string[],
    startTimestamp: number,
    durationDays: number
  ) => EIP712Type;
}

export interface EncryptedInput {
  add16(value: number | bigint): EncryptedInput;
  add32(value: number | bigint): EncryptedInput;
  add64(value: number | bigint): EncryptedInput;
  addAddress(address: string): EncryptedInput;
  addBytes32(value: Uint8Array): EncryptedInput;
  encrypt(): Promise<{ handles: Uint8Array[]; inputProof: Uint8Array }>;
}

export enum FheType {
  euint8 = 0,
  euint16 = 1,
  euint32 = 2,
  euint64 = 3,
  euint128 = 4,
  eaddress = 5,
  ebool = 6,
}

export interface FhevmConfig {
  chainId: number;
  publicKey?: string;
  relayerUrl?: string;
}

export type FhevmDecryptionSignatureType = {
  publicKey: string;
  privateKey: string;
  signature: string;
  startTimestamp: number; // Unix timestamp in seconds
  durationDays: number;
  userAddress: `0x${string}`;
  contractAddresses: `0x${string}`[];
  eip712: EIP712Type;
};

export type EIP712Type = {
  domain: {
    chainId: number;
    name: string;
    verifyingContract: `0x${string}`;
    version: string;
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  message: any;
  primaryType: string;
  types: {
    [key: string]: {
      name: string;
      type: string;
    }[];
  };
};

