"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { BrowserProvider, JsonRpcSigner } from "ethers";
import { useEip6963 } from "@/hooks/metamask/useEip6963";
import { useMetaMaskProvider, type WalletState } from "@/hooks/metamask/useMetaMaskProvider";
import { useFhevm, type UseFhevmState } from "@/fhevm/useFhevm";
import { isSupportedChain } from "@/fhevm/internal/constants";
import { InMemoryStorageProvider } from "@/hooks/useInMemoryStorage";

export interface AppContextType {
  // Wallet
  wallet: WalletState & {
    provider: BrowserProvider | null;
    signer: JsonRpcSigner | null;
    connect: () => Promise<void>;
    disconnect: () => void;
    switchChain: (chainId: number) => Promise<void>;
    isSupported: boolean;
  };
  // FHEVM
  fhevm: UseFhevmState;
  // Wallet picker
  walletPicker: {
    providers: Array<{ info: { rdns: string; name: string }; provider: unknown }>;
    selectedProvider: { info: { rdns: string; name: string }; provider: unknown } | null;
    selectProvider: (rdns: string) => void;
    isOpen: boolean;
    open: () => void;
    close: () => void;
  };
}

const AppContext = createContext<AppContextType | null>(null);

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
}

interface AppProviderProps {
  children: ReactNode;
}

function AppProviderInner({ children }: AppProviderProps) {
  const { providers, selectedProvider, selectProvider } = useEip6963();
  const [isWalletPickerOpen, setIsWalletPickerOpen] = useState(false);

  const walletState = useMetaMaskProvider(selectedProvider?.provider || null);
  const fhevmState = useFhevm(
    walletState.signer,
    walletState.chainId,
    walletState.address,
    walletState.eip1193Provider
  );

  const isSupported = walletState.chainId ? isSupportedChain(walletState.chainId) : false;

  // 包装 connect 函数，如果没有 provider 则先提示
  const handleConnect = async () => {
    console.log("[Connect] Attempting to connect wallet...");
    console.log("[Connect] Providers found:", providers.length);
    console.log("[Connect] Selected provider:", selectedProvider?.info.name);

    if (!selectedProvider && providers.length === 0) {
      console.error("No wallet providers found. Please install MetaMask or another Web3 wallet.");
      alert("No wallet found. Please install MetaMask or another Web3 wallet.");
      return;
    }

    if (!selectedProvider && providers.length > 0) {
      console.log("[Connect] Auto-selecting first provider:", providers[0].info.name);
      // Auto-select first provider
      selectProvider(providers[0].info.rdns);
      // Wait a bit for the provider to be set
      setTimeout(() => {
        console.log("[Connect] Calling connect after provider selection...");
        walletState.connect();
      }, 100);
      return;
    }

    // Provider is already selected, just connect
    console.log("[Connect] Calling connect with selected provider...");
    await walletState.connect();
  };

  const value: AppContextType = {
    wallet: {
      ...walletState,
      connect: handleConnect,
      isSupported,
    },
    fhevm: fhevmState,
    walletPicker: {
      providers,
      selectedProvider,
      selectProvider,
      isOpen: isWalletPickerOpen,
      open: () => setIsWalletPickerOpen(true),
      close: () => setIsWalletPickerOpen(false),
    },
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function AppProvider({ children }: AppProviderProps) {
  return (
    <InMemoryStorageProvider>
      <AppProviderInner>
        {children}
      </AppProviderInner>
    </InMemoryStorageProvider>
  );
}

