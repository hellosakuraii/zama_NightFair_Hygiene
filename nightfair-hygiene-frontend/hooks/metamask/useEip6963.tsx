"use client";

import { useEffect, useState, useCallback } from "react";
import type { EIP6963ProviderDetail, EIP6963AnnounceProviderEvent } from "./Eip6963Types";

export function useEip6963() {
  const [providers, setProviders] = useState<EIP6963ProviderDetail[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<EIP6963ProviderDetail | null>(null);

  useEffect(() => {
    let fallbackTimer: NodeJS.Timeout;

    const handleAnnouncement = (event: EIP6963AnnounceProviderEvent) => {
      console.log("[EIP-6963] Provider announced:", event.detail.info.name);
      setProviders((prevProviders) => {
        // Avoid duplicates
        const exists = prevProviders.some((p) => p.info.uuid === event.detail.info.uuid);
        if (exists) return prevProviders;
        return [...prevProviders, event.detail];
      });
    };

    // Listen for provider announcements
    window.addEventListener("eip6963:announceProvider", handleAnnouncement as EventListener);

    // Request providers to announce themselves
    console.log("[EIP-6963] Requesting providers...");
    window.dispatchEvent(new Event("eip6963:requestProvider"));

    // Fallback: check for legacy window.ethereum after a delay
    fallbackTimer = setTimeout(() => {
      setProviders((currentProviders) => {
        if (currentProviders.length === 0 && typeof window !== "undefined" && (window as any).ethereum) {
          console.log("[EIP-6963] No EIP-6963 providers, falling back to window.ethereum");
          const legacyProvider: EIP6963ProviderDetail = {
            info: {
              rdns: "legacy.metamask",
              uuid: "legacy-metamask",
              name: "MetaMask (Legacy)",
              icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32'><rect fill='%23f6851b' width='32' height='32'/></svg>",
            },
            provider: (window as any).ethereum,
          };
          return [legacyProvider];
        }
        return currentProviders;
      });
    }, 500);

    return () => {
      window.removeEventListener("eip6963:announceProvider", handleAnnouncement as EventListener);
      if (fallbackTimer) clearTimeout(fallbackTimer);
    };
  }, []);

  const selectProvider = useCallback((rdns: string) => {
    setProviders((prevProviders) => {
      const provider = prevProviders.find((p) => p.info.rdns === rdns);
      if (provider) {
        setSelectedProvider(provider);
        // Persist selection
        if (typeof window !== "undefined") {
          localStorage.setItem("wallet.lastConnectorId", rdns);
        }
      }
      return prevProviders;
    });
  }, []);

  // Auto-select last used provider or first available
  useEffect(() => {
    if (typeof window !== "undefined" && providers.length > 0 && !selectedProvider) {
      const lastConnectorId = localStorage.getItem("wallet.lastConnectorId");
      
      let providerToSelect: EIP6963ProviderDetail | undefined;
      
      if (lastConnectorId) {
        // Try to find last used provider
        providerToSelect = providers.find((p) => p.info.rdns === lastConnectorId);
      }
      
      // If no last provider or not found, select first available
      if (!providerToSelect && providers.length > 0) {
        providerToSelect = providers[0];
      }
      
      if (providerToSelect) {
        setSelectedProvider(providerToSelect);
      }
    }
  }, [providers, selectedProvider]);

  return { providers, selectedProvider, selectProvider };
}

