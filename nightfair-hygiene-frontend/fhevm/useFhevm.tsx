"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { JsonRpcSigner } from "ethers";
import type { FhevmInstance } from "./fhevmTypes";
import { createFhevmInstance } from "./internal/fhevm";

export interface UseFhevmState {
  instance: FhevmInstance | null;
  isReady: boolean;
  isLoading: boolean;
  error: string | null;
  status: string;
}

export function useFhevm(
  signer: JsonRpcSigner | null,
  chainId: number | null,
  address: string | null,
  eip1193Provider: any | null
) {
  const [state, setState] = useState<UseFhevmState>({
    instance: null,
    isReady: false,
    isLoading: false,
    error: null,
    status: "idle",
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  // Initialize FHEVM instance
  useEffect(() => {
    if (!signer || !chainId || !address || !eip1193Provider) {
      setState({
        instance: null,
        isReady: false,
        isLoading: false,
        error: null,
        status: "idle",
      });
      return;
    }

    // Abort previous operation (React Strict Mode will cause this to run twice)
    if (abortControllerRef.current) {
      console.log("[useFhevm] Aborting previous FHEVM initialization...");
      abortControllerRef.current.abort();
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const initFhevm = async () => {
      console.log("[useFhevm] Starting FHEVM initialization...");
      console.log("[useFhevm] Chain ID:", chainId);
      console.log("[useFhevm] Address:", address);

      setState((prev) => ({ ...prev, isLoading: true, error: null, status: "loading" }));

      try {
        console.log("[useFhevm] Creating FHEVM instance with EIP-1193 provider...");

        // Create FHEVM instance using EIP-1193 provider
        const instance = await createFhevmInstance({
          provider: eip1193Provider,
          signal: abortController.signal,
          onStatusChange: (status) => {
            console.log("[useFhevm] Status changed:", status);
            setState((prev) => ({ ...prev, status }));
          },
        });

        if (abortController.signal.aborted) {
          console.log("[useFhevm] Aborted after instance creation");
          return;
        }

        console.log("[useFhevm] FHEVM instance created successfully!");

        setState({
          instance,
          isReady: true,
          isLoading: false,
          error: null,
          status: "ready",
        });
      } catch (error: any) {
        if (abortController.signal.aborted) {
          console.log("[useFhevm] FHEVM initialization cancelled (likely due to React Strict Mode)");
          return;
        }

        // 区分 AbortError - 这是正常的清理行为，不是真正的错误
        if (error?.name === "FhevmAbortError") {
          console.log("[useFhevm] FHEVM initialization aborted (normal cleanup)");
          return;
        }

        // 真正的错误才记录
        console.error("[useFhevm] FHEVM initialization failed:", error);
        console.error("[useFhevm] Error details:", {
          message: error?.message || String(error),
          stack: error?.stack,
          name: error?.name || 'Unknown',
        });

        setState({
          instance: null,
          isReady: false,
          isLoading: false,
          error: error?.message || "Failed to initialize FHEVM",
          status: "error",
        });
      }
    };

    initFhevm();

    return () => {
      abortController.abort();
    };
  }, [signer, chainId, address, eip1193Provider]);

  // Placeholder for requestDecryptionSignature (简化版)
  const requestDecryptionSignature = useCallback(async () => {
    if (!state.instance || !signer || !address) {
      throw new Error("FHEVM not ready or wallet not connected");
    }

    // 这里应该调用 FhevmDecryptionSignature.loadOrSign
    // 参考 frontend/hooks/useFHECounter.tsx 第 289-295 行
    console.log("requestDecryptionSignature called (placeholder)");

    return {
      signature: "placeholder",
      publicKey: "placeholder",
      privateKey: "placeholder",
    };
  }, [state.instance, signer, address]);

  return {
    ...state,
    requestDecryptionSignature,
  };
}
