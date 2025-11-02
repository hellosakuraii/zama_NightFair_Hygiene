"use client";

import { useMemo } from "react";
import { useApp } from "@/app/providers";

export function useMetaMaskEthersSigner() {
  const { wallet } = useApp();
  const { signer: existingSigner } = wallet;
  
  // Return the signer that's already available from wallet state
  return useMemo(
    () => ({
      ethersSigner: existingSigner,
      ethersReadonlyProvider: null,
      sameChain: { current: () => true },
      sameSigner: { current: () => true },
    }),
    [existingSigner]
  );
}
