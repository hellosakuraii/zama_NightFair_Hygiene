"use client";

import { useState, useEffect, useCallback } from "react";
import { BrowserProvider, JsonRpcSigner } from "ethers";
import type { EIP1193Provider } from "./Eip6963Types";

export interface WalletState {
  address: string | null;
  chainId: number | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
}

const INITIAL_STATE: WalletState = {
  address: null,
  chainId: null,
  isConnected: false,
  isConnecting: false,
  error: null,
};

export function useMetaMaskProvider(provider: EIP1193Provider | null) {
  const [state, setState] = useState<WalletState>(INITIAL_STATE);
  const [ethersProvider, setEthersProvider] = useState<BrowserProvider | null>(null);
  const [signer, setSigner] = useState<JsonRpcSigner | null>(null);
  const [eip1193Provider, setEip1193Provider] = useState<EIP1193Provider | null>(null);

  // Initialize ethers provider
  useEffect(() => {
    if (provider) {
      const browserProvider = new BrowserProvider(provider);
      setEthersProvider(browserProvider);
      setEip1193Provider(provider); // Keep original EIP-1193 provider for FHEVM
    } else {
      setEthersProvider(null);
      setSigner(null);
      setEip1193Provider(null);
    }
  }, [provider]);

  // Silent reconnect on mount (eth_accounts)
  useEffect(() => {
    if (!provider || typeof window === "undefined") return;

    const attemptReconnect = async () => {
      try {
        const connected = localStorage.getItem("wallet.connected");
        const lastAccounts = localStorage.getItem("wallet.lastAccounts");
        const lastChainId = localStorage.getItem("wallet.lastChainId");

        if (connected === "true" && lastAccounts) {
          // Silent reconnect using eth_accounts (no popup)
          const accounts = (await provider.request({
            method: "eth_accounts",
          })) as string[];

          if (accounts && accounts.length > 0) {
            const chainIdHex = (await provider.request({
              method: "eth_chainId",
            })) as string;
            const chainId = parseInt(chainIdHex, 16);

            setState({
              address: accounts[0],
              chainId,
              isConnected: true,
              isConnecting: false,
              error: null,
            });

            // Get signer
            if (ethersProvider) {
              const signerInstance = await ethersProvider.getSigner();
              setSigner(signerInstance);
            }
          }
        }
      } catch (error) {
        console.error("Silent reconnect failed:", error);
        // Clear stale connection state
        localStorage.removeItem("wallet.connected");
      }
    };

    attemptReconnect();
  }, [provider, ethersProvider]);

  // Connect (eth_requestAccounts - shows wallet popup)
  const connect = useCallback(async () => {
    if (!provider) {
      setState((prev) => ({ ...prev, error: "No provider selected" }));
      return;
    }

    setState((prev) => ({ ...prev, isConnecting: true, error: null }));

    try {
      const accounts = (await provider.request({
        method: "eth_requestAccounts",
      })) as string[];

      if (accounts && accounts.length > 0) {
        const chainIdHex = (await provider.request({
          method: "eth_chainId",
        })) as string;
        const chainId = parseInt(chainIdHex, 16);

        setState({
          address: accounts[0],
          chainId,
          isConnected: true,
          isConnecting: false,
          error: null,
        });

        // Persist connection
        localStorage.setItem("wallet.connected", "true");
        localStorage.setItem("wallet.lastAccounts", JSON.stringify(accounts));
        localStorage.setItem("wallet.lastChainId", chainId.toString());

        // Get signer
        if (ethersProvider) {
          const signerInstance = await ethersProvider.getSigner();
          setSigner(signerInstance);
        }
      }
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        isConnecting: false,
        error: error.message || "Connection failed",
      }));
    }
  }, [provider, ethersProvider]);

  // Disconnect
  const disconnect = useCallback(() => {
    setState(INITIAL_STATE);
    setSigner(null);

    // Clear persistence
    localStorage.removeItem("wallet.connected");
    localStorage.removeItem("wallet.lastAccounts");
    localStorage.removeItem("wallet.lastChainId");
    
    // Clear FHEVM signatures (all accounts)
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("fhevm.decryptionSignature.")) {
        localStorage.removeItem(key);
      }
    });
  }, []);

  // Event listeners
  useEffect(() => {
    if (!provider) return;

    const handleAccountsChanged = (accounts: unknown) => {
      const accountsArray = accounts as string[];
      if (accountsArray.length === 0) {
        disconnect();
      } else {
        setState((prev) => ({ ...prev, address: accountsArray[0] }));
        localStorage.setItem("wallet.lastAccounts", JSON.stringify(accountsArray));

        // Update signer
        if (ethersProvider) {
          ethersProvider.getSigner().then(setSigner);
        }
      }
    };

    const handleChainChanged = (chainIdHex: unknown) => {
      const chainId = parseInt(chainIdHex as string, 16);
      setState((prev) => ({ ...prev, chainId }));
      localStorage.setItem("wallet.lastChainId", chainId.toString());
      
      // Refresh page as recommended by MetaMask
      window.location.reload();
    };

    const handleDisconnect = () => {
      disconnect();
    };

    provider.request({ method: "eth_accounts" }).then((accounts) => {
      if ((accounts as string[]).length > 0) {
        handleAccountsChanged(accounts);
      }
    });

    // Add listeners (using 'on' if available, or addEventListener)
    if ("on" in provider && typeof provider.on === "function") {
      provider.on("accountsChanged", handleAccountsChanged);
      provider.on("chainChanged", handleChainChanged);
      provider.on("disconnect", handleDisconnect);

      return () => {
        if ("removeListener" in provider && typeof provider.removeListener === "function") {
          provider.removeListener("accountsChanged", handleAccountsChanged);
          provider.removeListener("chainChanged", handleChainChanged);
          provider.removeListener("disconnect", handleDisconnect);
        }
      };
    }
  }, [provider, ethersProvider, disconnect]);

  // Switch chain
  const switchChain = useCallback(
    async (chainId: number) => {
      if (!provider) return;

      try {
        await provider.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: `0x${chainId.toString(16)}` }],
        });
      } catch (error: any) {
        if (error.code === 4902) {
          // Chain not added, could add it here
          setState((prev) => ({ ...prev, error: "Chain not found in wallet" }));
        } else {
          setState((prev) => ({ ...prev, error: error.message }));
        }
      }
    },
    [provider]
  );

  return {
    ...state,
    provider: ethersProvider,
    signer,
    eip1193Provider, // Original EIP-1193 provider for FHEVM
    connect,
    disconnect,
    switchChain,
  };
}

