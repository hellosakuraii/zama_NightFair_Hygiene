// FHEVM Instance Creation (参考 frontend/fhevm/internal/fhevm.ts)

import { Eip1193Provider, JsonRpcProvider } from "ethers";
import type { FhevmInstance, FhevmConfig } from "../fhevmTypes";
import { LOCAL_CHAIN_ID, SEPOLIA_CONFIG } from "./constants";
import { PublicKeyStorage } from "./PublicKeyStorage";
import { RelayerSDKLoader, isFhevmWindowType, FhevmWindowType } from "./RelayerSDKLoader";

export class FhevmAbortError extends Error {
  constructor(message = "FHEVM operation was cancelled") {
    super(message);
    this.name = "FhevmAbortError";
  }
}

type FhevmRelayerStatusType =
  | "sdk-loading"
  | "sdk-loaded"
  | "sdk-initializing"
  | "sdk-initialized"
  | "creating";

async function getChainId(providerOrUrl: Eip1193Provider | string): Promise<number> {
  if (typeof providerOrUrl === "string") {
    const provider = new JsonRpcProvider(providerOrUrl);
    return Number((await provider.getNetwork()).chainId);
  }
  const chainId = await providerOrUrl.request({ method: "eth_chainId" });
  return Number.parseInt(chainId as string, 16);
}

async function tryFetchFHEVMHardhatNodeRelayerMetadata(rpcUrl: string): Promise<
  | {
      ACLAddress: `0x${string}`;
      InputVerifierAddress: `0x${string}`;
      KMSVerifierAddress: `0x${string}`;
    }
  | undefined
> {
  const rpc = new JsonRpcProvider(rpcUrl);
  try {
    const metadata = await rpc.send("fhevm_relayer_metadata", []);
    if (!metadata || typeof metadata !== "object") {
      return undefined;
    }
    if (
      !(
        "ACLAddress" in metadata &&
        typeof metadata.ACLAddress === "string" &&
        metadata.ACLAddress.startsWith("0x")
      )
    ) {
      return undefined;
    }
    if (
      !(
        "InputVerifierAddress" in metadata &&
        typeof metadata.InputVerifierAddress === "string" &&
        metadata.InputVerifierAddress.startsWith("0x")
      )
    ) {
      return undefined;
    }
    if (
      !(
        "KMSVerifierAddress" in metadata &&
        typeof metadata.KMSVerifierAddress === "string" &&
        metadata.KMSVerifierAddress.startsWith("0x")
      )
    ) {
      return undefined;
    }
    return metadata;
  } catch {
    return undefined;
  } finally {
    rpc.destroy();
  }
}

type MockResolveResult = { isMock: true; chainId: number; rpcUrl: string };
type GenericResolveResult = { isMock: false; chainId: number; rpcUrl?: string };
type ResolveResult = MockResolveResult | GenericResolveResult;

async function resolve(
  providerOrUrl: Eip1193Provider | string,
  mockChains?: Record<number, string>
): Promise<ResolveResult> {
  const chainId = await getChainId(providerOrUrl);
  let rpcUrl = typeof providerOrUrl === "string" ? providerOrUrl : undefined;

  const _mockChains: Record<number, string> = {
    31337: "http://localhost:8545",
    ...(mockChains ?? {}),
  };

  if (Object.hasOwn(_mockChains, chainId)) {
    if (!rpcUrl) {
      rpcUrl = _mockChains[chainId];
    }
    return { isMock: true, chainId, rpcUrl };
  }

  return { isMock: false, chainId, rpcUrl };
}

const isFhevmInitialized = (): boolean => {
  if (!isFhevmWindowType(window, console.log)) {
    return false;
  }
  return (window as FhevmWindowType).relayerSDK.__initialized__ === true;
};

const fhevmLoadSDK = () => {
  const loader = new RelayerSDKLoader({ trace: console.log });
  return loader.load();
};

const fhevmInitSDK = async (options?: any) => {
  if (!isFhevmWindowType(window, console.log)) {
    throw new Error("window.relayerSDK is not available");
  }
  const result = await (window as FhevmWindowType).relayerSDK.initSDK(options);
  (window as FhevmWindowType).relayerSDK.__initialized__ = result;
  if (!result) {
    throw new Error("window.relayerSDK.initSDK failed.");
  }
  return true;
};

export async function createFhevmInstance(parameters: {
  provider: Eip1193Provider | string | { request: (args: { method: string; params?: unknown[] }) => Promise<unknown> };
  mockChains?: Record<number, string>;
  signal: AbortSignal;
  onStatusChange?: (status: FhevmRelayerStatusType) => void;
}): Promise<FhevmInstance> {
  const {
    signal,
    onStatusChange,
    provider: providerOrUrl,
    mockChains,
  } = parameters;

  const throwIfAborted = () => {
    if (signal.aborted) throw new FhevmAbortError();
  };

  const notify = (status: FhevmRelayerStatusType) => {
    if (onStatusChange) onStatusChange(status);
  };

  console.log("[createFhevmInstance] Starting...");

  try {
    const { isMock, rpcUrl, chainId } = await resolve(providerOrUrl, mockChains);
    console.log("[createFhevmInstance] Resolved:", { isMock, rpcUrl, chainId });

    if (isMock) {
      console.log("[createFhevmInstance] Mock mode detected, checking for FHEVM metadata...");
      const fhevmRelayerMetadata = await tryFetchFHEVMHardhatNodeRelayerMetadata(rpcUrl);

      if (fhevmRelayerMetadata) {
        console.log("[createFhevmInstance] FHEVM metadata found, creating mock instance");
        
        // Check abort before creating instance
        throwIfAborted();
        
        notify("creating");

        // 动态导入 Mock 模块（避免打包到生产环境）
        const fhevmMock = await import("./mock/fhevmMock");
        const mockInstance = await fhevmMock.fhevmMockCreateInstance({
          rpcUrl,
          chainId,
          metadata: fhevmRelayerMetadata,
        });

        console.log("[createFhevmInstance] Mock instance created successfully");
        return mockInstance;
      } else {
        console.log("[createFhevmInstance] No FHEVM metadata found on local node");
      }
    }

    throwIfAborted();

    console.log("[createFhevmInstance] Using Relayer mode...");

    if (!isFhevmWindowType(window, console.log)) {
      console.log("[createFhevmInstance] Loading Relayer SDK...");
      notify("sdk-loading");
      await fhevmLoadSDK();
      throwIfAborted();
      notify("sdk-loaded");
      console.log("[createFhevmInstance] Relayer SDK loaded");
    }

    if (!isFhevmInitialized()) {
      console.log("[createFhevmInstance] Initializing Relayer SDK...");
      notify("sdk-initializing");
      await fhevmInitSDK();
      throwIfAborted();
      notify("sdk-initialized");
      console.log("[createFhevmInstance] Relayer SDK initialized");
    }

    const relayerSDK = (window as unknown as FhevmWindowType).relayerSDK;

    const aclAddress = relayerSDK.SepoliaConfig.aclContractAddress;
    if (!aclAddress || typeof aclAddress !== "string") {
      throw new Error(`Invalid ACL address: ${aclAddress}`);
    }

    console.log("[createFhevmInstance] Getting public key...");
    const pub = await PublicKeyStorage.get(aclAddress);
    throwIfAborted();

    const config = {
      ...relayerSDK.SepoliaConfig,
      network: providerOrUrl,
      publicKey: pub?.publicKey,
      publicParams: pub?.publicParams,
    };

    console.log("[createFhevmInstance] Creating instance with config:", {
      aclAddress,
      hasPublicKey: !!pub?.publicKey,
    });

    notify("creating");

    const instance = await relayerSDK.createInstance(config);

    console.log("[createFhevmInstance] Instance created, saving public key...");

    // Save the key even if aborted
    await PublicKeyStorage.set(
      aclAddress,
      instance.getPublicKey(),
      instance.getPublicParams(2048)
    );

    throwIfAborted();

    console.log("[createFhevmInstance] FHEVM instance ready!");
    return instance;

  } catch (error) {
    // Don't log abort errors as errors - they're expected cleanup behavior
    if (error && typeof error === 'object' && 'name' in error && error.name === "FhevmAbortError") {
      console.log("[createFhevmInstance] Initialization cancelled");
      throw error;
    }
    
    console.error("[createFhevmInstance] Error during initialization:", error);
    throw error;
  }
}

export async function checkFhevmRelayerMetadata(provider: any): Promise<boolean> {
  if (!provider) return false;

  try {
    const metadata = await provider.request({
      method: "fhevm_relayer_metadata",
    });

    return !!metadata;
  } catch {
    return false;
  }
}
