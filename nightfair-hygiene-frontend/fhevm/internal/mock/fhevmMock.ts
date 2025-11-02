import { JsonRpcProvider, Contract } from "ethers";
import type { FhevmInstance } from "../../fhevmTypes";

export async function fhevmMockCreateInstance(parameters: {
  rpcUrl: string;
  chainId: number;
  metadata: {
    ACLAddress: `0x${string}`;
    InputVerifierAddress: `0x${string}`;
    KMSVerifierAddress: `0x${string}`;
  };
}): Promise<FhevmInstance> {
  if (typeof window === "undefined") {
    throw new Error("Mock FHEVM can only be used in browser environment");
  }

  try {
    console.log("[fhevmMock] Loading @fhevm/mock-utils...");
    
    // ✅ Dynamic import for @fhevm/mock-utils
    const { MockFhevmInstance } = await import("@fhevm/mock-utils");
    console.log("[fhevmMock] @fhevm/mock-utils loaded successfully");
    
    const provider = new JsonRpcProvider(parameters.rpcUrl);
    
    console.log("[fhevmMock] Creating instance with config:", {
      ACL: parameters.metadata.ACLAddress,
      InputVerifier: parameters.metadata.InputVerifierAddress,
      KMSVerifier: parameters.metadata.KMSVerifierAddress,
      chainId: parameters.chainId,
    });

    // Query InputVerifier EIP712 domain for accurate verifyingContract address
    const inputVerifierContract = new Contract(
      parameters.metadata.InputVerifierAddress,
      ["function eip712Domain() external view returns (bytes1, string, string, uint256, address, bytes32, uint256[])"],
      provider
    );
    const domain = await inputVerifierContract.eip712Domain();
    const verifyingContractAddressInputVerification = domain[4]; // index 4 is verifyingContract
    const gatewayChainId = Number(domain[3]); // index 3 is chainId

    console.log("[fhevmMock] InputVerifier EIP712 domain:", {
      verifyingContractAddressInputVerification,
      gatewayChainId,
    });

    // Create Mock FHEVM instance with v0.3.0 API (requires 4th parameter: properties)
    const instance = await MockFhevmInstance.create(
      provider,
      provider,
      {
        aclContractAddress: parameters.metadata.ACLAddress,
        chainId: parameters.chainId,
        gatewayChainId,
        inputVerifierContractAddress: parameters.metadata.InputVerifierAddress,
        kmsContractAddress: parameters.metadata.KMSVerifierAddress,
        verifyingContractAddressDecryption:
          "0x5ffdaAB0373E62E2ea2944776209aEf29E631A64",
        verifyingContractAddressInputVerification,
      },
      {
        // ✅ v0.3.0 requires 4th parameter: properties
        inputVerifierProperties: {},
        kmsVerifierProperties: {},
      }
    );
    
    console.log("[fhevmMock] Mock instance created successfully");
    
    return instance as unknown as FhevmInstance;
  } catch (error) {
    console.error("[fhevmMock] Failed to load @fhevm/mock-utils:", error);
    throw new Error(
      "Failed to load @fhevm/mock-utils. Please ensure it is installed: npm install @fhevm/mock-utils"
    );
  }
}
