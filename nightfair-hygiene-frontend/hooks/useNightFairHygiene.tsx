"use client";

import { useEffect, useState } from "react";
import { Contract } from "ethers";
import { useApp } from "@/app/providers";

// Import ABI (will be generated)
let NightFairHygieneABI: any = [];
let NightFairHygieneAddresses: Record<number, string> = {};

// Dynamically import ABI
if (typeof window !== "undefined") {
  import("@/abi/NightFairHygieneABI").then((mod) => {
    NightFairHygieneABI = mod.NightFairHygieneABI;
  }).catch(() => {
    console.warn("ABI not found, please run genabi script");
  });

  import("@/abi/NightFairHygieneAddresses").then((mod) => {
    NightFairHygieneAddresses = mod.NightFairHygieneAddresses;
  }).catch(() => {
    console.warn("Addresses not found");
  });
}

export function useNightFairHygiene() {
  const { wallet, fhevm } = useApp();
  const [contract, setContract] = useState<Contract | null>(null);
  const [contractAddress, setContractAddress] = useState<string | null>(null);

  useEffect(() => {
    if (!wallet.signer || !wallet.chainId) {
      setContract(null);
      setContractAddress(null);
      return;
    }

    const address = NightFairHygieneAddresses[wallet.chainId];
    if (!address) {
      console.warn(`No contract address for chain ${wallet.chainId}`);
      return;
    }

    const contractInstance = new Contract(address, NightFairHygieneABI, wallet.signer);
    setContract(contractInstance);
    setContractAddress(address);
  }, [wallet.signer, wallet.chainId]);

  return {
    contract,
    contractAddress,
    isReady: !!contract && fhevm.isReady,
    fhevmInstance: fhevm.instance,
  };
}

